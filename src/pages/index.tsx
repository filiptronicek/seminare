/* eslint-disable @typescript-eslint/no-unsafe-call */

import { SingleEvent } from "@/components/ui/Event";
import type { Event } from "@prisma/client";

const mockEvent: Event = {
    id: "uuu",
    title: "Wandertag",
    description:
        "Wandertag je parádní procházka Prahou, na které se najdou noví i staří kamarádi, ba i učitelé a učitelky.",
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
    type: "wandertag",
    allowMultipleSelections: false,
};

export default function Home() {
    return (
        <section className="flex min-h-screen flex-col items-start px-12">
            <h1 className="text-4xl font-bold">
                Nadcházející akce pro <u>1N</u>
            </h1>
            <div className="container mt-8 flex flex-row flex-wrap gap-4 justify-around">
                <SingleEvent event={mockEvent}></SingleEvent>
                <SingleEvent event={mockEvent}></SingleEvent>
                <SingleEvent event={mockEvent}></SingleEvent>
                <SingleEvent event={mockEvent}></SingleEvent>
            </div>
        </section>
    );
}
