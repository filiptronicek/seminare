import type { Event, SingleEventOption } from "@prisma/client";
import { db } from "../src/server/db";
import { AVAILABLE_BRANCHES, CLASSES, EVENT_TYPE } from "../src/utils/constants";
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

export const randomEvent = (): Event => {
    const events = [
        { title: "Wandertag", type: EVENT_TYPE.WANDERTAG },
        { title: "Projektový týden", type: EVENT_TYPE.PROJECT_WEEK },
        { title: "Výlet", type: EVENT_TYPE.UNSPECIFIED },
    ] as const;

    const id = crypto.randomUUID();
    // @ts-expect-error the future and past methods are not in the types
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

const randomSeminar = (className: string): Event => {
    const id = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const dateOfEvent = dayjs().add(1, "week");
    const dateOfEventEnd = dateOfEvent.add(1, "week");

    const signupStartDate = dateOfEvent.subtract(1, "week");
    const signupEndDate = signupStartDate.add(1, "day");

    const requiredHours = random(3, 8);

    return {
        title: `Semináře (${className})`,
        type: EVENT_TYPE.SEMINAR,
        id,
        startDate: dateOfEvent.toDate(),
        endDate: dateOfEventEnd.toDate(),
        signupEndDate: signupEndDate.toDate(),
        signupStartDate: signupStartDate.toDate(),
        allowMultipleSelections: true,
        description: lorem.generateParagraphs(2),
        visibleToClasses: [className],
        metadata: {
            requiredHours,
            availableBranches: AVAILABLE_BRANCHES,
        },
    };
};

const randomSeminarOption = (event: Event, i: number): SingleEventOption => {
    return {
        id: crypto.randomUUID(),
        eventId: event.id,
        title: `Seminář ${i}`,
        description: lorem.generateParagraphs(1),
        maxParticipants: null,
        metadata: {
            hoursPerWeek: random(1, 2),
            branch: sample(AVAILABLE_BRANCHES)?.id,
        },
    };
};

export const randomOption = ({ id }: { id: string }, i: number): SingleEventOption => {
    return {
        id: crypto.randomUUID(),
        eventId: id,
        title: `Možnost ${i}`,
        description: lorem.generateParagraphs(1),
        maxParticipants: Math.floor(Math.random() * 10),
        metadata: null,
    };
};

async function main() {
    // Clear database
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
            await db.singleEventOption.upsert({
                where: {
                    id: crypto.randomUUID(),
                },
                create: randomOption(event, j + 1),
                update: {},
            });
        }
    }

    const seminarClasses = ["5G", "6G", "7G", "8G"];
    for (const className of seminarClasses) {
        const event = await db.event.upsert({
            where: {
                id: crypto.randomUUID(),
            },
            create: randomSeminar(className),
            update: {},
        });
        for (let j = 0; j < 10; j++) {
            await db.singleEventOption.upsert({
                where: {
                    id: crypto.randomUUID(),
                },
                create: randomSeminarOption(event, j + 1),
                update: {},
            });
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
