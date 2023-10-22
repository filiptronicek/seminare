import type { Event } from "@prisma/client";
import { db } from "../src/server/db";
import { EVENT_TYPE } from "@/lib/constants";
import { LoremIpsum, loremIpsum } from "lorem-ipsum";

import dayjs from "dayjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dayjsRandom from 'dayjs-random'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
dayjs.extend(dayjsRandom)

const randomFromArray = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)] as T;
}

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

export const randomEvent = (): Event => {
    const events = [
        { title: "Wandertag", type: EVENT_TYPE.WANDERTAG },
        { title: "Semináře", type: EVENT_TYPE.SEMINAR },
        { title: "Projektový týden", type: EVENT_TYPE.PROJECT_WEEK },
        { title: "Výlet", type: EVENT_TYPE.UNSPECIFIED }
    ];

    const id = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const dateOfEvent = (Math.random() > 0.5 ? (dayjs.future() as dayjs.Dayjs) : (dayjs.past() as dayjs.Dayjs)).add(1, "week");
    const dateOfEventEnd = dateOfEvent.add(1, "week");

    const signupStartDate = dateOfEvent.subtract(1, "week");
    const signupEndDate = signupStartDate.add(1, "day");

    const event: Event = {
        ...randomFromArray(events),
        id,
        startDate: dateOfEvent.toDate(),
        endDate: dateOfEventEnd.toDate(),
        signupEndDate: signupEndDate.toDate(),
        signupStartDate: signupStartDate.toDate(),
        allowMultipleSelections: Math.random() > 0.5,
        description: lorem.generateParagraphs(2),
    }

    return event;
}

async function main() {

    // Clear database
    await db.singleEventOption.deleteMany({});
    await db.event.deleteMany({});

    for (let i = 0; i < 10; i++) {
        const event = await db.event.upsert({
            where: {
                id: crypto.randomUUID(),
            },
            create: randomEvent(),
            update: {},
        });
        for (let j = 0; j < 10; j++) {
            const option = await db.singleEventOption.upsert({
                where: {
                    id: crypto.randomUUID(),
                },
                create: {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    title: `Option ${j + 1}`,
                    description: lorem.generateParagraphs(1),
                    maxParticipants: Math.floor(Math.random() * 10),
                },
                update: {},
            });
            console.log(option.id);

        }
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