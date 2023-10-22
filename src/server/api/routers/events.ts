import type { SingleEventOption } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getStudent } from "~/server/auth";

interface EventOptionWithMembership extends SingleEventOption {
    signedUp: boolean;
}

export const eventRouter = createTRPCRouter({
    changeStudentClass: publicProcedure.input(z.object({ class: z.string() })).mutation(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student)
            throw new Error("Student not found");
        return ctx.db.student.update({
            where: {
                id: student.id,
            },
            data: {
                class: input.class,
            },
        });
    }),
    getStudent: publicProcedure.query(({ ctx }) => {
        return getStudent(ctx.auth, ctx.db);
    }),
    listEvents: publicProcedure.input(z.object({
        active: z.boolean().optional(),
        // todo: class filter
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
    //todo: add membership handling
    listEventOptions: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student)
            throw new Error("Student not found");
        return ctx.db.singleEventOption.findMany({ where: { eventId: input.id } });
    }),
});
