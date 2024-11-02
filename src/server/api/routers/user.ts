import { TRPCError } from "@trpc/server";
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
                throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to update other users" });
            }

            let newClass = input.data.class as string | null;
            if (input.data.role === "admin") {
                // admins do not have a class
                newClass = null;
            }

            return ctx.db.student.update({
                where: { id: input.id },
                data: {
                    class: newClass,
                    admin: input.data.role === "admin",
                    suspended: input.data.suspended,
                },
            });
        }

        if (input.data.role === "user" && user.admin) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "You are not allowed to demote yourself to a user" });
        }
        if (input.data.role === "admin" && !user.admin) {
            throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to promote yourself to an admin" });
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
            throw new TRPCError({ code: "BAD_REQUEST", message: "You are not allowed to delete yourself" });
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
