import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useCallback, useEffect } from "react";

export default function Logout() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const utils = api.useContext();

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        await utils.invalidate();
        await router.push("/login");
    }, [router, supabase, utils]);

    useEffect(() => {
        handleLogout().catch(console.error);
    }, [handleLogout]);

    return null;
}
