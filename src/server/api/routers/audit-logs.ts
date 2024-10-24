import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { auditLogEntrySchema } from "~/utils/schemas";

export const auditLogsRouter = createTRPCRouter({
    list: adminProcedure
        .input(
            z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const now = new Date();

            return ctx.db.auditLog.findMany({
                take: 100,
                where: {
                    ...(input.from || input.to ?
                        {
                            timestamp: {
                                gte: input.from ?? new Date(0),
                                lte: input.to ?? now,
                            },
                        }
                        : {}),
                },
                select: {
                    id: true,
                    action: true,
                    actor: true,
                    timestamp: true,
                },
                orderBy: {
                    timestamp: "desc",
                },
            });
        }),
    get: adminProcedure
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            return ctx.db.auditLog.findUnique({
                where: {
                    id: input.id,
                },
            });
        }),
    create: adminProcedure.input(auditLogEntrySchema).mutation(async ({ input, ctx }) => {
        return ctx.db.auditLog.create({
            data: {
                action: input.action,
                actor: ctx.user.fullName,
                metadata: input.metadata as never,
            },
        });
    }),
});
