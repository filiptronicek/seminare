import { z } from "zod";
import { CLASSES, EVENT_TYPE } from "./constants";
import type { SingleEventOption } from "@prisma/client";

// A bit of a stretch, but it looks actually pretty cool tbh
export const letterSchema = z.union([z.literal("A"), z.literal("B"), z.literal("C"), z.literal("D"), z.literal("E"), z.literal("F"), z.literal("G"), z.literal("H"), z.literal("I"), z.literal("J"), z.literal("K"), z.literal("L"), z.literal("M"), z.literal("N"), z.literal("O"), z.literal("P"), z.literal("Q"), z.literal("R"), z.literal("S"), z.literal("T"), z.literal("U"), z.literal("V"), z.literal("W"), z.literal("X"), z.literal("Y"), z.literal("Z")]);

export const seminarBranchSchema = z
    .object({
        id: z.string(),
        label: z.string(),
        type: z.literal("unbound"),
    })
    .or(
        z.object({
            id: z.string(),
            label: z.string(),
            type: z.literal("oneof"),
            boundWith: letterSchema,
        }),
    );

export type Letter = z.infer<typeof letterSchema>;
export type Branch = z.infer<typeof seminarBranchSchema>;
export type SeminarOptionEnrichedWithUserCount = SingleEventOption & {
    _count: { students: number };
};

export const seminarMetadataSchema = z.object({
    requiredHours: z.number().int().positive("Počet hodin musí být vyšší než 0"),
    availableBranches: z
        .array(seminarBranchSchema)
        .default([{ id: "universal", label: "Univerzální", type: "unbound" }]),
});

export const seminarOptionMetadataSchema = z.object({
    hoursPerWeek: z.number().int().nonnegative("Počet hodin týdně nesmí být záporný"),
    branch: z.string().default("universal"),
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
    metadata: seminarMetadataSchema.partial().optional(),
    visibleToClasses: z.array(z.enum(CLASSES)),
    type: z.nativeEnum(EVENT_TYPE),
});

export const singleEventUpdateSchema = z.object({
    id: z.string().uuid(),
    data: singleEventSchema.partial(),
});

export const singleOptionSchema = z.object({
    title: z.string().max(255, "Možnost nesmí mít delší název než 255 znaků").min(1, "Možnost musí mít název"),
    maxParticipants: z.number().int().optional(),
    description: z.string().optional(),
    metadata: seminarOptionMetadataSchema.partial().optional(),
});

export const singleOptionUpdateSchema = z.object({
    id: z.string().uuid(),
    data: singleOptionSchema.partial(),
});

export const singleOptionCreateSchema = z.object({
    eventId: z.string().uuid(),
    data: singleOptionSchema,
});

export const singleUserSchema = z.object({
    class: z.enum(CLASSES),
    role: z.enum(["user", "admin"]).optional(),
});

export const singleUserUpdateSchema = z.object({
    id: z.string().uuid().optional(),
    data: singleUserSchema.partial(),
});

export const uuid = z.string().uuid();
