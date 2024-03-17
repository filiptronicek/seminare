import type { Event } from "@prisma/client";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween)

export const isEventSignupOpen = (event: Event): boolean => {
    const now = dayjs();

    if (!event.signupStartDate || !event.signupEndDate) {
        return false;
    }

    return now.isBetween(dayjs(event.signupStartDate), dayjs(event.signupEndDate));
}

export const compareEvents = (a: Event, b: Event) => {
    // prefer currently active events
    const isSignupOpenA = isEventSignupOpen(a);
    const isSignupOpenB = isEventSignupOpen(b);

    if (isSignupOpenA && !isSignupOpenB) {
        return -1;
    }

    if (!isSignupOpenA && isSignupOpenB) {
        return 1;
    }

    // then prefer events that are starting soon
    const dateA = dayjs(a.startDate);
    const dateB = dayjs(b.startDate);

    if (dateA.isBefore(dateB)) {
        return -1;
    }

    if (dateA.isAfter(dateB)) {
        return 1;
    }

    return 0;
}