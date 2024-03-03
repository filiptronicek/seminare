import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getStudent } from "~/server/auth";

export const userRouter = createTRPCRouter({
    changeStudentClass: publicProcedure.input(z.object({ class: z.string() })).mutation(async ({ input, ctx }) => {
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
    getStudent: publicProcedure.query(async ({ ctx }) => {
        return getStudent(ctx.auth, ctx.db);
    }),
});
