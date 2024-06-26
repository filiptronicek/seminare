import type { PrismaClient } from "@prisma/client";
import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import { TRPCError } from "@trpc/server";
import { getUserName } from "~/utils/user";

export const createUser = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await auth.getUser();
    if (!user.data.user) return null;

    return db.student.create({
        data: {
            id: user.data.user.id,
            fullName: getUserName(user.data.user),
            class: undefined,
            avatar: user.data.user.user_metadata.picture as string,
        },
    });
};

export const getUser = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await auth.getUser();
    if (!user.data.user) return null;

    const userInDb = await db.student.findUnique({
        where: { id: user.data.user.id },
    });
    if (!userInDb) return createUser(auth, db);

    return userInDb;
};

export const isAdmin = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const student = await getUser(auth, db);
    if (!student) return false;

    return student.admin;
};

export const ensureUser = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await getUser(auth, db);
    if (!user)
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
        });

    if (user.suspended) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your account has been suspended",
        });
    }

    return user;
};

export const ensureAdmin = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await getUser(auth, db);
    if (!user || user.suspended || !user.admin)
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Lacking admin privileges",
        });

    return user;
};
