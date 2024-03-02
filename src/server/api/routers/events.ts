import { CLASSES } from "@/lib/constants";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { checkStudent, getStudent } from "~/server/auth";

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
            const student = await checkStudent(ctx.auth, ctx.db);
            if (!input.class && !student.admin) {
                throw new Error("You must specify a class");
            }

            return ctx.db.event.findMany({
                take: 10,
                where: {
                    ...(input.active ?
                        {
                            endDate: {
                                gte: now,
                            },
                        }
                        : {}),
                    ...input.class ? {
                        visibleToClasses: {
                            has: input.class,
                        },
                    } : {},
                },
                orderBy: {
                    signupStartDate: "asc",
                },
            });
        }),
});
