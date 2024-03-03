import dayjs from "dayjs";

export function formatDate(date: dayjs.Dayjs | Date) {
    const currentDate = dayjs();

    date = dayjs(date);

    if (date.year() !== currentDate.year()) {
        return date.format("D. M. YYYY");
    }

    return date.format("D. M.");
}
