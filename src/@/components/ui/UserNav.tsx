import { createClientComponentClient, type User } from "@supabase/auth-helpers-nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { getUserAvatar, getUserName } from "~/utils/user";
import { useRouter } from "next/router";

export const UserNav = ({ user }: { user: User }) => {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut({}).catch((error) => {
            console.log(error);
        });
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
                    <DropdownMenuItem>
                        Nastavení
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout}>Odhlásit se</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
