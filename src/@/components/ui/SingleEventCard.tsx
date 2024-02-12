import type { Event } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { buttonVariants } from "./button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar, Mail } from "lucide-react";

import dayjs from "dayjs";
import czechLocale from "dayjs/locale/cs";
import calendar from "dayjs/plugin/calendar";
import { useMemo } from "react";
import { Badge } from "./badge";
import { formatDate } from "~/utils/dates";

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
        <Card className="max-w-md w-screen">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                    {event.title} {isSignupOpen && <Badge>Přihlašování otevřeno</Badge>}{" "}
                </CardTitle>
                <CardDescription className="truncate-5-lines">{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <>
                    <div className="flex flew-row gap-2">
                        {event.signupStartDate === event.signupEndDate ?
                            <>
                                <Mail /> {formatDate(dayjs(event.signupStartDate))}
                            </>
                        :   <>
                                <Mail /> {formatDate(dayjs(event.signupStartDate))}&nbsp;-&nbsp;
                                {formatDate(dayjs(event.signupEndDate))}
                            </>
                        }
                    </div>
                    <div className="flex flew-row gap-2">
                        {event.startDate === event.endDate ?
                            <>
                                <Calendar /> {formatDate(dayjs(event.startDate))}
                            </>
                        :   <>
                                <Calendar /> {formatDate(dayjs(event.startDate))}&nbsp;-&nbsp;
                                {formatDate(dayjs(event.endDate))}
                            </>
                        }
                    </div>
                </>
                <Link className={cn(buttonVariants({ variant: "default" }), "w-full")} href={`/events/${event.id}`}>
                    Zobrazit
                </Link>
            </CardContent>
        </Card>
    );
};
