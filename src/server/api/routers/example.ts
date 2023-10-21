import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
    hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
        return {
            greeting: `Hello ${input.text}`,
        };
    }),
    changeStudentClass: publicProcedure.input(z.object({ class: z.string() })).mutation(({ input, ctx }) => {
        return ctx.db.student.update({
            where: {
                id: "",
            },
            data: {
                class: input.class,
            },
        });
    }),
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.db.student.findMany();
    }),
    listEvents : publicProcedure.query(({ ctx }) => {
        return ctx.db.event.findMany({take: 10});
    }),
    getEvent : publicProcedure.input(z.object({id: z.string()})).query(({input, ctx}) => {
        return ctx.db.event.findUnique({where: {id: input.id}});
    }),
});
