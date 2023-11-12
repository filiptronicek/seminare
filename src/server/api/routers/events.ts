import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getStudent } from "~/server/auth";

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
    listEventOptions: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student)
            throw new Error("Student not found");
        return ctx.db.singleEventOption.findMany({ where: { eventId: input.id } });
    }),
    getStudentSelectedEventOptions: publicProcedure.input(z.object({ eventId: z.string() })).query(async ({ ctx, input }) => {

        const student = await getStudent(ctx.auth, ctx.db);
        if (!student) throw new Error("Student not found");

        return await ctx.db.singleEventOption.findMany({
            where: {
                AND: [
                    { eventId: input.eventId },
                    { StudentOption: { some: { studentId: student.id } } }
                ]
            }
        });
    }),
    joinEventOption: publicProcedure.input(z.object({ optionId: z.string(), })).mutation(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student) throw new Error("Student not found");

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
            include: { event: true }
        });
        if (!option) throw new Error("Event option not found");

        if (!option.event.allowMultipleSelections) {
            const existingOption = await ctx.db.studentOption.findFirst({
                where: {
                    studentId: student.id,
                    option: {
                        eventId: option.eventId
                    }
                }
            });
            if (existingOption) {
                throw new Error("Multiple selections not allowed for this event");
            }
        }

        await ctx.db.studentOption.create({
            data: {
                studentId: student.id,
                optionId: input.optionId
            }
        });

        return option;
    }),
    leaveEventOption: publicProcedure.input(z.object({ optionId: z.string(), })).mutation(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student) throw new Error("Student not found");

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId }
        });
        if (!option) throw new Error("Event option not found");

        await ctx.db.studentOption.delete({
            where: {
                studentId_optionId: {
                    studentId: student.id,
                    optionId: input.optionId
                }
            }
        });

        return option;
    }),
});
