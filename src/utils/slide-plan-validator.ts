import {
  DeckPlanSchema,
  DeckStateSchema,
  SlidePlanSchema,
  type DeckPlan,
  type DeckState,
  type SlidePlan,
} from "../types/slide-plan.js";
import type { ZodIssue } from "zod";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

function formatZodIssue(issue: ZodIssue): string {
  const path = issue.path
    .map((segment, index) => {
      if (typeof segment === "number") {
        return `[${segment}]`;
      }
      return index === 0 ? segment : `.${segment}`;
    })
    .join("");

  const message = issue.message;
  return path ? `${path}: ${message}` : message;
}

function formatZodErrors(issues: ZodIssue[]): string[] {
  return issues.map(formatZodIssue);
}

export function validateDeckPlan(data: unknown): ValidationResult<DeckPlan> {
  const result = DeckPlanSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: formatZodErrors(result.error.issues) };
}

export function validateDeckState(data: unknown): ValidationResult<DeckState> {
  const result = DeckStateSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: formatZodErrors(result.error.issues) };
}

export function validateSlidePlan(data: unknown): ValidationResult<SlidePlan> {
  const result = SlidePlanSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: formatZodErrors(result.error.issues) };
}

export function isDeckPlan(data: unknown): data is DeckPlan {
  return DeckPlanSchema.safeParse(data).success;
}

export function isDeckState(data: unknown): data is DeckState {
  return DeckStateSchema.safeParse(data).success;
}
