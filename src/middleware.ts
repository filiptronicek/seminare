import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const session = await supabase.auth.getSession();

    if (session.data.session?.user) {
        if (req.nextUrl.pathname === "/login") {
            const url = req.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    } else {
        if (req.nextUrl.pathname !== "/login") {
            const url = req.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    }

    return res;
}
