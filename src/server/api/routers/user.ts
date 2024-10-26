import { z } from "zod";

import { adminProcedure, authedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { CLASSES } from "~/utils/constants";
import { singleUserUpdateSchema } from "~/utils/schemas";

export const userRouter = createTRPCRouter({
    get: authedProcedure.query(({ ctx }) => {
        return ctx.user;
    }),
    list: adminProcedure
        .input(
            z
                .object({
                    class: z.enum(CLASSES),
                })
                .partial(),
        )
        .query(async ({ input, ctx }) => {
            return ctx.db.student.findMany({
                select: {
                    id: true,
                    fullName: true,
                    class: true,
                    avatar: true,
                    admin: true,
                    suspended: true,
                },
                where: {
                    class: input.class,
                },
                orderBy: {
                    fullName: "asc",
                },
            });
        }),
    update: authedProcedure.input(singleUserUpdateSchema).mutation(async ({ input, ctx }) => {
        const { user } = ctx;

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
                    suspended: input.data.suspended,
                },
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
            },
        });
    }),
    delete: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
        if (input.id === ctx.user.id) {
            throw new Error("You are not allowed to delete yourself");
        }

        // clean up if the student has selected any options on any events
        await ctx.db.student.update({
            where: { id: input.id },
            data: {
                options: {
                    set: [],
                },
            },
        });

        return ctx.db.student.delete({
            where: { id: input.id },
        });
    }),
    /**
     * Reset the class attribution for all students, forcing them to reselect their class when they next log in
     */
    resetClassAttribution: adminProcedure.mutation(async ({ ctx }) => {
        return ctx.db.student.updateMany({
            data: {
                class: null,
            },
        });
    }),
});
