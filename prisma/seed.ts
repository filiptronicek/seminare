import type { Event } from "@prisma/client";
import { db } from "../src/server/db";
import { EVENT_TYPE } from "@/lib/constants";

const randomFromArray = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)] as T;
}

export const randomEvent = (): Event => {
    const events = [
        { title: "Wandertag", type: EVENT_TYPE.WANDERTAG },
        { title: "Semináře", type: EVENT_TYPE.SEMINAR },
        { title: "Projektový týden", type: EVENT_TYPE.PROJECT_WEEK },
        { title: "Výlet", type: EVENT_TYPE.UNSPECIFIED }
    ];

    const id = crypto.randomUUID();

    const event: Event = {
        ...randomFromArray(events),
        id,
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
        allowMultipleSelections: Math.random() > 0.5,
        description: "Lorem ipsum dolor sit amet, consectetur ad"
    }

    return event;
}

async function main() {
    for (let i = 0; i < 10; i++) {
        const event = await db.event.upsert({
            where: {
                id: crypto.randomUUID(),
            },
            create: randomEvent(),
            update: {},
        });
        console.log(event);
    }
}

await main()
    .then(async () => {
        await db.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
        process.exit(1);
    });