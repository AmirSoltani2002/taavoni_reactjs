import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { postTable } from "../../general"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"

export function LoginForm({
  className,
  type,
  ...props
}: React.ComponentProps<"div"> & { type: string }) {
  const navigate = useNavigate();
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="ml-auto">به اکانت خود وارد شوید</CardTitle>
          <CardDescription className="ml-auto">
            ایمیل خود را در زیر وارد کنید تا به حساب خود وارد شوید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => {
            e.preventDefault();
            postTable('auth/email/', {
              email: (e.target as HTMLFormElement).email.value,
              password: (e.target as HTMLFormElement).password.value
            }, (d) => {
              if(d.token) {
                Cookies.set('token', d.token);
                navigate('/dashboard', { replace: true});
              }
            }, false)
          }}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email" className="ml-auto">ایمیل</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                    <a
                    href="#"
                    className="mr-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                    رمزعبور را فراموش کرده‌اید؟
                    </a>
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
            {type !== 'admin' && <div className="mt-4 text-center text-sm">
              حساب کاربری ندارید؟
              <a href="/signup" className="underline underline-offset-4">
                {"ثبت‌نام"}
              </a>
            </div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
