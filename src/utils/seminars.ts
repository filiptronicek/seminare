import { type z } from "zod";
import { seminarOptionMetadataSchema, seminarMetadataSchema } from "./schemas";

export const parseSeminarMeta = (data: unknown): z.infer<typeof seminarMetadataSchema> => {
    return seminarMetadataSchema.parse(data);
};

export const parseSeminarMetaSafe = (data: unknown): z.infer<typeof seminarMetadataSchema> | undefined => {
    try {
        return seminarMetadataSchema.parse(data);
    } catch {
        return undefined;
    }
};

export const parseSeminarOptionMeta = (data: unknown): z.infer<typeof seminarOptionMetadataSchema> => {
    return seminarOptionMetadataSchema.parse(data);
};

export const parseSeminarOptionMetaSafe = (data: unknown): z.infer<typeof seminarOptionMetadataSchema> | undefined => {
    try {
        return seminarOptionMetadataSchema.parse(data);
    } catch {
        return undefined;
    }
};
