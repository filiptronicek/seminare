import { EVENT_TYPE } from "./constants";

export const displayEventType = (eventType: EVENT_TYPE): string => {
    switch (eventType) {
        case EVENT_TYPE.WANDERTAG:
            return "Wandertag";
        case EVENT_TYPE.SEMINAR:
            return "Semináře";
        case EVENT_TYPE.PROJECT_WEEK:
            return "Projektový týden";
        case EVENT_TYPE.UNSPECIFIED:
        default:
            return "Jiné";
    }
};

export const formatHourCount = (hours: number) => {
    if (hours === 1) {
        return "1 hodina";
    }
    if (hours < 5) {
        return `${hours} hodiny`;
    }

    return `${hours} hodin`;
};
