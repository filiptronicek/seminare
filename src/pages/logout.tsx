import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useCallback, useEffect } from "react";

export default function Logout() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const utils = api.useUtils();
    const { data, isError, refetch } = api.user.get.useQuery();

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        await refetch();
        await utils.user.get.invalidate();
    }, [refetch, supabase.auth, utils]);

    useEffect(() => {
        handleLogout().catch(console.error);
    }, [handleLogout]);

    if (isError) {
        void router.push("/login");
    }

    if (data) {
        return <div>Logging out...</div>;
    }

    return null;
}
