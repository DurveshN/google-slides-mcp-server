/**
 * Custom error classes for Google Slides API errors
 */

export interface ErrorDetails {
  code?: number;
  message: string;
  details?: Record<string, unknown>;
}

export class GoogleSlidesError extends Error {
  public readonly code: number;
  public readonly details: Record<string, unknown> | undefined;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'GoogleSlidesError';
    this.code = details.code ?? 0;
    this.details = details.details;
  }

  /**
   * Get user-friendly error message based on HTTP status code
   */
  static getUserMessage(code: number, message: string): string {
    const userMessages: Record<number, string> = {
      400: 'Invalid request',
      401: 'Authentication expired. Please re-authenticate.',
      403: 'Permission denied. Check your access rights.',
      404: 'Resource not found.',
      429: 'Rate limit exceeded. Please try again later.',
      500: 'Service unavailable. Please try again later.',
      501: 'Service not implemented.',
      502: 'Bad gateway. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. Please try again later.',
    };

    return userMessages[code] ?? message;
  }

  /**
   * Create error from HTTP response
   */
  static fromResponse(status: number, body: unknown): GoogleSlidesError {
    const message = typeof body === 'string'
      ? body
      : body && typeof body === 'object' && 'error' in body
      ? String(body.error)
      : `HTTP ${status}`;

    return new GoogleSlidesError({
      code: status,
      message: GoogleSlidesError.getUserMessage(status, message),
      details: typeof body === 'object' ? (body as Record<string, unknown>) : undefined,
    });
  }

  /**
   * Create error from network error
   */
  static fromNetworkError(error: Error): GoogleSlidesError {
    return new GoogleSlidesError({
      code: 0,
      message: `Network error: ${error.message}`,
      details: { originalError: error.message },
    });
  }

  /**
   * Create error from API error response
   */
  static fromApiError(error: { code?: number; message: string; details?: unknown }): GoogleSlidesError {
    return new GoogleSlidesError({
      code: error.code ?? 0,
      message: error.message,
      details: error.details as Record<string, unknown> | undefined,
    });
  }
}

export class AuthenticationError extends GoogleSlidesError {
  constructor(message: string = 'Authentication failed') {
    super({ code: 401, message });
    this.name = 'AuthenticationError';
  }
}

export class PermissionError extends GoogleSlidesError {
  constructor(message: string = 'Permission denied') {
    super({ code: 403, message });
    this.name = 'PermissionError';
  }
}

export class NotFoundError extends GoogleSlidesError {
  constructor(message: string = 'Resource not found') {
    super({ code: 404, message });
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends GoogleSlidesError {
  constructor(message: string = 'Rate limit exceeded') {
    super({ code: 429, message });
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends GoogleSlidesError {
  constructor(message: string = 'Validation failed') {
    super({ code: 400, message });
    this.name = 'ValidationError';
  }
}

export class ServiceUnavailableError extends GoogleSlidesError {
  constructor(message: string = 'Service temporarily unavailable') {
    super({ code: 503, message });
    this.name = 'ServiceUnavailableError';
  }
}

export class QuotaExceededError extends GoogleSlidesError {
  constructor(message: string = 'Google API quota exceeded. Check Google Cloud Console.') {
    super({ code: 429, message });
    this.name = 'QuotaExceededError';
  }
}

export class ConcurrentModificationError extends GoogleSlidesError {
  constructor(message: string = 'Presentation was modified. Please retry.') {
    super({ code: 409, message });
    this.name = 'ConcurrentModificationError';
  }
}

/**
 * Normalize any error into a GoogleSlidesError with user-friendly message
 * Covers all edge cases from Metis review:
 * 1. Token expiry mid-operation → AuthenticationError
 * 2. Network failure → ServiceUnavailableError with retry context
 * 3. Invalid presentation ID (404) → NotFoundError
 * 4. Invalid object ID (400) → ValidationError
 * 5. Google API 5xx → ServiceUnavailableError
 * 6. Rate limit (429) → RateLimitError
 * 7. Quota exceeded → QuotaExceededError
 * 8. Concurrent modification (409) → ConcurrentModificationError
 * 9. Empty required params → ValidationError (should be caught before API call)
 * 10. Text exceeding 10K chars → ValidationError (should be caught before API call)
 * 11. Image URL invalid or too large → ValidationError
 */
export function normalizeError(error: unknown): GoogleSlidesError {
  if (error instanceof GoogleSlidesError) {
    return error;
  }

  const err = error instanceof Error ? error : new Error(String(error));
  const message = err.message;
  const status = (err as { status?: number; code?: number }).status ?? (err as { status?: number; code?: number }).code ?? 0;

  if (status === 401 || message.includes('invalid_token') || message.includes('token expired') || message.includes('Unauthorized')) {
    return new AuthenticationError('Authentication expired. Please re-authenticate.');
  }

  if (message.includes('ECONNRESET') || message.includes('ETIMEDOUT') || message.includes('ENOTFOUND') || message.includes('NetworkError') || message.includes('network') || message.includes('fetch')) {
    return new ServiceUnavailableError('Network error. Please try again later.');
  }

  if (status === 404 || message.includes('not found') || message.includes('Not Found') || message.includes('presentationId')) {
    return new NotFoundError('Resource not found. Check the presentation ID and try again.');
  }

  if (status === 400 || message.includes('Invalid') || message.includes('invalid') || message.includes('malformed')) {
    return new ValidationError(message || 'Invalid request. Check your parameters and try again.');
  }

  if (status >= 500 && status < 600) {
    return new ServiceUnavailableError('Service temporarily unavailable. Please try again later.');
  }

  if (status === 429 || message.includes('rate limit') || message.includes('Rate limit')) {
    return new RateLimitError('Rate limit exceeded. Please try again later.');
  }

  if (message.includes('quota') || message.includes('Quota') || message.includes('QUOTA_EXCEEDED')) {
    return new QuotaExceededError();
  }

  if (status === 409 || message.includes('concurrent') || message.includes('modified') || message.includes('revision')) {
    return new ConcurrentModificationError();
  }

  if (message.includes('text') && message.includes('length')) {
    return new ValidationError(message);
  }

  if (message.includes('URL') || message.includes('url') || message.includes('image')) {
    return new ValidationError(message || 'Invalid image URL. Please provide a valid HTTP/HTTPS URL.');
  }

  return new GoogleSlidesError({
    code: status || 0,
    message: message || 'An unexpected error occurred',
    details: { originalError: message },
  });
}

export function withErrorHandling<TArgs extends Record<string, unknown>, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  context?: string
): (args: TArgs) => Promise<TResult> {
  return async (args: TArgs): Promise<TResult> => {
    try {
      return await fn(args);
    } catch (error) {
      const normalized = normalizeError(error);
      if (context) {
        console.error(`[${context}] Error:`, normalized.message);
      }
      throw normalized;
    }
  };
}