import { createClientComponentClient, type User } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { getUserAvatar, getUserName } from "~/utils/user";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./dropdown-menu";

export const AvatarDropdown = ({ user }: { user: User }) => {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const utils = api.useContext();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await utils.invalidate();
        await router.push("/login");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={getUserAvatar(user)} alt="" />
                        <AvatarFallback>{getUserName(user)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getUserName(user)}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {/* todo: make the link behave properly */}
                    <Link href={"/settings"}>
                        <DropdownMenuItem>Nastavení</DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        handleLogout().catch(console.error);
                    }}
                >
                    Odhlásit se
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
