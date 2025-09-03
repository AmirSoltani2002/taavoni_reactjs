import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { postData } from "../../general"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { api_base_url } from "../../config"
import type { LoginData } from "./interfaces"

export function LoginForm({
  className,
  type,
  ...props
}: React.ComponentProps<"div"> & { type: string }) {
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
            postData<LoginData>(api_base_url + '/login', {
              email: (e.target as HTMLFormElement).email.value,
              password: (e.target as HTMLFormElement).password.value,
              type: type
            }).then(response => {
              console.log(response); // JSON data parsed by `data.json()` call
            });
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
                <Button onClick={e => e.preventDefault()} type="button" variant="outline" className="w-full">
                  ورود با گوگل
                </Button>
              </div>
            </div>
            {type !== 'admin' && <div className="mt-4 text-center text-sm">
              حساب کاربری ندارید؟
              <a href="/signup" className="underline underline-offset-4">
                ثبتنام
              </a>
            </div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
