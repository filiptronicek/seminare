import { TRPCError } from "@trpc/server";
import { endOfDay } from "date-fns";
import { z } from "zod";

import { authedProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ensureAdmin, ensureUser } from "~/server/auth";
import { EVENT_TYPE } from "~/utils/constants";
import { singleOptionCreateSchema, singleOptionUpdateSchema, uuid } from "~/utils/schemas";
import { parseSeminarMeta, parseSeminarOptionMeta } from "~/utils/seminars";

export const eventOptionsRouter = createTRPCRouter({
    listStudentOptions: publicProcedure.input(z.object({ eventId: uuid })).query(async ({ ctx, input }) => {
        const student = await ensureUser(ctx.auth, ctx.db);

        const studentWithOptions = await ctx.db.student.findUnique({
            where: {
                id: student.id,
            },
            include: {
                options: {
                    where: {
                        eventId: input.eventId,
                    },
                },
            },
        });

        if (!studentWithOptions) return [];

        return studentWithOptions.options;
    }),
    join: authedProcedure.input(z.object({ optionId: uuid })).mutation(async ({ input, ctx }) => {
        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
            include: { event: true },
        });
        if (!option) throw new TRPCError({ code: "NOT_FOUND", message: "Event option not found" });

        // Guards against joining options before signup period starts or after it ends
        // todo: optionally, allow admins to remove students from options anyway
        if (option.event.signupStartDate && option.event.signupStartDate > new Date()) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "Signup period has not started yet",
            });
        }

        if (option.event.signupEndDate) {
            const signupEndDate = endOfDay(option.event.signupEndDate);
            if (signupEndDate < new Date()) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Signup period has ended",
                });
            }
        }

        if (!ctx.user.class) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "You need to set your class before you can join events",
            });
        }

        if (!option.event.allowMultipleSelections) {
            const existingSelection = await ctx.db.student.findFirst({
                where: {
                    id: ctx.user.id,
                    options: {
                        some: {
                            eventId: option.eventId,
                        },
                    },
                },
            });
            if (existingSelection) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Multiple selections not allowed for this event",
                });
            }
        }

        if (
            option.event.visibleToClasses &&
            option.event.visibleToClasses.length > 0 &&
            !option.event.visibleToClasses.includes(ctx.user.class)
        ) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "This event is not available to your class",
            });
        }

        if (option.event.type === EVENT_TYPE.SEMINAR.toString()) {
            if (!option.event.metadata)
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Seminar not setup correctly: Seminar events require metadata",
                });

            const parsedData = parseSeminarMeta(option.event.metadata);
            const student = await ctx.db.student.findUnique({
                where: {
                    id: ctx.user.id,
                },
                include: {
                    options: {
                        where: {
                            eventId: option.eventId,
                        },
                        select: {
                            metadata: true,
                        },
                    },
                },
            });

            if (!student)
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Student not found",
                });

            const { options: selectedOptions } = student;

            const hoursSelected = selectedOptions.reduce((acc, selectedOption) => {
                const { hoursPerWeek } = parseSeminarOptionMeta(selectedOption.metadata);
                return acc + hoursPerWeek;
            }, 0);

            const { hoursPerWeek } = parseSeminarOptionMeta(option.metadata);
            if (hoursSelected + hoursPerWeek > parsedData.requiredHours) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "You cannot select more hours than required",
                });
            }

            // Ensure oneof branches are not selected together
            const selectedBranches = selectedOptions.map(
                (selectedOption) => parseSeminarOptionMeta(selectedOption.metadata).branch,
            );
            const selectedOneofBranches = selectedBranches.filter((branch) => {
                return parsedData.availableBranches.find((b) => b.id === branch)?.type === "oneof";
            });
            const { branch: newBranch } = parseSeminarOptionMeta(option.metadata);
            const isNewBranchOneof = parsedData.availableBranches.find((b) => b.id === newBranch)?.type === "oneof";
            if (isNewBranchOneof && selectedOneofBranches.length > 0 && !selectedOneofBranches.includes(newBranch)) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "You cannot select multiple oneof branches",
                });
            }
        }

        if (option.maxParticipants !== null) {
            const participantCount = await ctx.db.student.count({
                where: {
                    options: {
                        some: {
                            id: option.id,
                        },
                    },
                },
            });
            if (participantCount >= option.maxParticipants) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Možnost je již plná",
                });
            }
        }

        await ctx.db.student.update({
            where: { id: ctx.user.id },
            data: {
                options: {
                    connect: { id: input.optionId },
                },
            },
        });

        return option;
    }),
    leave: publicProcedure.input(z.object({ optionId: uuid })).mutation(async ({ input, ctx }) => {
        const student = await ensureUser(ctx.auth, ctx.db);

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
            include: { event: true },
        });
        if (!option)
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Event option not found",
            });

        // Guards against leaving options before signup period starts or after it ends
        // todo: optionally, allow admins to remove students from options anyway
        if (option.event.signupStartDate && option.event.signupStartDate > new Date()) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "Signup period has not started yet",
            });
        }
        if (option.event.signupEndDate && option.event.signupEndDate < new Date()) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "Signup period has ended",
            });
        }

        await ctx.db.student.update({
            where: { id: student.id },
            data: {
                options: {
                    disconnect: [{ id: input.optionId }],
                },
            },
        });

        return option;
    }),
    create: publicProcedure.input(singleOptionCreateSchema).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);
        // Ensure maxParticipants is not negative, and if it is, disable the limit
        const maxParticipants = (input.data?.maxParticipants ?? -1) >= 0 ? input.data.maxParticipants : null;

        return ctx.db.singleEventOption.create({
            data: {
                ...input.data,
                maxParticipants,
                event: {
                    connect: { id: input.eventId },
                },
            },
        });
    }),
    list: publicProcedure.input(z.object({ id: uuid })).query(async ({ input, ctx }) => {
        await ensureUser(ctx.auth, ctx.db);

        return ctx.db.singleEventOption.findMany({
            where: { eventId: input.id },
            include: {
                _count: {
                    select: { students: true },
                },
            },
        });
    }),
    update: publicProcedure.input(singleOptionUpdateSchema).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);
        // Ensure maxParticipants is not negative, and if it is, disable the limit
        const maxParticipants = (input.data?.maxParticipants ?? -1) >= 0 ? input.data.maxParticipants : null;

        return ctx.db.singleEventOption.update({
            where: { id: input.id },
            data: {
                ...input.data,
                maxParticipants,
            },
        });
    }),
    delete: publicProcedure.input(z.object({ optionId: uuid })).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        const option = await ctx.db.singleEventOption.findUnique({
            where: { id: input.optionId },
        });
        if (!option) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Event option not found",
            });
        }

        // Disassociate all students from this option
        await ctx.db.singleEventOption.update({
            where: { id: input.optionId },
            data: {
                students: {
                    set: [],
                },
            },
        });

        // Delete the option
        return ctx.db.singleEventOption.delete({
            where: { id: input.optionId },
        });
    }),
});
