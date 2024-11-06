import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { getUser } from "~/server/auth";
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

            const auditLogs = await ctx.db.auditLog.findMany({
                take: 500,
                where: {
                    ...(input.from || input.to ?
                        {
                            timestamp: {
                                gte: input.from ?? new Date(0),
                                lte: input.to ?? now,
                            },
                        }
                    :   {}),
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
            const users = new Map<string, string | null>();
            for (const auditLog of auditLogs) {
                const userId = auditLog.actor;
                if (users.get(userId) !== undefined) {
                    continue;
                }
                const user = await getUser(ctx.db, userId);
                users.set(userId, user?.fullName ?? null);
            }

            return auditLogs.map((auditLog) => ({
                ...auditLog,
                actor: {
                    id: auditLog.actor,
                    name: users.get(auditLog.actor) ?? "Unknown",
                },
            }));
        }),
    get: adminProcedure
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const auditLog = await ctx.db.auditLog.findUnique({
                where: {
                    id: input.id,
                },
            });
            if (!auditLog) {
                throw new Error("Audit log entry not found");
            }
            const user = await getUser(ctx.db, auditLog.actor);
            return {
                ...auditLog,
                actor: {
                    id: auditLog.actor,
                    name: user?.fullName ?? "Unknown",
                },
            };
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
