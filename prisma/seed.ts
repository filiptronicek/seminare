import type { Event } from "@prisma/client";
import { db } from "../src/server/db";

const randomFromArray = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)] as T;
}

export const randomEvent = (): Event => {
    const events = [
        { title: "Wandertag", type: "WANDERTAG" },
        { title: "Semináře", type: "SEMINAR" },
        { title: "Projektový týden", type: "PROJECT_WEEK" },
        { title: "Výlet", type: "TRIP" }
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