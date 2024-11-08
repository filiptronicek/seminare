import { initTRPC } from "@trpc/server";
import { appRouter } from "~/server/api/root";
import { type createTRPCContext } from "~/server/api/trpc";
import { db } from "~/server/db";
import superjson from "superjson";
import { ZodError } from "zod";
import { type Class } from "~/utils/constants";
import { sample } from "lodash";

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

const { createCallerFactory } = t;

const createCaller = createCallerFactory(appRouter);

const allUsers = await db.student.findMany({});

for (const user of allUsers) {
    const caller = createCaller({
        user,
        //@ts-expect-error idk
        auth: {
            async getUser() {
                return Promise.resolve({
                    data: {
                        user: {
                            id: user.id,
                            fullName: user.fullName,
                            aud: "aud",
                            created_at: "created_at",
                            app_metadata: {
                                provider: "supabase",
                            },
                            user_metadata: {
                                full_name: user.fullName,
                            },
                        },
                    },
                    error: null,
                });
            },
        },
        db,
    });

    if (user.suspended) {
        continue;
    }
    if (user.class === null) {
        continue;
    }

    const activeEvents = await caller.event.list({ class: user.class as Class, signupActive: true });

    for (const event of activeEvents) {
        const options = await caller.eventOptions.list({ id: event.id });
        const selectedOption = sample(options);
        if (!selectedOption) {
            continue;
        }

        try {
            await caller.eventOptions.join({
                optionId: selectedOption.id,
            });
            console.log(`✅ User ${user.fullName} joined event ${event.title}`);
        } catch (e) {
            console.error(`❌ User ${user.fullName} failed to join event ${event.title}`, e);
        }
    }
}
