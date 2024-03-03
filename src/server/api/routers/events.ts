import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ensureStudent, getStudent } from "~/server/auth";
import { CLASSES } from "~/utils/constants";

export const eventRouter = createTRPCRouter({
    getStudent: publicProcedure.query(({ ctx }) => {
        return getStudent(ctx.auth, ctx.db);
    }),
    listEvents: publicProcedure
        .input(
            z.object({
                active: z.boolean().optional(),
                class: z.enum(CLASSES).optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const now = new Date();
            const student = await ensureStudent(ctx.auth, ctx.db);
            if (!input.class && !student.admin) {
                throw new Error("You must specify a class");
            }

            return ctx.db.event.findMany({
                take: 100,
                where: {
                    ...(input.active ?
                        {
                            OR: [
                                {
                                    signupEndDate: {
                                        gte: now,
                                    },
                                },
                                {
                                    endDate: {
                                        gte: now,
                                    },
                                },
                            ],
                        }
                        : {}),
                    ...(input.class ?
                        {
                            OR: [
                                {
                                    visibleToClasses: {
                                        has: input.class,
                                    },
                                },
                                {
                                    // if the event does not specify a class, it is visible to all
                                    visibleToClasses: {
                                        isEmpty: true,
                                    },
                                },
                            ],
                        }
                        : {}),
                },
                orderBy: {
                    signupStartDate: "asc",
                },
            });
        }),
});
