# Tool Handler Error Handling Audit Evidence

**Date:** 2026-04-26
**Auditor:** Sisyphus-Junior
**Scope:** All src/tools/*.ts files

## Summary

All 7 tool handler files were audited against 11 edge cases from the Metis review. Prior to this audit, **ZERO** tool handlers had proper try/catch around API calls, **ZERO** used the retry utility, and **ZERO** normalized errors through errors.ts. All issues have been fixed.

## Files Audited

1. `src/tools/presentations.ts`
2. `src/tools/slides.ts`
3. `src/tools/elements.ts`
4. `src/tools/text.ts`
5. `src/tools/batch.ts`
6. `src/tools/properties.ts`
7. `src/tools/drive.ts`

## Edge Case Coverage Matrix

| Edge Case | presentations | slides | elements | text | batch | properties | drive |
|-----------|--------------|--------|----------|------|-------|------------|-------|
| 1. Token expiry mid-operation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2. Network failure (retry) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3. Invalid presentation ID (404) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4. Invalid object ID (400) | N/A | ✅ | ✅ | ✅ | N/A | ✅ | N/A |
| 5. Google API 5xx (retry 3x) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6. Rate limit (429) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7. Quota exceeded | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8. Concurrent modification (409) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9. Empty required params | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10. Text exceeding 10K chars | N/A | N/A | ✅ | N/A | N/A | N/A | N/A |
| 11. Image URL invalid | N/A | N/A | ✅ | N/A | N/A | N/A | N/A |

## Changes Made

### 1. `src/utils/errors.ts`
- Added `QuotaExceededError` class
- Added `ConcurrentModificationError` class
- Added `normalizeError()` function that maps all 11 edge cases to specific error types
- Added `withErrorHandling()` wrapper to ensure no raw errors leak to users

### 2. `src/tools/presentations.ts`
- Added imports: `validatePresentationId`, `withErrorHandling`, `normalizeError`, `Retry`
- Wrapped all 4 API calls (`create`, `get`, `copy`, `delete`) in try/catch with retry
- Added `validatePresentationId()` before API calls
- Wrapped all ToolDefinition handlers with `withErrorHandling()`

### 3. `src/tools/slides.ts`
- Added imports: `validatePresentationId`, `validateObjectId`, `withErrorHandling`, `normalizeError`, `Retry`
- Wrapped all 3 API calls (`createSlide`, `deleteSlide`, `reorderSlides`) in try/catch with retry
- Added `validatePresentationId()` and `validateObjectId()` before API calls
- Wrapped all ToolDefinition handlers with `withErrorHandling()`

### 4. `src/tools/elements.ts`
- Added imports: `normalizeError`, `Retry`
- Wrapped all 4 API calls (`add_image`, `add_table`, `add_text_box`, `add_shape`) in try/catch with retry
- Existing validation for text length (10K chars) and image URL preserved
- All errors normalized through `normalizeError()`

### 5. `src/tools/text.ts`
- Added imports: `normalizeError`, `Retry`
- Wrapped all 6 API calls (`insert_text`, `delete_text`, `replace_all_text`, `update_text_style`, `update_paragraph_style`, `create_bullets`) in try/catch with retry
- All errors normalized through `normalizeError()`

### 6. `src/tools/batch.ts`
- Added imports: `validatePresentationId`, `withErrorHandling`, `normalizeError`, `Retry`
- Wrapped batchUpdate API call in try/catch with retry
- Added `validatePresentationId()` before API call
- Wrapped ToolDefinition handler with `withErrorHandling()`

### 7. `src/tools/properties.ts`
- Added imports: `validatePresentationId`, `validateObjectId`, `withErrorHandling`, `normalizeError`, `Retry`
- Wrapped all 2 API calls (`updatePageProperties`, `updateElementTransform`) in try/catch with retry
- Added `validatePresentationId()` and `validateObjectId()` before API calls
- Wrapped all ToolDefinition handlers with `withErrorHandling()`

### 8. `src/tools/drive.ts`
- Added imports: `validatePresentationId`, `withErrorHandling`, `normalizeError`, `Retry`
- Wrapped all 4 API calls (`list`, `export`, `permissions.create`, `delete`) in try/catch with retry
- Added `validatePresentationId()` before API calls where applicable
- Wrapped all ToolDefinition handlers with `withErrorHandling()`

## Retry Configuration

All tool handlers use a consistent retry configuration:
- `maxRetries: 3`
- `initialDelayMs: 1000` (exponential backoff)
- `maxDelayMs: 16000`
- Retryable statuses: `[429, 500, 501, 502, 503, 504]`
- Retryable errors: `['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'NetworkError']`

## Error Normalization Flow

1. Input validation runs first (catches empty params, invalid IDs, text length, URL format)
2. API call is wrapped in `retry.execute()`
3. If API call fails, error is caught and passed to `normalizeError()`
4. `normalizeError()` maps the error to a specific `GoogleSlidesError` subclass
5. If error occurs at handler level, `withErrorHandling()` catches and normalizes it
6. User receives only normalized, user-friendly error messages

## Verification

- All tool handlers now have try/catch around API calls: **YES**
- Each error type returns distinct, user-friendly message: **YES**
- Retry logic works for transient errors: **YES**
- No raw Google API errors leak to user: **YES**
