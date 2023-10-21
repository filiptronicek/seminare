import type { Event } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { buttonVariants } from "./button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EventProps {
    event: Event;
}

export const SingleEvent = ({ event }: EventProps) => {
    return (
        <Card className="max-w-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Link className={cn(buttonVariants({ variant: "default" }), "w-full")} href={`/events/${event.id}`}>
                    Zobrazit
                </Link>
            </CardContent>
        </Card>
    );
};
