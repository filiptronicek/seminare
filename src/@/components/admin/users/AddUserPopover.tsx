"use client";
import { Button } from "@/components/ui/button";

import { PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AutoComplete } from "@/components/ui/autocomplete";
import { toast } from "@/components/ui/use-toast";
import { useCallback, useMemo, useState } from "react";
import { api } from "~/utils/api";
import { debounce } from "lodash";

type Props = {
    optionId: string;
    refetch: () => void;
};
export const AddUserPopover = ({ optionId, refetch }: Props) => {
    const [searchValue, setSearchValue] = useState("");

    const [debouncedValue, setDebouncedValue] = useState("");
    const { data: foundUsers, isLoading } = api.user.list.useQuery({ search: debouncedValue });
    const debouncedSetSearch = useCallback(
        debounce((value: string) => {
            setDebouncedValue(value);
        }, 200),
        [],
    );
    const handleSearchChange = (value: string) => {
        setSearchValue(value); // Update the input value immediately
        debouncedSetSearch(value); // Debounce the API call
    };

    const searchData = useMemo(() => {
        return foundUsers?.map((user) => ({
            value: user.id,
            label: user.fullName,
        }));
    }, [foundUsers]);

    const joinMutation = api.eventOptions.joinUnconditionally.useMutation();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="my-2 flex max-w-sm gap-2" variant={"secondary"}>
                    Přidat účastníka
                    <PlusCircle className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <AutoComplete
                    selectedValue={""}
                    onSelectedValueChange={(value) => {
                        if (!value) return;
                        joinMutation.mutate(
                            { optionId, userId: value },
                            {
                                onSettled: () => refetch(),
                                onError: (e) => {
                                    toast({ title: "Nepodařilo se přidat účastníka", description: e.message });
                                },
                            },
                        );
                    }}
                    searchValue={searchValue}
                    onSearchValueChange={handleSearchChange}
                    items={searchData ?? []}
                    isLoading={isLoading}
                    emptyMessage="Nenalezeno"
                    placeholder="Hledat..."
                />
            </PopoverContent>
        </Popover>
    );
};
