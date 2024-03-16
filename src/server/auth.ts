import type { PrismaClient } from "@prisma/client";
import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import { getUserName } from "~/utils/user";

export const createUser = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await auth.getUser();
    if (!user.data.user) return null;

    return await db.student.create({
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

    const student = await db.student.findUnique({
        where: { id: user.data.user.id },
    });
    if (!student) return await createUser(auth, db);

    return student;
};

export const isAdmin = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const student = await getUser(auth, db);
    if (!student) return false;

    return student.admin;
};

export const ensureUser = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const student = await getUser(auth, db);
    if (!student) throw new Error("Student not found");

    return student;
};

export const ensureAdmin = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const student = await getUser(auth, db);
    if (!student) throw new Error("User not found");
    if (!student.admin) throw new Error("Lacking admin privileges");

    return student;
};
