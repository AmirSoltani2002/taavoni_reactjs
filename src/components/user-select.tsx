import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { User } from "@/pages/users/columns";

interface UserSelectProps {
    users: User[];
    selectedUserId?: number | '';
    onUserSelect: (userId: number | '') => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    className?: string;
    showAllOption?: boolean;
    allOptionLabel?: string;
}

export function UserSelect({
    users,
    selectedUserId,
    onUserSelect,
    placeholder = "انتخاب کاربر...",
    label,
    required = false,
    className = "w-full",
    showAllOption = false,
    allOptionLabel = "همه کاربران",
}: UserSelectProps) {
    const [userSelectOpen, setUserSelectOpen] = useState(false);

    const getUserLabel = (user: User) => {
        const name = user.name || '';
        const lastName = user.lastName || '';
        return `${name} ${lastName}`.trim();
    };

    const selectedUser = useMemo(() => {
        if (!selectedUserId) return null;
        return users.find(u => u.id === selectedUserId) || null;
    }, [users, selectedUserId]);

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
            )}
            <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={userSelectOpen}
                        className={cn("justify-between", className)}
                    >
                        {selectedUser
                            ? getUserLabel(selectedUser)
                            : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className={cn("w-[var(--radix-popover-trigger-width)] p-0 z-[9999]", className)} 
                    align="start"
                    style={{ pointerEvents: 'auto' }}
                >
                    <Command>
                        <CommandInput placeholder="جستجوی کاربر..." />
                        <CommandList>
                            <CommandEmpty>کاربری پیدا نشد</CommandEmpty>
                            <CommandGroup>
                                {showAllOption && (
                                    <CommandItem
                                        value="all"
                                        onSelect={() => {
                                            onUserSelect('');
                                            setUserSelectOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "ml-2 h-4 w-4",
                                                !selectedUserId ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {allOptionLabel}
                                    </CommandItem>
                                )}
                                {users.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        value={`${user.name || ''} ${user.lastName || ''} ${user.nationalNumber || ''}`}
                                        onSelect={() => {
                                            const newUserId = user.id === selectedUserId ? '' : user.id;
                                            onUserSelect(newUserId || '');
                                            setUserSelectOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "ml-2 h-4 w-4",
                                                selectedUserId === user.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {getUserLabel(user)}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

