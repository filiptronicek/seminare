import { cn } from "@/lib/utils";
import { Brush, GraduationCap, Home } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "./navigation-menu";

import mmpLogo from "../../../media/logo.svg";
import Image from "next/image";
import { api } from "~/utils/api";

export const NavigationBar = () => {
    const {
        data: student
    } = api.events.getStudent.useQuery();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Image src={mmpLogo as string} alt="Logo" width={30} height={30} />
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
                            <Home className="size-6" />
                            <span className="hidden sm:block">Nadcházející Akce</span>
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="https://gymnaziumtm.cz" legacyBehavior passHref>
                        <NavigationMenuLink
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(navigationMenuTriggerStyle(), "gap-2")}
                        >
                            <GraduationCap className="size-6" />
                            <span className="hidden sm:block">Stránky gymnázia</span>
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                {student?.admin && (
                    <NavigationMenuItem>
                        <Link href="/admin" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
                                <Brush className="size-6" />
                                <span className="hidden sm:block">Správa Akcí</span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                )}
            </NavigationMenuList>
        </NavigationMenu>
    );
};
