import { CLASSES } from "@/lib/constants";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getStudent } from "~/server/auth";

export const eventRouter = createTRPCRouter({
    getStudent: publicProcedure.query(({ ctx }) => {
        return getStudent(ctx.auth, ctx.db);
    }),
    listEvents: publicProcedure
        .input(
            z.object({
                active: z.boolean().optional(),
                class: z.enum(CLASSES)
            }),
        )
        .query(({ ctx, input }) => {
            const now = new Date();
            return ctx.db.event.findMany({
                take: 10,
                where:
                {

                    ...input.active ?
                        {
                            endDate: {
                                gte: now,
                            },
                        }
                        : {},
                    visibleToClasses: {
                        has: input.class
                    }
                },
                orderBy: {
                    signupStartDate: "asc",
                },
            });
        }),
});
