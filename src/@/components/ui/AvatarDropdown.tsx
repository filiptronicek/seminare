import { type User } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
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

export const AvatarDropdown = ({ user }: { user: User }) => (
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
            <Link href={"/logout"}>
                <DropdownMenuItem>Odhlásit se</DropdownMenuItem>
            </Link>
        </DropdownMenuContent>
    </DropdownMenu>
);
