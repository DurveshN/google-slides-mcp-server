/**
 * Validation functions for Google Slides API inputs
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate Google Object ID format
 * Google IDs are 5-50 characters and can contain alphanumeric, underscore, dash, and colon
 */
export function isValidObjectId(id: string): ValidationResult {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'ID must be a non-empty string' };
  }

  if (id.length < 5 || id.length > 50) {
    return { valid: false, error: 'ID must be between 5 and 50 characters' };
  }

  const objectIdRegex = /^[a-zA-Z0-9_\-\:]+$/;
  if (!objectIdRegex.test(id)) {
    return { valid: false, error: 'ID contains invalid characters. Only alphanumeric, underscore, dash, and colon are allowed' };
  }

  return { valid: true };
}

/**
 * Validate Google Presentation ID format
 * Google Presentation IDs follow a specific format
 */
export function isValidPresentationId(id: string): ValidationResult {
  const result = isValidObjectId(id);

  if (!result.valid) {
    return result;
  }

  // Google Presentation IDs typically have specific patterns
  // This is a basic validation - adjust based on actual Google ID format
  if (id.length < 10) {
    return { valid: false, error: 'Presentation ID appears to be invalid' };
  }

  return { valid: true };
}

/**
 * Check if text is within maximum length
 */
export function isWithinLength(text: string, maxLength: number): ValidationResult {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Text must be a non-empty string' };
  }

  if (text.length > maxLength) {
    return { valid: false, error: `Text exceeds maximum length of ${maxLength} characters` };
  }

  return { valid: true };
}

/**
 * Validate URL format (HTTP/HTTPS only)
 */
export function isValidUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  const urlRegex = /^https?:\/\/.+/i;
  if (!urlRegex.test(url)) {
    return { valid: false, error: 'URL must be a valid HTTP or HTTPS URL' };
  }

  return { valid: true };
}

/**
 * Validate presentation ID and return error if invalid
 * Throws ValidationError if invalid
 */
export function validatePresentationId(id: string): void {
  const result = isValidPresentationId(id);
  if (!result.valid) {
    throw new Error(result.error);
  }
}

/**
 * Validate object ID and return error if invalid
 * Throws ValidationError if invalid
 */
export function validateObjectId(id: string): void {
  const result = isValidObjectId(id);
  if (!result.valid) {
    throw new Error(result.error);
  }
}

/**
 * Validate text length and return error if invalid
 * Throws ValidationError if invalid
 */
export function validateTextLength(text: string, maxLength: number): void {
  const result = isWithinLength(text, maxLength);
  if (!result.valid) {
    throw new Error(result.error);
  }
}

/**
 * Validate URL and return error if invalid
 * Throws ValidationError if invalid
 */
export function validateUrl(url: string): void {
  const result = isValidUrl(url);
  if (!result.valid) {
    throw new Error(result.error);
  }
}