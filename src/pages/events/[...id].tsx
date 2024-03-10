import { SingleEvent } from "@/components/events/SingleEvent";
import { SingleSeminar } from "@/components/events/SingleSeminar";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { EVENT_TYPE } from "~/utils/constants";

const normalizeId = (id: string | string[]) => {
    if (Array.isArray(id)) {
        return id[0]!;
    }
    return id;
};

export default function Page() {
    const router = useRouter();
    const eventId = normalizeId(router.query.id!);

    const { data: event } = api.events.get.useQuery({ id: eventId });

    if (event?.type === EVENT_TYPE.SEMINAR) {
        return <SingleSeminar id={eventId} />;
    }

    return <SingleEvent id={eventId} />;
}
