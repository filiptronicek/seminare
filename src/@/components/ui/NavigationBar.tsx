import { cn } from "@/lib/utils";
import { GraduationCap, Home } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "./navigation-menu";

export const NavigationBar = ({}) => {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref className="">
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
                            <Home className="h-6 w-6" />
                            <span className="hidden sm:block">Nadcházející Akce</span>
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="https://gymnaziumtm.cz" legacyBehavior passHref className="">
                        <NavigationMenuLink
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(navigationMenuTriggerStyle(), "gap-2")}
                        >
                            <GraduationCap className="h-6 w-6" />
                            <span className="hidden sm:block">Stránky gymnázia</span>
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};
