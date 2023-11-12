import { useQuery } from "@tanstack/react-query";
import { type User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";

async function fetchUserData(): Promise<User> {
    const supabase = createClientComponentClient();

    try {
        const user = await supabase.auth.getUser();
        if (!user?.data?.user) {
            throw new Error("No user found");
        }

        return user.data.user;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}

// Define useUser hook
export function useUser() {
    return useQuery({ queryKey: ["user"], queryFn: fetchUserData, staleTime: 1000 * 60 * 60 * 24 });
}
