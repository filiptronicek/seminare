/* eslint-disable @typescript-eslint/no-unsafe-call */

import { SingleEvent } from "@/components/ui/Event";
import { api } from "~/utils/api";

export default function Home() {
    const events = api.events.listEvents.useQuery({active: true});

    return (
        <section className="flex min-h-screen flex-col items-start px-12">
            <h1 className="text-4xl font-bold">
                Nadcházející akce pro <u>1N</u>
            </h1>
            <div className="container mt-8 flex flex-row flex-wrap gap-4 justify-around">
                {events.data?.map((event) => <SingleEvent key={event.id} event={event} />)}
            </div>
        </section>
    );
}
