import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ensureAdmin, ensureUser, getUser } from "~/server/auth";
import { singleUserUpdateSchema } from "~/utils/schemas";

export const userRouter = createTRPCRouter({
    get: publicProcedure.query(async ({ ctx }) => {
        return getUser(ctx.auth, ctx.db);
    }),
    list: publicProcedure.query(async ({ ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        return ctx.db.student.findMany({
            select: {
                id: true,
                fullName: true,
                class: true,
                avatar: true,
                admin: true,
            }
        });
    }),
    update: publicProcedure.input(singleUserUpdateSchema).mutation(async ({ input, ctx }) => {
        const user = await ensureUser(ctx.auth, ctx.db);

        // only admins can update other users
        if (input.id && input.id !== user.id) {
            if (!user.admin) {
                throw new Error("You are not allowed to update other users");
            }

            return ctx.db.student.update({
                where: { id: input.id },
                data: {
                    class: input.data.class,
                    admin: input.data.role === "admin",
                }
            });
        }

        if (input.data.role === "user" && user.admin) {
            throw new Error("You are not allowed to demote yourself to a user");
        }

        // users can only update their own class
        return ctx.db.student.update({
            where: { id: user.id },
            data: {
                class: input.data.class,
            }
        });
    }),
    delete: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
        const user = await ensureAdmin(ctx.auth, ctx.db);
        if (input.id === user.id) {
            throw new Error("You are not allowed to delete yourself");
        }

        // clean up if the student has selected any options on any events
        await ctx.db.studentOption.deleteMany({
            where: { studentId: input.id },
        });

        return ctx.db.student.delete({
            where: { id: input.id },
        });
    }),
});
