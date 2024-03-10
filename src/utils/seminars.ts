import { type z } from "zod";
import { seminarOptionSchema, seminarSchema } from "./schemas";

export const parseSeminarMeta = (data: unknown): z.infer<typeof seminarSchema> => {
    return seminarSchema.parse(data);
};

export const parseSeminarMetaSafe = (data: unknown): z.infer<typeof seminarSchema> | undefined => {
    try {
        return seminarSchema.parse(data);
    } catch {
        return undefined;
    }
};

export const parseSeminarOptionMeta = (data: unknown): z.infer<typeof seminarOptionSchema> => {
    return seminarOptionSchema.parse(data);
};

export const parseSeminarOptionMetaSafe = (data: unknown): z.infer<typeof seminarOptionSchema> | undefined => {
    try {
        return seminarOptionSchema.parse(data);
    } catch {
        return undefined;
    }
};
