import { CLASSES, EVENT_TYPE } from "@/lib/constants";
import { z } from "zod";

export const singleEventSchema = z
    .object({
        title: z.string().max(255).min(1),
        description: z.string(),
        allowMultipleSelections: z.boolean(),
        signupStartDate: z.date(),
        signupEndDate: z.date(),
        classes: z.array(z.enum(CLASSES)),
        type: z.nativeEnum(EVENT_TYPE),
    });

export const singleEventUpdateSchema = z.object({
    id: z.string(),
    data: singleEventSchema.partial(),
});