import { type Branch } from "./schemas";

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
    "3N",
    // todo: uncomment when available
    // "4N",
] as const;
export type Class = (typeof CLASSES)[number];

export const DEFAULT_AVAILABLE_BRANCHES = [
    { id: "universal", label: "Univerzální", type: "unbound" },
    { id: "humanitarian", label: "Humanitní", type: "oneof", boundWith: "A" },
    { id: "science", label: "Přírodovědná", type: "oneof", boundWith: "A" },
] as const satisfies Branch[];

export enum EVENT_TYPE {
    WANDERTAG = "WANDERTAG",
    SEMINAR = "SEMINAR",
    PROJECT_WEEK = "PROJECT_WEEK",
    UNSPECIFIED = "UNSPECIFIED",
}

export const REPOSITORY = "https://github.com/filiptronicek/seminare";

export const SYSTEM_USER = "system";
