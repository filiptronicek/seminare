export const CLASSES = [
    "1G",
    "2G",
    "3G",
    "4G",
    "5G",
    "6G",
    "7G",
    "8G",
    "1N",
    "2N",
    // todo: uncomment when available
    // "3N",
    // "4N",
] as const;
export type Class = (typeof CLASSES)[number];

export const AVAILABLE_BRANCHES = [
    { id: "humanitarian", label: "Humanitní" },
    { id: "science", label: "Přírodovědná" },
    { id: "universal", label: "Univerzální" },
] as const;

export enum EVENT_TYPE {
    WANDERTAG = "WANDERTAG",
    SEMINAR = "SEMINAR",
    PROJECT_WEEK = "PROJECT_WEEK",
    UNSPECIFIED = "UNSPECIFIED",
}
