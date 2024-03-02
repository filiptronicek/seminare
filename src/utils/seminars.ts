import { z } from "zod";

const seminarSchema = z.object({
    requiredHours: z.number(),
    availableBranches: z.array(z.object({ id: z.string(), label: z.string() })),
});

const seminarOptionSchema = z.object({
    hoursPerWeek: z.number(),
    branch: z.object({ id: z.string(), label: z.string() }),
});

export const parseSeminarMeta = (data: unknown): z.infer<typeof seminarSchema> => {
    return seminarSchema.parse(data);
};

export const parseSeminarOptionMeta = (data: unknown): z.infer<typeof seminarOptionSchema> => {
    return seminarOptionSchema.parse(data);
};
