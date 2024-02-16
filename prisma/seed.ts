import type { Event, SingleEventOption } from "@prisma/client";
import { db } from "../src/server/db";
import { CLASSES, EVENT_TYPE } from "../src/@/lib/constants";
import { LoremIpsum } from "lorem-ipsum";
import { random, sampleSize, sample } from "lodash";

import dayjs from "dayjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dayjsRandom from "dayjs-random";

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
dayjs.extend(dayjsRandom);

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4,
    },
    wordsPerSentence: {
        max: 16,
        min: 4,
    },
});

const availableBranches = [
    { id: "humanitarian", label: "Humanitní" },
    { id: "science", label: "Přírodovědná" },
    { id: "universal", label: "Univerzální" },
];

export const randomEvent = (): Event => {
    const events = [
        { title: "Wandertag", type: EVENT_TYPE.WANDERTAG },
        { title: "Semináře", type: EVENT_TYPE.SEMINAR },
        { title: "Projektový týden", type: EVENT_TYPE.PROJECT_WEEK },
        { title: "Výlet", type: EVENT_TYPE.UNSPECIFIED },
    ] as const;

    const id = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const dateOfEvent = (Math.random() > 0.5 ? (dayjs.future() as dayjs.Dayjs) : (dayjs.past() as dayjs.Dayjs)).add(
        1,
        "week",
    );
    const dateOfEventEnd = dateOfEvent.add(1, "week");

    const signupStartDate = dateOfEvent.subtract(1, "week");
    const signupEndDate = signupStartDate.add(1, "day");

    const numberOfClasses = random(1, 3);
    const randomSample = sampleSize(CLASSES, numberOfClasses);

    const eventBase = sample(events)!;

    if (eventBase.type === EVENT_TYPE.SEMINAR) {
        const applicableToClass = sample(CLASSES);
        const requiredHours = random(3, 8);

        return {
            title: `${eventBase.title} (${applicableToClass})`,
            type: eventBase.type,
            id,
            startDate: dateOfEvent.toDate(),
            endDate: dateOfEventEnd.toDate(),
            signupEndDate: signupEndDate.toDate(),
            signupStartDate: new Date(),
            allowMultipleSelections: true,
            description: lorem.generateParagraphs(2),
            visibleToClasses: [applicableToClass],
            metadata: {
                requiredHours,
                availableBranches,
            },
        };
    }

    return {
        title: eventBase.title,
        type: eventBase.type,
        id,
        startDate: dateOfEvent.toDate(),
        endDate: dateOfEventEnd.toDate(),
        signupEndDate: signupEndDate.toDate(),
        signupStartDate: signupStartDate.toDate(),
        allowMultipleSelections: Math.random() > 0.5,
        description: lorem.generateParagraphs(2),
        visibleToClasses: randomSample,
        metadata: {},
    };
};

export const randomOption = ({id, type}: {id: string; type: string}, i: number): SingleEventOption => {
    if (type === "SEMINAR") {
        return {
            id: crypto.randomUUID(),
            eventId: id,
            title: `Seminář ${i}`,
            description: lorem.generateParagraphs(1),
            maxParticipants: null,
            metadata: {
                hoursPerWeek: random(1,2)!,
                branch: sample(availableBranches)!
            }
        }
    }

    return {
        id: crypto.randomUUID(),
        eventId: id,
        title: `Možnost ${i}`,
        description: lorem.generateParagraphs(1),
        maxParticipants: Math.floor(Math.random() * 10),
        metadata: null,
    }
}

async function main() {
    // Clear database
    await db.studentOption.deleteMany();
    await db.singleEventOption.deleteMany({});
    await db.event.deleteMany({});
    await db.student.deleteMany({});

    for (let i = 0; i < 50; i++) {
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
                create: randomOption(event, j+1),
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
