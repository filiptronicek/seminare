import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const eventRouter = createTRPCRouter({
    changeStudentClass: publicProcedure.input(z.object({ class: z.string() })).mutation(({ input, ctx }) => {
        return ctx.db.student.update({
            where: {
                id: "",
            },
            data: {
                class: input.class,
            },
        });
    }),
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.db.student.findMany();
    }),
    listEvents: publicProcedure.input(z.object({
        active: z.boolean().optional(),
    })).query(({ ctx, input }) => {
        const now = new Date();
        return ctx.db.event.findMany({
            take: 10,
            where: input.active ? {
                endDate: {
                    gte: now,
                },
            } : {},
            orderBy: {
                signupStartDate: "asc",
            }
        });
    }),
    getEvent: publicProcedure.input(z.object({ id: z.string() })).query(({ input, ctx }) => {
        return ctx.db.event.findUnique({ where: { id: input.id } });
    }),
    getEventOptions: publicProcedure.input(z.object({ id: z.string() })).query(({ input, ctx }) => {
        return ctx.db.singleEventOption.findMany({ where: { eventId: input.id } });
    }),
});
