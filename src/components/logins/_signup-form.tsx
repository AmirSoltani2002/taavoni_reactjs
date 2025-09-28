import {useState} from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Calendar22 } from "../calendars/calendar"
import {Switch} from "../ui/switch"
import { postTable } from "../../general"
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


import type { User } from "@/pages/users/columns";
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "sonner";
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isIsargar, setIsIsargar] = useState<boolean>(false)
  const [idcardFile, setIdcardFile] = useState<File>()
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const placeholders: {
    [k: string]: string
  } = {
    'شماره تلفن همراه': '0900000000',
    'ایمیل': 'example@gmail.com',
    'شماره تلفن منزل': '02100000000',
    'شماره تلفن محل کار': '02100000000',
    'sex': 'جنسیت را انتخاب کنید.',
    'type': "نوع عضویت را انتخاب کنید.",

  }
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
          <form onSubmit={(e) => {
            e.preventDefault();
            // Handle form submission logic here
            if((e.target as HTMLFormElement).password.value !== (e.target as HTMLFormElement).passwordRepeat.value){
              toast("رمز عبور با تکرار آن مطابقت ندارد.");
              return;
            }
            const formData = new FormData(e.currentTarget);
            // Map formData to User type
            const data: Partial<User> = {
              name: formData.get('name') as string,
              lastName: formData.get('lastName') as string,
              nationalNumber: formData.get('nationalNumber') as string,
              birthDay: date ? date.toISOString() : '',
              email: formData.get('email') as string,
              mobile: formData.get('mobile') as string,
              homePhone: formData.get('homePhone') as string,
              workPhone: formData.get('workPhone') as string,
              sex: formData.get('sex') as User['sex'],
              type: formData.get('type') as User['type'],
              address: formData.get('address') as string,
              isargaryPercent: formData.get('isargaryPercent') ? Number(formData.get('isargaryPercent')) : null,
              azadeMonths: formData.get('azadeMonths') ? Number(formData.get('azadeMonths')) : null,
              azadeEsaratMonths: formData.get('azadeEsaratMonths') ? Number(formData.get('azadeEsaratMonths')) : null,
              shahedFamilyNumber: formData.get('shahedFamilyNumber') ? Number(formData.get('shahedFamilyNumber')) : null,
              shahedRelation: formData.get('shahedRelation') as User['shahedRelation'],
              password: formData.get('password') as string,
            };
            postTable('users', data).then(response => {
              console.log(response);
            });
            if(!idcardFile){return;}
            const fileFormData = new FormData();
            fileFormData.append('file', idcardFile);
            // Optionally, add user info or metadata here
            try {
              postTable('user-doc', fileFormData, () => {
                toast('کارت ملی با موفقیت آپلود شد.');
              });
            } catch (err) {
              toast('خطا در آپلود کارت ملی');
            }
          }}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Map User fields directly, not via SignupDataMap. */}
                { [
                  { label: 'نام', name: 'name', type: 'text', placeholder: '' },
                  { label: 'نام خانوادگی', name: 'lastName', type: 'text', placeholder: '' },
                  { label: 'کدملی', name: 'nationalNumber', type: 'text', placeholder: '' },
                  { label: 'تاریخ تولد', name: 'birthDay', type: 'date', placeholder: '' },
                  { label: 'ایمیل', name: 'email', type: 'email', placeholder: 'example@gmail.com' },
                  { label: 'شماره تلفن همراه', name: 'mobile', type: 'tel', placeholder: '0900000000' },
                  { label: 'شماره تلفن منزل', name: 'homePhone', type: 'tel', placeholder: '02100000000' },
                  { label: 'شماره تلفن محل کار', name: 'workPhone', type: 'tel', placeholder: '02100000000' },
                ].map(item => (
                  <div className="grid gap-3">
                    {item.name === 'birthDay' ? (
                      <Calendar22
                        title="تاریخ تولد"
                        date={date}
                        setDate={setDate}
                      />
                    ) : (
                      <div>
                        <Label htmlFor={item.name} className={item.name === 'email' ? 'ml-auto' : 'mr-auto'}>{item.label}</Label>
                        <Input
                          id={item.name}
                          name={item.name}
                          type={item.type}
                          placeholder={item.placeholder}
                          required
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2">
                <div>
                  <Label htmlFor="sex-type" className="ml-auto">جنسیت</Label>
                  <Select name='sex' required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={placeholders['sex']} />
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
                      <SelectValue placeholder={placeholders['type']} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>عضو دانشگاهی</SelectLabel>
                        <SelectItem value="tehranUni">عضو دانشگاه تهران</SelectItem>
                        <SelectItem value="otherUni">عضو سایر دانشگاه‌ها</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>غیر دانشگاهی</SelectLabel>
                        <SelectItem value="employee">عضو کارمند</SelectItem>
                        <SelectItem value="free">عضو آزاد</SelectItem>
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
                <Select name="isargaryPercent">
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
                <Input name="azadeMonths" type="number"  placeholder="تعداد ماه‌های حضور در جبهه" />
                </div>
                <div>
                <Label htmlFor="azade-type" className="ml-auto">تعدادماه‌های اسارت</Label>
                <Input name="azadeEsaratMonths"  type="number" placeholder="تعداد ماه‌های حضور در اسارت" />
                </div>
                <div>
                <Label htmlFor="family_shahid-type" className="ml-auto">تعداد شهید خانواده</Label>
                <Input name="shahedFamilyNumber"  type="number" placeholder="تعداد شهید خانواده" />
                </div>
              </div>}
              {isIsargar && 
                <div>
                <Label htmlFor="family_shahid-type" className="ml-auto">نزدیک‌ترین ارتباط با ایثارگران</Label>
                <Select name="shahedRelation">
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
                <Label htmlFor="password" className="ml-auto">رمز عبور</Label>
                <Label htmlFor="password" className="text-xs p-4 text-red-400 transition-all">
                  {showPasswordHint && <span>
                    رمز عبور باید حداقل ۸ کارکتر و شامل حروف انگلیسی، عدد و حداقل یک کارکتر خاص (!@#$%^&*) باشد
                  </span>}
                </Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  onFocus={() => setShowPasswordHint(true)}
                  onBlur={() => setShowPasswordHint(false)}
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
              {/* User type expects nationalCard (string), not file. Add a separate upload for ID card file. */}
              <div>
                <Label htmlFor="id-card-upload" className="ml-auto">آپلود تصویر یا PDF کارت ملی</Label>
                <Input
                  name="idCardFile"
                  id="id-card-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIdcardFile(file);
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  {"ثبت‌نام"}
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
