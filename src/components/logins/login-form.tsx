import { useState } from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { faToEn, postTable, getTable, logout } from "../../general"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { useNavigate } from "react-router-dom"
import { XIcon } from "lucide-react"
import type { User } from "../../pages/users/columns"
import { getUserType } from "../../pages/users/columns"

export function LoginForm({
  className,
  type,
  ...props
}: React.ComponentProps<"div"> & { type: string }) {
  const navigate = useNavigate();
  const [showRoleMismatchDialog, setShowRoleMismatchDialog] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  const handleLogin = () => {
    // Fetch user profile to check role
    getTable('users/profile', (user: User | {error?: any}) => {
      if (user && !('error' in user)) {
        const userType = (user as User).type || '';
        const isAdminUser = ['admin', 'system'].includes(userType);
        const isAdminLogin = type === 'admin';
        console.log({userType, isAdminUser, isAdminLogin});
        
        // Check if login type matches user role
        const roleMismatch = (isAdminLogin && !isAdminUser) || (!isAdminLogin && isAdminUser);
        
        if (roleMismatch) {
          // Show dialog before navigating
          setUserRole(getUserType(userType));
          setShowRoleMismatchDialog(true);
        } else {
          // Role matches, proceed to guide page
          navigate('/guide', { replace: true});
        }
      } else {
        // If we can't get user profile, proceed anyway
        // navigate('/dashboard', { replace: true});
      }
    }, false);
  };

  const handleProceed = () => {
    setShowRoleMismatchDialog(false);
    navigate('/guide', { replace: true});
  };

  const handleLogout = async () => {
    await logout();
    setShowRoleMismatchDialog(false);
    navigate('/', { replace: true});
  };

  return (
    <>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="ml-auto">به اکانت خود وارد شوید</CardTitle>
            <CardDescription className="ml-auto">
              کد ملی خود را در زیر وارد کنید تا به حساب خود وارد شوید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              postTable('auth/national/', {
                nationalNumber: faToEn(String(formData.get('email') || '')),
                password: String(formData.get('password') || '')
              }, (d) => {
                if(d.authenticated) {
                  handleLogin();
                }
              }, false)
            }}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email" className="ml-auto">کد ملی</Label>
                  <Input
                    name="email"
                    id="email"
                    type="text"
                    placeholder="0123456789"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">رمزعبور</Label>
                  </div>
                  <Input name="password" id="password" type="password" required />
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    ورود
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showRoleMismatchDialog} onOpenChange={setShowRoleMismatchDialog}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <button
            onClick={() => setShowRoleMismatchDialog(false)}
            className="absolute top-4 left-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">بستن</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-right">توجه</DialogTitle>
            <DialogDescription className="text-right text-base leading-relaxed">
              نقش کاربری شما <span className="font-semibold text-slate-900">{userRole}</span> می‌باشد. آیا مایل به ادامه فرآیند ورود هستید؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2 sm:gap-0">
            <Button
              onClick={handleProceed}
              variant="default"
              className="w-full sm:w-auto mx-auto"
            >
              بله، ادامه می‌دهم
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full sm:w-auto mx-auto"
            >
              خیر، از حساب کاربری خارج می‌شوم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
