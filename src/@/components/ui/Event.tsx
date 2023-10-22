import type { Event } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { buttonVariants } from "./button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar, Mail } from "lucide-react";

import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(calendar);
dayjs.locale(czechLocale);

interface EventProps {
    event: Event;
}

function formatDate(date: dayjs.Dayjs) {
    const inputDate = date;
    const currentDate = dayjs();

    if (inputDate.year() !== currentDate.year()) {
        return inputDate.format("D. M. YYYY");
    }

    return inputDate.format("D. M.");
}

export const SingleEvent = ({ event }: EventProps) => {
    return (
        <Card className="max-w-x">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <>
                    <div className="flex flew-row gap-2">
                        {event.signupStartDate === event.signupEndDate ? (
                            <>
                                <Mail /> {formatDate(dayjs(event.signupStartDate))}
                            </>
                        ) : (
                            <>
                                <Mail /> {formatDate(dayjs(event.signupStartDate))} -{" "}
                                {formatDate(dayjs(event.signupEndDate))}
                            </>
                        )}
                    </div>
                    <div className="flex flew-row gap-2">
                        {event.startDate === event.endDate ? (
                            <>
                                <Calendar /> {formatDate(dayjs(event.startDate))}
                            </>
                        ) : (
                            <>
                                <Calendar /> {formatDate(dayjs(event.startDate))} - {formatDate(dayjs(event.endDate))}
                            </>
                        )}
                    </div>
                </>
                <Link className={cn(buttonVariants({ variant: "default" }), "w-full")} href={`/events/${event.id}`}>
                    Zobrazit
                </Link>
            </CardContent>
        </Card>
    );
};
