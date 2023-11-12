import dayjs from "dayjs";

export function formatDate(date: dayjs.Dayjs) {
    const currentDate = dayjs();

    if (date.year() !== currentDate.year()) {
        return date.format("D. M. YYYY");
    }

    return date.format("D. M.");
}