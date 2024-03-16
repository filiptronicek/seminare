import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ensureAdmin, getStudent } from "~/server/auth";
import { singleUserUpdateSchema } from "~/utils/schemas";

export const userRouter = createTRPCRouter({
    changeClass: publicProcedure.input(z.object({ class: z.string() })).mutation(async ({ input, ctx }) => {
        const student = await getStudent(ctx.auth, ctx.db);
        if (!student) throw new Error("Student not found");

        return ctx.db.student.update({
            where: {
                id: student.id,
            },
            data: {
                class: input.class,
            },
        });
    }),
    get: publicProcedure.query(async ({ ctx }) => {
        return getStudent(ctx.auth, ctx.db);
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
        await ensureAdmin(ctx.auth, ctx.db);

        // todo: ensure users are not able to update their own admin status

        return ctx.db.student.update({
            where: { id: input.id },
            data: {
                class: input.data.class,
                admin: input.data.role === "admin",
            }
        });
    }),
    delete: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
        await ensureAdmin(ctx.auth, ctx.db);

        // clean up if the student has selected any options on any events
        await ctx.db.studentOption.deleteMany({
            where: { studentId: input.id },
        });

        return ctx.db.student.delete({
            where: { id: input.id },
        });
    }),
});
