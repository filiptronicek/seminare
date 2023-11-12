/* eslint-disable @typescript-eslint/no-unsafe-call */

import { SingleEventCard } from "@/components/ui/SingleEventCard";
import { api } from "~/utils/api";

export default function Home() {
    const events = api.events.listEvents.useQuery({ active: true });
    const { data: studentData } = api.events.getStudent.useQuery();

    return (
        <section className="flex min-h-screen flex-col items-start">
            <h1 className="text-4xl font-bold">
                Nadcházející akce pro <u>{studentData?.class}</u>
            </h1>
            <div className="mt-8 flex flex-row flex-wrap gap-3 justify-start">
                {events.data?.map((event) => <SingleEventCard key={event.id} event={event} />)}
            </div>
        </section>
    );
}
