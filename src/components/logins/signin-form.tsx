import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { api_base_url, timeFormat } from "../../config"
import { Calendar22 } from "../calendars/calendar"
import {Switch} from "../ui/switch"
import { postData } from "../../general"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select"


import { SignupDataMap, type SignupData } from "./interfaces"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "sonner"
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [isIsargar, setIsIsargar] = React.useState<boolean>(false)
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="ml-auto">حساب خود را بسازید</CardTitle>
          <CardDescription className="ml-auto">
            لطفا فرم زیر را پر کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => {
            e.preventDefault();
            // Handle form submission logic here
            if((e.target as HTMLFormElement).password.value !== (e.target as HTMLFormElement).passwordRepeat.value){
              toast
            }
            const formData = new FormData(e.currentTarget);
            const data = {...Object.fromEntries(formData.entries()), birthDate: `${date?.toLocaleDateString(timeFormat)}`};
            console.log({data});
            postData<SignupData>(api_base_url + '/signup', data as SignupData).then(response => {
              console.log(response);
            });
          }}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                {['نام', 'نام خانوادگی', 'کدملی', 'تاریخ تولد', 'ایمیل', 'شماره تلفن همراه', 'شماره تلفن منزل', 'شماره تلفن محل کار'].map(item => {
                    return(
                    <div className="grid gap-3">  
                        {(item === 'تاریخ تولد') && (
                            <Calendar22
                                date={date}
                                setDate={setDate}
                            />
                        )}
                        {item !== 'تاریخ تولد' && (
                            <div>
                            <Label htmlFor={item} className={item === 'ایمیل' ? "ml-auto" : "mr-auto"}>{item}</Label>
                            <Input
                                id={item}
                                name={SignupDataMap[item as keyof typeof SignupDataMap]}
                                type={item === 'ایمیل' ? 'email' : item.startsWith('شماره تلفن') ? 'tel' : 'text'}
                                placeholder={item === 'ایمیل' ? 'example@example.com' : item.startsWith('شماره تلفن') ? 'شماره تلفن همراه با کد' : ''}
                                required
                            />
                            </div>)
                        }
                    </div>)
                })}
              </div>
              <div className="grid grid-cols-2">
                <div>
                  <Label htmlFor="sex-type" className="ml-auto">جنسیت</Label>
                  <Select name='sex' required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="جنسیت را انتخاب کنید." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>جنسیت</SelectLabel>
                        <SelectItem value="male">مرد</SelectItem>
                        <SelectItem value="female">زن</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="membership-type" className="ml-auto">نوع عضویت</Label>
                  <Select name='type' required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="نوع عضویت را انتخاب کنید." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>عضو دانشگاهی</SelectLabel>
                        <SelectItem value="teh-university">عضو دانشگاه تهران</SelectItem>
                        <SelectItem value="etc-universities">عضو سایر دانشگاه‌ها</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>غیر دانشگاهی</SelectLabel>
                        <SelectItem value="employee">عضو کارمند</SelectItem>
                        <SelectItem value="self">عضو آزاد</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="mr-auto">آدرس</Label>
                <Input
                  name="address"
                  id="address"
                  type="text"
                  required
                />
              </div>
              <div className="grid grid-cols-2 ml-auto mr-auto">
                <Switch
                  checked={isIsargar}
                  onCheckedChange={setIsIsargar}
                />
                <Label htmlFor="isargari-type" className="ml-auto">ورود اطلاعات ایثارگری</Label>
              </div>
              {isIsargar && <div className="grid grid-cols-2">
                <div>
                <Label htmlFor="isargari-type" className="ml-auto">درصد جانبازی</Label>
                <Select name="isargari_percent">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="درصد جانبازی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>جانبازان</SelectLabel>
                      <SelectItem value="10-15">۱۰−۱۵%</SelectItem>
                      <SelectItem value="15-25">۱۵−۲۵%</SelectItem>
                      <SelectItem value="25">+۲۵%</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                </div>
                <div>
                <Label htmlFor="azade-type" className="ml-auto">تعدادماه‌های حصور در جبهه</Label>
                <Input name="azade_months" type="number"  placeholder="تعداد ماه‌های حضور در جبهه" />
                </div>
                <div>
                <Label htmlFor="azade-type" className="ml-auto">تعدادماه‌های اسارت</Label>
                <Input name="azade_esarat_months"  type="number" placeholder="تعداد ماه‌های حضور در اسارت" />
                </div>
                <div>
                <Label htmlFor="family_shahid-type" className="ml-auto">تعداد شهید خانواده</Label>
                <Input name="shahed_family_number"  type="number" placeholder="تعداد شهید خانواده" />
                </div>
              </div>}
              {isIsargar && 
                <div>
                <Label htmlFor="family_shahid-type" className="ml-auto">نزدیک‌ترین ارتباط با ایثارگران</Label>
                <Select name="khanevade_shahed_type">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="نزدیک‌ترین ارتباط با ایثارگران را انتخاب کنید." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>رابطه</SelectLabel>
                      <SelectItem value="azade_wife">همسر آزاده</SelectItem>
                      <SelectItem value="azade_child">فرزند آزاده</SelectItem>
                      <SelectItem value="jan_wife">همسر جانباز</SelectItem>
                      <SelectItem value="jan_child">فرزند جانباز</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                </div>
              }
              <div>
                <Label htmlFor="id-card" className="ml-auto">تصویر کارت ملی</Label>
                <Input
                  name="idCardImage"
                  id="id-card"
                  type="file"
                  accept="image/*"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="ml-auto">رمز عبور</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password-repeat" className="ml-auto">تکرار رمز عبور</Label>
                <Input
                  name="passwordRepeat"
                  id="password-repeat"
                  type="password"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  ورود
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              حساب کاربری دارید؟
              <a href="/signin?type=investor" className="underline underline-offset-4">
                ورود
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
