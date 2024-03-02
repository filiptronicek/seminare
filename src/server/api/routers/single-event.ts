import { EVENT_TYPE } from "@/lib/constants";
import type { Buffer } from "exceljs";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ensureAdmin, ensureStudent, getStudent } from "~/server/auth";
import { generateExcelForEvent } from "~/utils/data";
import { parseSeminarMeta, parseSeminarOptionMeta } from "~/utils/seminars";

const singleEventUpdateSchema = z.object({
    id: z.string(),
    data: z
        .object({
            title: z.string(),
            description: z.string(),
            allowMultipleSelections: z.boolean(),
            signupStartDate: z.date(),
            signupEndDate: z.date(),
        })
        .partial(),
});

export const singleEventRouter = createTRPCRouter({
    getEvent: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        await ensureStudent(ctx.auth, ctx.db);

        return ctx.db.event.findUnique({ where: { id: input.id } });
    }),
    listOptions: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        await ensureStudent(ctx.auth, ctx.db);

        return ctx.db.singleEventOption.findMany({
            where: { eventId: input.id },
        });
    }),
    listStudentOptions: publicProcedure.input(z.object({ eventId: z.string() })).query(async ({ ctx, input }) => {
        const student = await ensureStudent(ctx.auth, ctx.db);

        return await ctx.db.singleEventOption.findMany({
            where: {
                AND: [{ eventId: input.eventId }, { StudentOption: { some: { studentId: student.id } } }],
            },
        });
    }),
    joinOption: publicProcedure.input(z.object({ optionId: z.string() })).mutation(async ({ input, ctx }) => {
        const student = await ensureStudent(ctx.auth, ctx.db);

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

        if (option.event.type === EVENT_TYPE.SEMINAR.toString()) {
            const hasMeta = !!option.event.metadata;
            if (!hasMeta) throw new Error("Server error: Seminar events require metadata");

            const parsedData = parseSeminarMeta(option.event.metadata);
            const selectedOptions = await ctx.db.studentOption.findMany({
                where: {
                    studentId: student.id,
                    option: {
                        eventId: option.eventId,
                    },
                },
                include: {
                    option: {
                        select: {
                            metadata: true,
                        },
                    },
                },
            });

            const hoursSelected = selectedOptions.reduce((acc, selectedOption) => {
                const { hoursPerWeek } = parseSeminarOptionMeta(selectedOption.option.metadata);
                return acc + hoursPerWeek;
            }, 0);

            const { hoursPerWeek } = parseSeminarOptionMeta(option.metadata);
            if (hoursSelected + hoursPerWeek > parsedData.requiredHours) {
                throw new Error("You cannot select more hours than required");
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
        const student = await ensureStudent(ctx.auth, ctx.db);

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
    updateEvent: publicProcedure.input(singleEventUpdateSchema).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        const event = await ctx.db.event.findUnique({
            where: { id: input.id },
            select: {
                id: true,
            },
        });
        if (!event) throw new Error("Event not found");

        return ctx.db.event.update({
            where: { id: input.id },
            data: input.data,
        });
    }),
});
