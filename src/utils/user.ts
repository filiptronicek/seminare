import type { User } from "@supabase/auth-helpers-nextjs";

export const getUserName = (user: User) => {
    if (!user.user_metadata) {
        return (user.email ?? "").split("@")[0];
    }

    return user.user_metadata.full_name;
};
