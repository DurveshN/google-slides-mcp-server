import { z } from "zod";

/**
 * Structured plan schema for presentation/deck generation.
 * Defines the shape of deck plans, slide plans, content blocks, and execution state.
 */

export const DeckTypeEnum = z.enum(["pitch", "sales", "training", "conference", "data"]);
export type DeckType = z.infer<typeof DeckTypeEnum>;

export const SlideStatusEnum = z.enum(["planned", "approved", "executed", "modified"]);
export type SlideStatus = z.infer<typeof SlideStatusEnum>;

export const SlideExecutionPlanSchema = z.object({
  slideId: z.string(),
  toolCalls: z.array(
    z.object({
      tool: z.string(),
      params: z.record(z.unknown()),
      reason: z.string(),
    })
  ),
  imagesUsed: z.array(z.string()).optional(),
  creativeRationale: z.string(),
});
export type SlideExecutionPlan = z.infer<typeof SlideExecutionPlanSchema>;

export const ContentBlockSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), text: z.string() }),
  z.object({ kind: z.literal("bullets"), items: z.array(z.string()) }),
  z.object({
    kind: z.literal("metric"),
    label: z.string(),
    value: z.string(),
    change: z.string().optional(),
  }),
  z.object({
    kind: z.literal("table"),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
  z.object({
    kind: z.literal("image"),
    url: z.string(),
    alt: z.string().optional(),
  }),
  z.object({
    kind: z.literal("generate_image"),
    prompt: z.string(),
    size: z.string().optional(),
  }),
  z.object({
    kind: z.literal("icon"),
    name: z.string(),
    label: z.string().optional(),
  }),
  z.object({
    kind: z.literal("shape"),
    shapeType: z.string(),
    color: z.string().optional(),
  }),
  z.object({
    kind: z.literal("chart"),
    chartType: z.string(),
    data: z.unknown(),
  }),
  z.object({
    kind: z.literal("quote"),
    text: z.string(),
    attribution: z.string().optional(),
  }),
]);
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

export const SlidePlanSchema = z.object({
  id: z.string(),
  role: z.string(),
  actionTitle: z.string(),
  layout: z.string(),
  purpose: z.string(),
  contentBlocks: z.array(ContentBlockSchema),
  visualDirection: z.string().optional(),
  status: SlideStatusEnum.default("planned"),
  notes: z.string().optional(),
});
export type SlidePlan = z.infer<typeof SlidePlanSchema>;

export const ApprovalStateSchema = z.object({
  outlineApproved: z.boolean(),
  detailApproved: z.boolean(),
  executionApproved: z.boolean(),
});
export type ApprovalState = z.infer<typeof ApprovalStateSchema>;

export const DeckPlanSchema = z.object({
  version: z.literal("1.0"),
  deck: z.object({
    title: z.string(),
    type: DeckTypeEnum,
    audience: z.string(),
    durationMinutes: z.number().optional(),
    theme: z.string().optional(),
    slides: z.array(SlidePlanSchema),
    approval: ApprovalStateSchema,
  }),
});
export type DeckPlan = z.infer<typeof DeckPlanSchema>;

export const SlideStateSchema = z.object({
  planId: z.string(),
  googleSlideId: z.string(),
  elementIds: z.record(z.string(), z.string()).optional(),
});
export type SlideState = z.infer<typeof SlideStateSchema>;

export const DeckStateSchema = z.object({
  presentationId: z.string(),
  slides: z.array(SlideStateSchema),
  lastUpdated: z.string().datetime(),
});
export type DeckState = z.infer<typeof DeckStateSchema>;
