import type { User } from "@supabase/auth-helpers-nextjs";

export const getUserName = (user: User): string => {
    if (!user.user_metadata) {
        return (user.email ?? "").split("@")[0] ?? "";
    }

    return user.user_metadata.full_name;
};

export const getUserId = (user: User): string => {
    return user.id;
}

export const getUserAvatar = (user: User): string => {
    if (!user.user_metadata) {
        return "";
    }

    return user.user_metadata.avatar_url;
}