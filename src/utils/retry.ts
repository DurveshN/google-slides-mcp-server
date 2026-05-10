/**
 * Retry utility with exponential backoff and circuit breaker
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
  circuitBreakerThreshold?: number;
  circuitBreakerResetMs?: number;
}

export interface RetryResult<T> {
  result: T;
  attempts: number;
  wasRetried: boolean;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
}

export class CircuitBreakerOpenError extends Error {
  constructor() {
    super('Circuit breaker is OPEN. Please wait before retrying.');
    this.name = 'CircuitBreakerOpenError';
  }
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 16000,
  retryableStatuses: [429, 500, 501, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'NetworkError'],
  circuitBreakerThreshold: 5,
  circuitBreakerResetMs: 30000,
};

export class Retry {
  private circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    consecutiveFailures: 0,
    lastFailureTime: null,
    nextAttemptTime: null,
  };

  constructor(private options: RetryOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...this.options };
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<RetryResult<T>> {
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts <= this.options.maxRetries!) {
      attempts++;

      // Check circuit breaker
      if (this.circuitBreaker.isOpen) {
        if (Date.now() < (this.circuitBreaker.nextAttemptTime ?? 0)) {
          const waitTime = this.circuitBreaker.nextAttemptTime! - Date.now();
          if (context) {
            console.error(`[Retry] Circuit breaker OPEN. Waiting ${waitTime}ms...`);
          }
          await this.sleep(waitTime);
        } else {
          this.circuitBreaker.isOpen = false;
          this.circuitBreaker.consecutiveFailures = 0;
          if (context) {
            console.error(`[Retry] Circuit breaker CLOSED. Ready to retry.`);
          }
        }
      }

      try {
        const result = await fn();
        this.resetCircuitBreaker();
        return {
          result,
          attempts,
          wasRetried: attempts > 1,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if we should retry
        if (!this.shouldRetry(lastError, attempts)) {
          this.recordFailure();
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempts);
        if (context) {
          console.error(
            `[Retry] Attempt ${attempts}/${this.options.maxRetries} failed. Retrying in ${delay}ms...`
          );
        }

        await this.sleep(delay);
      }
    }

    this.recordFailure();
    throw new RetryError(
      `Max retries (${this.options.maxRetries}) exceeded`,
      lastError!,
      attempts
    );
  }

  /**
   * Check if an error should trigger a retry
   */
  private shouldRetry(error: Error, attempt: number): boolean {
    // Don't retry on circuit breaker open
    if (this.circuitBreaker.isOpen) {
      return false;
    }

    // Don't retry on final attempt
    if (attempt > this.options.maxRetries!) {
      return false;
    }

    // Check status code
    if (error instanceof Error && 'status' in error) {
      const status = (error as { status?: number }).status;
      if (status !== undefined && this.options.retryableStatuses?.includes(status)) {
        return true;
      }
      // Don't retry on non-retryable statuses
      return false;
    }

    // Check error message
    if (error instanceof Error) {
      const errorMessage = error.message.toUpperCase();
      if (this.options.retryableErrors?.some((err) =>
        errorMessage.includes(err)
      )) {
        return true;
      }
    }

    // Don't retry on other errors
    return false;
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.options.initialDelayMs! * Math.pow(2, attempt - 1);
    return Math.min(exponentialDelay, this.options.maxDelayMs!);
  }

  /**
   * Record a failure for circuit breaker
   */
  private recordFailure(): void {
    this.circuitBreaker.consecutiveFailures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (
      this.circuitBreaker.consecutiveFailures >=
      this.options.circuitBreakerThreshold!
    ) {
      this.circuitBreaker.isOpen = true;
      this.circuitBreaker.nextAttemptTime =
        Date.now() + this.options.circuitBreakerResetMs!;
      console.error(
        `[Retry] Circuit breaker OPEN after ${this.circuitBreaker.consecutiveFailures} consecutive failures`
      );
    }
  }

  /**
   * Reset circuit breaker on success
   */
  private resetCircuitBreaker(): void {
    this.circuitBreaker.consecutiveFailures = 0;
    this.circuitBreaker.lastFailureTime = null;
    if (this.circuitBreaker.isOpen) {
      console.error('[Retry] Circuit breaker CLOSED');
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current circuit breaker state
   */
  getCircuitBreakerState(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }

  /**
   * Manually open circuit breaker
   */
  openCircuitBreaker(): void {
    this.circuitBreaker.isOpen = true;
    this.circuitBreaker.nextAttemptTime = Date.now() + this.options.circuitBreakerResetMs!;
    console.error('[Retry] Circuit breaker manually OPENED');
  }

  /**
   * Manually close circuit breaker
   */
  closeCircuitBreaker(): void {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.consecutiveFailures = 0;
    this.circuitBreaker.lastFailureTime = null;
    console.error('[Retry] Circuit breaker manually CLOSED');
  }
}