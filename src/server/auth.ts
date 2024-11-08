import type { PrismaClient } from "@prisma/client";
import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import { TRPCError } from "@trpc/server";
import { SYSTEM_USER } from "~/utils/constants";
import { getUserName } from "~/utils/user";

export const createUser = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await auth.getUser();
    if (!user.data.user) return null;

    const newUser = db.student.create({
        data: {
            id: user.data.user.id,
            fullName: getUserName(user.data.user),
            class: undefined,
            admin: process.env.NODE_ENV === "development",
            avatar: user.data.user.user_metadata.picture as string,
        },
    });

    await db.auditLog
        .create({
            data: {
                actor: SYSTEM_USER,
                action: "user.create",
                metadata: {
                    user: user as never,
                },
                timestamp: new Date(),
            },
        })
        .catch((e) => console.error(`Recording audit log failed: ${e}`));

    return newUser;
};

export const getCurrentUser = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await auth.getUser();
    if (!user.data.user) return null;

    const userInDb = await db.student.findUnique({
        where: { id: user.data.user.id },
    });
    if (!userInDb) return createUser(auth, db);

    return userInDb;
};

export const getUser = async (db: PrismaClient, id: string) => {
    if (id === SYSTEM_USER) {
        return {
            id: SYSTEM_USER,
            fullName: "Systém",
            class: null,
            avatar: null,
            admin: true,
            suspended: false,
        };
    }

    return db.student.findUnique({
        where: { id },
    });
};

export const isAdmin = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const student = await getCurrentUser(auth, db);
    if (!student) return false;

    return student.admin;
};

export const ensureUser = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await getCurrentUser(auth, db);
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
    const user = await getCurrentUser(auth, db);
    if (!user || user.suspended || !user.admin)
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Lacking admin privileges",
        });

    return user;
};
