import type { Buffer } from "exceljs";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { checkStudent, getStudent } from "~/server/auth";
import { generateExcelForEvent } from "~/utils/data";

export const singleEventRouter = createTRPCRouter({
    getEvent: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        await checkStudent(ctx.auth, ctx.db);

        return ctx.db.event.findUnique({ where: { id: input.id } });
    }),
    listOptions: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        await checkStudent(ctx.auth, ctx.db);

        return ctx.db.singleEventOption.findMany({
            where: { eventId: input.id },
        });
    }),
    listStudentOptions: publicProcedure.input(z.object({ eventId: z.string() })).query(async ({ ctx, input }) => {
        const student = await checkStudent(ctx.auth, ctx.db);

        return await ctx.db.singleEventOption.findMany({
            where: {
                AND: [{ eventId: input.eventId }, { StudentOption: { some: { studentId: student.id } } }],
            },
        });
    }),
    joinOption: publicProcedure.input(z.object({ optionId: z.string() })).mutation(async ({ input, ctx }) => {
        const student = await checkStudent(ctx.auth, ctx.db);

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
            include: { event: true },
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
                        eventId: option.eventId,
                    },
                },
            });
            if (existingOption) {
                throw new Error("Multiple selections not allowed for this event");
            }
        }

        await ctx.db.studentOption.create({
            data: {
                studentId: student.id,
                optionId: input.optionId,
            },
        });

        return option;
    }),
    leaveOption: publicProcedure.input(z.object({ optionId: z.string() })).mutation(async ({ input, ctx }) => {
        const student = await checkStudent(ctx.auth, ctx.db);

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
            include: { event: true },
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
                    optionId: input.optionId,
                },
            },
        });

        return option;
    }),
    // todo: add escalated privileges guard
    // todo: add a proper file stream response
    generateExcel: publicProcedure
        .input(z.object({ eventId: z.string() }))
        .mutation(async ({ input, ctx }): Promise<Buffer> => {
            const student = await getStudent(ctx.auth, ctx.db);
            if (!student) throw new Error("Student not found");

            const event = await ctx.db.event.findUnique({
                where: { id: input.eventId },
            });
            if (!event) throw new Error("Event not found");

            return generateExcelForEvent({ eventId: input.eventId, db: ctx.db });
        }),
});
