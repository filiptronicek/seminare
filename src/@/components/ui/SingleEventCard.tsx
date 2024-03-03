import { cn } from "@/lib/utils";
import type { Event } from "@prisma/client";
import { Calendar, Mail } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";
import { useMemo } from "react";
import { formatDate } from "~/utils/dates";
import { Badge } from "./badge";

dayjs.extend(calendar);
dayjs.locale(czechLocale);

interface Props {
    event: Event;
}
export const SingleEventCard = ({ event }: Props) => {
    const isSignupOpen = useMemo(() => {
        const currentDate = dayjs();
        return currentDate.isAfter(dayjs(event.signupStartDate)) && currentDate.isBefore(dayjs(event.signupEndDate));
    }, [event.signupStartDate, event.signupEndDate]);

    return (
        <Card className="max-w-md w-screen justify-between flex flex-col">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">{event.title}</CardTitle>
                <CardDescription className="truncate-5-lines">{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="gap-4 flex flex-col">
                <>
                    {isSignupOpen && <Badge className="max-w-[10rem]">Přihlašování otevřeno</Badge>}
                    <div className="flex flew-row gap-2">
                        {event.signupStartDate === event.signupEndDate ? (
                            <>
                                <Mail /> {formatDate(dayjs(event.signupStartDate))}
                            </>
                        ) : (
                            <>
                                <Mail /> {formatDate(dayjs(event.signupStartDate))}&nbsp;-&nbsp;
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
                                <Calendar /> {formatDate(dayjs(event.startDate))}&nbsp;-&nbsp;
                                {formatDate(dayjs(event.endDate))}
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
