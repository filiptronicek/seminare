import { z } from "zod";
import { CLASSES, EVENT_TYPE } from "./constants";

export const seminarSchema = z.object({
    requiredHours: z.number(),
    availableBranches: z.array(z.object({ id: z.string(), label: z.string() })),
});

export const seminarOptionSchema = z.object({
    hoursPerWeek: z.number(),
    branch: z.object({ id: z.string(), label: z.string() }),
});

export const singleEventSchema = z.object({
    title: z.string().max(255, "Akce nesmí mít delší název než 255 znaků").min(1, "Akce musí mít název"),
    description: z.string().optional(),
    allowMultipleSelections: z.boolean(),
    signup: z.object({
        from: z.date(),
        to: z.date(),
    }),
    happening: z.object({
        from: z.date(),
        to: z.date(),
    }),
    metadata: seminarSchema.optional(),
    visibleToClasses: z.array(z.enum(CLASSES)),
    type: z.nativeEnum(EVENT_TYPE),
});

export const singleEventUpdateSchema = z.object({
    id: z.string().uuid(),
    data: singleEventSchema.partial(),
});

export const singleOptionSchema = z.object({
    title: z.string().max(255, "Možnost nesmí mít delší název než 255 znaků").min(1, "Možnost musí mít název"),
    maxParticipants: z.number().int().nonnegative().optional(),
    description: z.string().optional(),
    metadata: seminarOptionSchema.optional(),
});

export const singleOptionUpdateSchema = z.object({
    id: z.string().uuid(),
    data: singleOptionSchema.partial(),
});

export const singleOptionCreateSchema = z.object({
    eventId: z.string().uuid(),
    data: singleOptionSchema,
});
