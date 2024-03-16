import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ensureAdmin, ensureUser } from "~/server/auth";
import { AVAILABLE_BRANCHES, CLASSES } from "~/utils/constants";
import { generateExcelForEvent } from "~/utils/data";
import { singleEventSchema, singleEventUpdateSchema } from "~/utils/schemas";

const idType = z.string().uuid();

export const eventRouter = createTRPCRouter({
    list: publicProcedure
        .input(
            z.object({
                active: z.boolean().optional(),
                class: z.enum(CLASSES).optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const now = new Date();
            const student = await ensureUser(ctx.auth, ctx.db);
            if (!input.class && !student.admin) {
                throw new Error("You must specify a class");
            }

            return ctx.db.event.findMany({
                take: 100,
                where: {
                    ...(input.active ?
                        {
                            AND: [
                                {
                                    OR: [
                                        {
                                            signupEndDate: {
                                                gte: now,
                                            },
                                        },
                                        {
                                            endDate: {
                                                gte: now,
                                            },
                                        },
                                    ],
                                },
                            ],
                        }
                    :   {}),
                    ...(input.class ?
                        {
                            OR: [
                                {
                                    visibleToClasses: {
                                        has: input.class,
                                    },
                                },
                                {
                                    // if the event does not specify a class, it is visible to all
                                    visibleToClasses: {
                                        isEmpty: true,
                                    },
                                },
                            ],
                        }
                    :   {}),
                },
                orderBy: {
                    signupStartDate: "asc",
                },
            });
        }),
    generateExcel: publicProcedure.input(z.object({ eventId: idType })).mutation(async ({ input, ctx }) => {
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
    create: publicProcedure.input(singleEventSchema).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        return ctx.db.event.create({
            data: {
                id: crypto.randomUUID(),
                title: input.title,
                description: input.description,
                allowMultipleSelections: input.allowMultipleSelections,
                visibleToClasses: input.visibleToClasses,
                type: input.type,
                signupEndDate: input.signup.to,
                signupStartDate: input.signup.from,
                endDate: input.happening.to,
                startDate: input.happening.from,
                metadata: {
                    requiredHours: input.metadata?.requiredHours,
                    availableBranches: input.metadata?.availableBranches ?? AVAILABLE_BRANCHES,
                },
            },
        });
    }),
    get: publicProcedure.input(z.object({ id: idType })).query(async ({ input, ctx }) => {
        await ensureUser(ctx.auth, ctx.db);

        return ctx.db.event.findUnique({ where: { id: input.id } });
    }),
    update: publicProcedure.input(singleEventUpdateSchema).mutation(async ({ input, ctx }) => {
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
    delete: publicProcedure.input(z.object({ id: idType })).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        // Clean up any options and student options
        await ctx.db.singleEventOption.deleteMany({
            where: { eventId: input.id },
        });
        await ctx.db.studentOption.deleteMany({
            where: {
                option: {
                    event: {
                        id: input.id,
                    },
                },
            },
        });

        return ctx.db.event.delete({
            where: { id: input.id },
        });
    }),
});
