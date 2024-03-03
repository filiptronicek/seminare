import { z } from "zod";
import { CLASSES, EVENT_TYPE } from "./constants";

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
    visibleToClasses: z.array(z.enum(CLASSES)),
    type: z.nativeEnum(EVENT_TYPE),
});

export const singleEventUpdateSchema = z.object({
    id: z.string(),
    data: singleEventSchema.partial(),
});
