import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getStudent } from "~/server/auth";

export const singleEventRouter = createTRPCRouter({
    getEvent: publicProcedure.input(z.object({ id: z.string() })).query(({ input, ctx }) => {
        return ctx.db.event.findUnique({ where: { id: input.id } });
    }),
    listOptions: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student)
            throw new Error("Student not found");
        return ctx.db.singleEventOption.findMany({ where: { eventId: input.id } });
    }),
    listStudentOptions: publicProcedure.input(z.object({ eventId: z.string() })).query(async ({ ctx, input }) => {
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
    joinOption: publicProcedure.input(z.object({ optionId: z.string(), })).mutation(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student) throw new Error("Student not found");

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
            include: { event: true }
        });
        if (!option) throw new Error("Event option not found");

        // Guards against joining options before signup period starts or after it ends
        // todo: optionally, allow admins to remove students from options anyway
        if (option.event.signupStartDate && option.event.signupStartDate > new Date()) {
            throw new Error("Signup period has not started yet");
        }
        if (option.event.signupEndDate && option.event.signupEndDate < new Date()) {
            throw new Error("Signup period has ended");
        }

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
    leaveOption: publicProcedure.input(z.object({ optionId: z.string(), })).mutation(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student) throw new Error("Student not found");

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
            include: { event: true }
        });
        if (!option) throw new Error("Event option not found");

        // Guards against leaving options before signup period starts or after it ends
        // todo: optionally, allow admins to remove students from options anyway
        if (option.event.signupStartDate && option.event.signupStartDate > new Date()) {
            throw new Error("Signup period has not started yet");
        }
        if (option.event.signupEndDate && option.event.signupEndDate < new Date()) {
            throw new Error("Signup period has ended");
        }

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