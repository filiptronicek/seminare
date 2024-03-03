import { EVENT_TYPE } from "@/lib/constants";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ensureAdmin, ensureStudent } from "~/server/auth";
import { generateExcelForEvent } from "~/utils/data";
import { singleEventSchema, singleEventUpdateSchema } from "~/utils/schemas";
import { parseSeminarMeta, parseSeminarOptionMeta } from "~/utils/seminars";

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
    deleteOption: publicProcedure.input(z.object({ optionId: z.string() })).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
        });
        if (!option) throw new Error("Event option not found");

        // Clean up if students have selected this option
        await ctx.db.studentOption.deleteMany({
            where: { optionId: input.optionId },
        });

        return ctx.db.singleEventOption.delete({
            where: { id: input.optionId },
        });
    }),
    generateExcel: publicProcedure.input(z.object({ eventId: z.string() })).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        const event = await ctx.db.event.findUnique({
            where: { id: input.eventId },
        });
        if (!event) throw new Error("Event not found");

        const excelBuffer = Buffer.from(await generateExcelForEvent({ eventId: input.eventId, db: ctx.db }));
        const base64 = excelBuffer.toString("base64");
        const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;

        return { dataUrl };
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
            data: {
                title: input.data.title,
                description: input.data.description,
                allowMultipleSelections: input.data.allowMultipleSelections,
                visibleToClasses: input.data.visibleToClasses,
                type: input.data.type,
                signupEndDate: input.data.signup?.to,
                signupStartDate: input.data.signup?.from,
                endDate: input.data.happening?.to,
                startDate: input.data.happening?.from,
            },
        });
    }),
    createEvent: publicProcedure.input(singleEventSchema).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        return ctx.db.event.create({
            data: {
                id: crypto.randomUUID(),
                ...input,
            },
        });
    }),
});
