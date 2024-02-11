import type { PrismaClient } from "@prisma/client";
import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import { getUserName } from "~/utils/user";

export const createStudent = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await auth.getUser();
    if (!user.data.user) return null;

    return await db.student.create({
        data: {
            id: user.data.user.id,
            fullName: getUserName(user.data.user),
            class: undefined,
        },
    });
};

export const getStudent = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const user = await auth.getUser();
    if (!user.data.user) return null;

    const student = await db.student.findUnique({ where: { id: user.data.user.id } });
    if (!student) return await createStudent(auth, db);

    return student;
};

export const checkStudent = async (auth: SupabaseAuthClient, db: PrismaClient) => {
    const student = await getStudent(auth, db);
    if (!student) throw new Error("Student not found");

    return student;
};
