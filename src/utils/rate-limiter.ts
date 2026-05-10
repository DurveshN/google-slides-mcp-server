/**
 * Rate limiter using token bucket algorithm for Google APIs
 */

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  refillRatePerSecond: number;
}

export interface RateLimitMetrics {
  requestsPerMinute: number;
  remainingQuota: number;
  lastRefillTime: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
  metrics: RateLimitMetrics;
}

export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();

  constructor() {
    // Initialize buckets for Slides and Drive
    this.buckets.set('slides', new TokenBucket({
      maxRequestsPerMinute: 60,
      refillRatePerSecond: 1, // 60 requests / 60 seconds = 1 per second
    }));

    this.buckets.set('drive', new TokenBucket({
      maxRequestsPerMinute: 100,
      refillRatePerSecond: 100 / 60, // 100 requests / 60 seconds ≈ 1.67 per second
    }));
  }

  /**
   * Check if a request is allowed and get retry delay if not
   */
  async checkLimit(service: 'slides' | 'drive'): Promise<RateLimitResult> {
    const bucket = this.buckets.get(service);
    if (!bucket) {
      throw new Error(`Unknown service: ${service}`);
    }

    const result = bucket.tryConsume();

    if (result.allowed) {
      return {
        allowed: true,
        metrics: bucket.getMetrics(),
      };
    } else {
      return {
        allowed: false,
        retryAfterMs: result.retryAfterMs,
        metrics: bucket.getMetrics(),
      };
    }
  }

  /**
   * Wait until a request is allowed
   */
  async waitForQuota(service: 'slides' | 'drive'): Promise<void> {
    const result = await this.checkLimit(service);

    if (!result.allowed && result.retryAfterMs) {
      await this.sleep(result.retryAfterMs);
    }
  }

  /**
   * Get current metrics for a service
   */
  getMetrics(service: 'slides' | 'drive'): RateLimitMetrics {
    const bucket = this.buckets.get(service);
    if (!bucket) {
      throw new Error(`Unknown service: ${service}`);
    }
    return bucket.getMetrics();
  }

  /**
   * Reset all rate limiters
   */
  reset(): void {
    this.buckets.forEach((bucket) => bucket.reset());
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Token bucket implementation
 */
class TokenBucket {
  private tokens: number;
  private maxTokens: number;
  private refillRatePerSecond: number;
  private lastRefillTime: number;
  private totalRequests: number;
  private lastMinuteStart: number;

  constructor(config: RateLimitConfig) {
    this.maxTokens = config.maxRequestsPerMinute;
    this.tokens = config.maxRequestsPerMinute;
    this.refillRatePerSecond = config.refillRatePerSecond;
    this.lastRefillTime = Date.now();
    this.totalRequests = 0;
    this.lastMinuteStart = Date.now();
  }

  /**
   * Try to consume a token
   */
  tryConsume(): { allowed: boolean; retryAfterMs?: number } {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      this.totalRequests++;
      return { allowed: true };
    } else {
      const waitTime = (1 - this.tokens) * 1000;
      return { allowed: false, retryAfterMs: Math.ceil(waitTime) };
    }
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTime) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRatePerSecond;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefillTime = now;

    // Reset total requests counter every minute
    if (now - this.lastMinuteStart >= 60000) {
      this.totalRequests = 0;
      this.lastMinuteStart = now;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): RateLimitMetrics {
    return {
      requestsPerMinute: this.totalRequests,
      remainingQuota: Math.max(0, this.tokens),
      lastRefillTime: this.lastRefillTime,
    };
  }

  /**
   * Reset the bucket
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefillTime = Date.now();
    this.totalRequests = 0;
    this.lastMinuteStart = Date.now();
  }
}