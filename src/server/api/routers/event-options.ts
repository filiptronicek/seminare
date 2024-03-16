import { endOfDay } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ensureAdmin, ensureStudent } from "~/server/auth";
import { EVENT_TYPE } from "~/utils/constants";
import { singleOptionCreateSchema, singleOptionUpdateSchema } from "~/utils/schemas";
import { parseSeminarMeta, parseSeminarOptionMeta } from "~/utils/seminars";

export const eventOptionsRouter = createTRPCRouter({
    listStudentOptions: publicProcedure.input(z.object({ eventId: z.string() })).query(async ({ ctx, input }) => {
        const student = await ensureStudent(ctx.auth, ctx.db);

        return await ctx.db.singleEventOption.findMany({
            where: {
                AND: [{ eventId: input.eventId }, { StudentOption: { some: { studentId: student.id } } }],
            },
        });
    }),
    join: publicProcedure.input(z.object({ optionId: z.string() })).mutation(async ({ input, ctx }) => {
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

        if (option.event.signupEndDate) {
            const signupEndDate = endOfDay(option.event.signupEndDate);
            if (signupEndDate < new Date()) {
                throw new Error("Signup period has ended");
            }
        }

        if (!student.class) {
            throw new Error("You need to set your class before you can join events");
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

        if (option.event.visibleToClasses && !option.event.visibleToClasses.includes(student.class)) {
            throw new Error("This event is not available to your class");
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

            // Ensure oneof branches are not selected together
            const selectedBranches = selectedOptions.map((selectedOption) =>
                parseSeminarOptionMeta(selectedOption.option.metadata).branch,
            );
            const selectedOneofBranches = selectedBranches.filter((branch) => {
                return parsedData.availableBranches.find((b) => b.id === branch)?.type === "oneof";
            });
            const { branch: newBranch } = parseSeminarOptionMeta(option.metadata);
            const isNewBranchOneof = parsedData.availableBranches.find((b) => b.id === newBranch)?.type === "oneof";
            if (isNewBranchOneof && selectedOneofBranches.length > 0 && !selectedOneofBranches.includes(newBranch)) {
                throw new Error("You cannot select multiple oneof branches");
            }
        }

        if (option.maxParticipants !== null) {
            const participants = await ctx.db.studentOption.count({
                where: {
                    optionId: option.id,
                },
            });
            if (participants >= option.maxParticipants) {
                throw new Error("Možnost je již plná");
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
    leave: publicProcedure.input(z.object({ optionId: z.string() })).mutation(async ({ input, ctx }) => {
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
    create: publicProcedure.input(singleOptionCreateSchema).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        return ctx.db.singleEventOption.create({
            data: {
                ...input.data,
                event: {
                    connect: { id: input.eventId },
                },
            },
        });
    }),
    list: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        await ensureStudent(ctx.auth, ctx.db);

        return ctx.db.singleEventOption.findMany({
            where: { eventId: input.id },
        });
    }),
    update: publicProcedure.input(singleOptionUpdateSchema).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        return ctx.db.singleEventOption.update({
            where: { id: input.id },
            data: input.data,
        });
    }),
    delete: publicProcedure.input(z.object({ optionId: z.string() })).mutation(async ({ input, ctx }) => {
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
});
