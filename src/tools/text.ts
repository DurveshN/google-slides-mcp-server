/**
 * Text Tools - Editing and Styling
 * T10: Text editing (insert, delete, replace)
 * T11: Text styling (font, color, alignment, bullets)
 */

import { batchUpdate } from '../google-client.js';
import { validatePresentationId, validateObjectId } from '../utils/validators.js';
import { normalizeError } from '../utils/errors.js';
import { Retry } from '../utils/retry.js';

const retry = new Retry({ maxRetries: 3 });

/**
 * Insert text into an element
 */
export async function insert_text(slidesClient: any, params: {
  presentationId: string;
  slideId: string;
  elementId: string;
  text: string;
  insertionIndex?: number;
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.slideId);
  validateObjectId(params.elementId);

  if (!params.text || typeof params.text !== 'string') {
    throw new Error('Text must be a non-empty string');
  }

  const request = {
    insertText: {
      objectId: params.elementId,
      text: params.text,
      insertionIndex: params.insertionIndex ?? 0,
    },
  };

  try {
    await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [request],
      }),
      'insert_text'
    );

    return { elementId: params.elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Delete text from an element
 */
export async function delete_text(slidesClient: any, params: {
  presentationId: string;
  slideId: string;
  elementId: string;
  startIndex: number;
  endIndex: number;
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.slideId);
  validateObjectId(params.elementId);

  if (params.startIndex < 0 || params.endIndex < 0) {
    throw new Error('Start and end indices must be non-negative');
  }

  if (params.startIndex > params.endIndex) {
    throw new Error('Start index must be less than or equal to end index');
  }

  const request = {
    deleteText: {
      objectId: params.elementId,
      textRange: {
        type: "FIXED_RANGE",
        startIndex: params.startIndex,
        endIndex: params.endIndex,
      },
    },
  };

  try {
    await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [request],
      }),
      'delete_text'
    );

    return { elementId: params.elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Replace all occurrences of text in an element
 */
export async function replace_all_text(slidesClient: any, params: {
  presentationId: string;
  oldText: string;
  newText: string;
  matchCase?: boolean;
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);

  if (!params.oldText || typeof params.oldText !== 'string') {
    throw new Error('Old text must be a non-empty string');
  }

  if (!params.newText || typeof params.newText !== 'string') {
    throw new Error('New text must be a non-empty string');
  }

  const request = {
    replaceAllText: {
      containsText: {
        text: params.oldText,
        matchCase: params.matchCase ?? false,
      },
      replaceText: params.newText,
    },
  };

  try {
    await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [request],
      }),
      'replace_all_text'
    );

    return { elementId: 'all' };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Update text style
 */
export async function update_text_style(slidesClient: any, params: {
  presentationId: string;
  elementId: string;
  startIndex: number;
  endIndex: number;
  style: {
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontFamily?: string;
    foregroundColor?: string;
  };
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.elementId);

  if (params.startIndex < 0 || params.endIndex < 0) {
    throw new Error('Start and end indices must be non-negative');
  }

  if (params.startIndex > params.endIndex) {
    throw new Error('Start index must be less than or equal to end index');
  }

  const textStyle: any = {};

  if (params.style.fontSize !== undefined) {
    textStyle.fontSize = {
      magnitude: params.style.fontSize,
      unit: 'PT',
    };
  }

  if (params.style.bold !== undefined) {
    textStyle.bold = params.style.bold;
  }

  if (params.style.italic !== undefined) {
    textStyle.italic = params.style.italic;
  }

  if (params.style.underline !== undefined) {
    textStyle.underline = params.style.underline;
  }

  if (params.style.fontFamily !== undefined) {
    textStyle.fontFamily = params.style.fontFamily;
  }

  if (params.style.foregroundColor !== undefined) {
    textStyle.foregroundColor = {
      opaqueColor: {
        rgbColor: hexToRgb(params.style.foregroundColor),
      },
    };
  }

  const request = {
    updateTextStyle: {
      objectId: params.elementId,
      textRange: {
        type: "FIXED_RANGE",
        startIndex: params.startIndex,
        endIndex: params.endIndex,
      },
      style: textStyle,
      fields: Object.keys(textStyle).join(','),
    },
  };

  try {
    await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [request],
      }),
      'update_text_style'
    );

    return { elementId: params.elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Update paragraph style
 */
export async function update_paragraph_style(slidesClient: any, params: {
  presentationId: string;
  elementId: string;
  startIndex: number;
  endIndex: number;
  style: {
    alignment?: 'UNSPECIFIED' | 'START' | 'CENTER' | 'END' | 'JUSTIFIED';
    lineSpacing?: number;
  };
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.elementId);

  if (params.startIndex < 0 || params.endIndex < 0) {
    throw new Error('Start and end indices must be non-negative');
  }

  if (params.startIndex > params.endIndex) {
    throw new Error('Start index must be less than or equal to end index');
  }

  const paragraphStyle: any = {};

  if (params.style.alignment !== undefined) {
    paragraphStyle.alignment = params.style.alignment;
  }

  if (params.style.lineSpacing !== undefined) {
    paragraphStyle.lineSpacing = {
      magnitude: params.style.lineSpacing,
      unit: 'PT',
    };
  }

  const request = {
    updateParagraphStyle: {
      objectId: params.elementId,
      textRange: {
        type: "FIXED_RANGE",
        startIndex: params.startIndex,
        endIndex: params.endIndex,
      },
      style: paragraphStyle,
      fields: Object.keys(paragraphStyle).join(','),
    },
  };

  try {
    await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [request],
      }),
      'update_paragraph_style'
    );

    return { elementId: params.elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Create paragraph bullets
 */
export async function create_bullets(slidesClient: any, params: {
  presentationId: string;
  elementId: string;
  startIndex: number;
  endIndex: number;
  bulletPreset?: 'BULLET_ARROW' | 'BULLET_DIAMOND' | 'BULLET_DIAMOND_SQUARE' | 'BULLET_DISC' | 'BULLET_DISC_CIRCLE' | 'BULLET_DISC_SQUARE' | 'BULLET_NUMBER' | 'BULLET_NUMBER_TRIANGLE' | 'BULLET_NUMBER_TRIANGLE_WITH_DOTS' | 'BULLET_SQUARE' | 'BULLET_STAR' | 'BULLET_TICK';
}): Promise<{ elementId: string }> {
  validatePresentationId(params.presentationId);
  validateObjectId(params.elementId);

  if (params.startIndex < 0 || params.endIndex < 0) {
    throw new Error('Start and end indices must be non-negative');
  }

  if (params.startIndex > params.endIndex) {
    throw new Error('Start index must be less than or equal to end index');
  }

  const request: any = {
    createParagraphBullets: {
      objectId: params.elementId,
      textRange: {
        type: "FIXED_RANGE",
        startIndex: params.startIndex,
        endIndex: params.endIndex,
      },
    },
  };

  if (params.bulletPreset) {
    request.createParagraphBullets.bulletPreset = params.bulletPreset;
  }

  try {
    await retry.execute(
      () => batchUpdate(slidesClient, {
        presentationId: params.presentationId,
        requests: [request],
      }),
      'create_bullets'
    );

    return { elementId: params.elementId };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  const hexValue = hex.replace('#', '');

  const bigint = parseInt(hexValue, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  return { red: r, green: g, blue: b };
}