import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getTable, updateTableRow } from "@/general";
import { PageLoader } from "@/components/ui/loader";
import { Search, User as UserIcon } from "lucide-react";
import type { User } from "@/pages/users/columns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UserSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subProjectId?: number;
  onAssignComplete?: () => void;
}

export function UserSelectDialog({ open, onOpenChange, subProjectId, onAssignComplete }: UserSelectDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getTable('users', (data: User[] | {error: {error: string, status: number}}) => {
        if ('error' in data) {
          console.error('Error loading users:', data.error);
        } else {
          setUsers(data as User[]);
        }
        setIsLoading(false);
      }, false);
    } else {
      // Reset state when dialog closes
      setSearchQuery("");
      setSelectedUser(null);
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    const query = searchQuery.toLowerCase();
    return users.filter(user => {
      const fullName = `${user.name || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const mobile = (user.mobile || '').toLowerCase();
      const nationalNumber = (user.nationalNumber || '').toLowerCase();
      
      return fullName.includes(query) || 
             email.includes(query) || 
             mobile.includes(query) ||
             nationalNumber.includes(query);
    });
  }, [users, searchQuery]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleAssign = () => {
    if (!selectedUser?.id) return;

    // If subProjectId is provided, directly assign the unit to the selected user
    if (subProjectId) {
      setIsAssigning(true);
      updateTableRow('subprojects', subProjectId, {userId: selectedUser.id}, (data: any) => {
        setIsAssigning(false);
        if(data && 'id' in data && data.id){
          toast.success(`واحد با موفقیت به ${selectedUser.name} ${selectedUser.lastName} اعطا شد`);
          onOpenChange(false);
          if (onAssignComplete) {
            onAssignComplete();
          }
        } else {
          toast.error('خطایی رخ داده است ' + JSON.stringify(data));
        }
      });
    } else {
      // Otherwise, navigate to assign-project page
      onOpenChange(false);
      const assignUrl = `/users/${selectedUser.id}/assign-project`;
      navigate(assignUrl);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">انتخاب کاربر برای اعطای واحد</DialogTitle>
          <DialogDescription>
            کاربر مورد نظر را جستجو و انتخاب کنید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="user-search">جستجوی کاربر</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="user-search"
                placeholder="جستجو بر اساس نام، ایمیل، موبایل یا کد ملی..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                autoFocus
              />
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-2">
            <Label>لیست کاربران</Label>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <PageLoader />
              </div>
            ) : (
              <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery ? "هیچ کاربری یافت نشد" : "هیچ کاربری وجود ندارد"}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUser?.id === user.id;
                      const fullName = `${user.name || ''} ${user.lastName || ''}`.trim();
                      
                      return (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className={cn(
                            "w-full p-4 text-right hover:bg-gray-50 transition-colors",
                            isSelected && "bg-blue-50 border-r-4 border-blue-500"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-full",
                              isSelected ? "bg-blue-100" : "bg-gray-100"
                            )}>
                              <UserIcon className={cn(
                                "h-5 w-5",
                                isSelected ? "text-blue-600" : "text-gray-600"
                              )} />
                            </div>
                            <div className="flex-1 text-right">
                              <div className="font-semibold text-gray-900">
                                {fullName || "بدون نام"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {user.email && <span>{user.email}</span>}
                                {user.email && user.mobile && <span className="mx-2">•</span>}
                                {user.mobile && <span>{user.mobile}</span>}
                              </div>
                              {user.type && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {user.type === 'admin' ? 'ادمین' : 
                                   user.type === 'system' ? 'مدیر سیستم' :
                                   user.type === 'tehranUni' ? 'عضو دانشگاه تهران' :
                                   user.type === 'otherUni' ? 'عضو سایر دانشگاه‌ها' :
                                   user.type === 'employee' ? 'کارمند غیر دانشگاهی' :
                                   user.type === 'free' ? 'عضو آزاد' : user.type}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <div className="text-blue-600 font-semibold">✓</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-900">
                <UserIcon className="h-5 w-5" />
                <span className="font-semibold">کاربر انتخاب شده:</span>
              </div>
              <div className="mt-2 text-blue-800">
                {selectedUser.name} {selectedUser.lastName}
                {selectedUser.email && <span className="text-sm block mt-1">{selectedUser.email}</span>}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedUser || isAssigning}
              className="min-w-[120px]"
            >
              {isAssigning ? 'در حال ثبت...' : 'ادامه'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

