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

export const formatFreeSpots = (freeSpots: number) => {
    if (freeSpots === 0) {
        return "Plno";
    }
    if (freeSpots === 1) {
        return "1 volné místo";
    }
    if (freeSpots < 5) {
        return `${freeSpots} volná místa`;
    }

    return `${freeSpots} volných míst`;
};

/**
 * The entire english alphabet
 */
export const abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"] as const;
