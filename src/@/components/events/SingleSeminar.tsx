import dayjs from "dayjs";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/dates";
import { SingleSeminarOptionListing } from "./SingleSeminarOptionListing";
import { parseSeminarMeta, parseSeminarOptionMeta } from "~/utils/seminars";
import { Pen } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import type { Letter, SeminarOptionEnrichedWithUserCount, Branch, seminarOptionMetadataSchema } from "~/utils/schemas";
import { type z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const displayHoursWithSelected = (hours: number) => {
    if (hours === 1) {
        return "Vybrána 1 hodina";
    }
    if (hours < 5) {
        return `Vybrány všechny ${hours} hodiny`;
    }

    return `Vybráno všech ${hours} hodin`;
};

type SeminarOptionEnrichedWithMeta = SeminarOptionEnrichedWithUserCount & {
    metadata: z.infer<typeof seminarOptionMetadataSchema>;
};

type Props = {
    id: string;
};
export const SingleSeminar = ({ id }: Props) => {
    const { data: event, error } = api.event.get.useQuery({ id });
    const { data: options, error: optionsError } = api.eventOptions.list.useQuery({
        id,
    });
    const { data: student } = api.user.get.useQuery();

    const seminarMetadata = useMemo(() => {
        if (!event?.metadata) return null;

        return parseSeminarMeta(event.metadata);
    }, [event]);

    const { data: selectedOptions, refetch: refetchSelected } = api.eventOptions.listStudentOptions.useQuery({
        eventId: id,
    });

    const isSignupOpen = useMemo(() => {
        const currentDate = dayjs();
        return currentDate.isAfter(dayjs(event?.signupStartDate)) && currentDate.isBefore(dayjs(event?.signupEndDate));
    }, [event?.signupStartDate, event?.signupEndDate]);

    const signupInThePast = useMemo(() => {
        const currentDate = dayjs();
        return currentDate.isAfter(dayjs(event?.signupEndDate));
    }, [event?.signupEndDate]);

    const optionMeta = useMemo<Map<string, z.infer<typeof seminarOptionMetadataSchema>>>(() => {
        if (!options) return new Map();

        return new Map(
            options.map((option) => {
                return [option.id, parseSeminarOptionMeta(option.metadata)];
            }),
        );
    }, [options]);

    const selectedOneofBranches = useMemo<Map<Letter, string>>(() => {
        const usedCategories = new Map<Letter, string>();

        if (!selectedOptions) return usedCategories;
        if (!options) return usedCategories;

        for (const option of selectedOptions) {
            const meta = optionMeta.get(option.id);
            const branchData = seminarMetadata?.availableBranches.find((branch) => branch.id === meta?.branch);

            if (branchData && branchData.type === "oneof" && !usedCategories.has(branchData.boundWith)) {
                usedCategories.set(branchData.boundWith, branchData.id);
            }
        }

        return usedCategories;
    }, [optionMeta, options, selectedOptions, seminarMetadata?.availableBranches]);

    const hoursSelected = useMemo(() => {
        if (!selectedOptions) return 0;
        if (optionMeta.size === 0) return 0;

        return selectedOptions.reduce((acc, option) => {
            const { hoursPerWeek } = optionMeta.get(option.id)!;

            return acc + hoursPerWeek;
        }, 0);
    }, [optionMeta, selectedOptions]);

    const remainingToSelect = (seminarMetadata?.requiredHours ?? 0) - hoursSelected;
    const branchedOptions = useMemo<Record<string, SeminarOptionEnrichedWithMeta[]>>(() => {
        if (!options) return {};

        const branched: Record<string, SeminarOptionEnrichedWithMeta[]> = {};

        for (const option of options) {
            if (!option.metadata) continue;

            const meta = parseSeminarOptionMeta(option.metadata);
            option.metadata = meta;

            if (!branched[meta.branch]) {
                branched[meta.branch] = [];
            }

            // typescript doesn't like that we're replacing the json metadata with the parsed one, so we need to cast it
            branched[meta.branch]?.push(option as SeminarOptionEnrichedWithMeta);
        }

        return branched;
    }, [options]);

    const intlFormatter = useMemo(() => new Intl.RelativeTimeFormat("cs", { numeric: "auto" }), []);
    const formattedSignUpStartDate = useMemo<string>(() => {
        if (!event) return "";
        const dayDiff = dayjs(event.signupStartDate).startOf("day").diff(dayjs().startOf("day"), "days");
        if (dayDiff < 7) {
            return intlFormatter.format(dayDiff, "day");
        }

        return formatDate(dayjs(event.signupEndDate));
    }, [event, intlFormatter]);
    const formattedSignUpEndDate = useMemo<string>(() => {
        if (!event) return "";
        const dayDiff = dayjs(event.signupEndDate).startOf("day").diff(dayjs().startOf("day"), "days");
        if (dayDiff < 7) {
            return intlFormatter.format(dayDiff, "day");
        }

        return formatDate(dayjs(event.signupEndDate));
    }, [event, intlFormatter]);

    if (error || optionsError) {
        return <div>Chyba v načítání</div>;
    }

    return (
        <>
            {event && (
                <section className="flex flex-col gap-1">
                    <header className="flex justify-between">
                        <h1 className="text-4xl font-bold my-4">{event.title}</h1>
                        {student?.admin && (
                            <Button variant={"secondary"} asChild className="flex items-center gap-2 w-28">
                                <Link href={`/admin/events/${event.id}`}>
                                    <Pen size={16} /> Upravit
                                </Link>
                            </Button>
                        )}
                    </header>

                    <span className="font-bold">
                        {isSignupOpen ?
                            <>
                                {/* todo: convert to `<time>` */}
                                Přihlašování končí {formattedSignUpEndDate}
                            </>
                        : signupInThePast ?
                            <>Přihlašování skončilo {formattedSignUpEndDate}</>
                        :   <>Přihlašování začíná {formattedSignUpStartDate}</>}
                    </span>

                    <span className="font-bold">
                        {remainingToSelect > 0 ?
                            <>
                                Zbývající hodiny k vybrání: {remainingToSelect} z {seminarMetadata?.requiredHours}
                            </>
                        :   `${displayHoursWithSelected(hoursSelected)} ✅`}
                    </span>

                    <br className="my-2" />

                    <span className="whitespace-pre-line text-balance max-w-3xl">{event.description}</span>

                    {/* If there is only one branch, we don't need to do anything fancy and can just render the options */}
                    {Object.keys(branchedOptions).length === 1 && options && (
                        <div className="mt-8">
                            <ul className="flex flex-wrap gap-4 justify-start">
                                {options.map((option) => {
                                    const metadata = optionMeta.get(option.id);
                                    const canSelect =
                                        metadata ?
                                            metadata.hoursPerWeek <=
                                            (seminarMetadata?.requiredHours ?? 0) - hoursSelected
                                        :   false;

                                    return (
                                        <SingleSeminarOptionListing
                                            key={option.id}
                                            refetchSelected={refetchSelected}
                                            event={event}
                                            option={option}
                                            selected={selectedOptions}
                                            canSelect={canSelect}
                                        />
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* If there are multiple branches, we need to render them separately and group the options by branch */}
                    {Object.keys(branchedOptions).length > 1 && (
                        <div className="mt-8">
                            <Tabs defaultValue="universal" className="w-full">
                                <TabsList>
                                    {seminarMetadata?.availableBranches.sort(sortBranch).map((branch) => {
                                        // If the branch has no content, we don't want to render it
                                        if (!branchedOptions[branch.id]) return null;
                                        const disabled =
                                            branch.type === "oneof" &&
                                            selectedOneofBranches.has(branch.boundWith) &&
                                            selectedOneofBranches.get(branch.boundWith) !== branch.id;

                                        return (
                                            <TabsTrigger key={branch.id} value={branch.id} disabled={disabled}>
                                                {branch.label} větev
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>
                                {Object.entries(branchedOptions).map(([branch, options]) => (
                                    <TabsContent key={branch} value={branch}>
                                        <ul className="flex flex-wrap gap-4 justify-start">
                                            {options.map((option) => {
                                                const metadata = optionMeta.get(option.id);
                                                const canSelect =
                                                    metadata ?
                                                        metadata.hoursPerWeek <=
                                                        (seminarMetadata?.requiredHours ?? 0) - hoursSelected
                                                    :   false;

                                                return (
                                                    <SingleSeminarOptionListing
                                                        key={option.id}
                                                        refetchSelected={refetchSelected}
                                                        event={event}
                                                        option={option}
                                                        selected={selectedOptions}
                                                        canSelect={canSelect}
                                                    />
                                                );
                                            })}
                                        </ul>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    )}
                </section>
            )}
        </>
    );
};

const sortBranch = (a: Branch, b: Branch) => {
    // prefer unbounds
    if (a.type === "unbound") return -1;
    if (b.type === "unbound") return 1;

    // then sort by label
    return a.label.localeCompare(b.label);
};
