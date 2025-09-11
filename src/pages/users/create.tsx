import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar22 } from "@/components/calendars/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { postTable } from "@/general";
import { toast } from "sonner";

// User type based on columns.tsx
type UserForm = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
  homePhone: string;
  workPhone: string;
  nationalNumber: string;
  nationalCard: string;
  address: string;
  sex: "male" | "female" | "";
  birthDay: string;
  type: "admin" | "tehranUni" | "otherUni" | "free" | "employee" | "";
  isargaryPercent: number | null;
  azadeEsaratMonths: number | null;
  azadeMonths: number | null;
  shahedFamilyNumber: number | null;
  shahedRelation: "azade_wife" | "azade_child" | "jan_wife" | "jan_child" | "";
};

const initialState: UserForm = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  mobile: "",
  homePhone: "",
  workPhone: "",
  nationalNumber: "",
  nationalCard: "",
  address: "",
  sex: "",
  birthDay: "",
  type: "",
  isargaryPercent: null,
  azadeEsaratMonths: null,
  azadeMonths: null,
  shahedFamilyNumber: null,
  shahedRelation: "",
};

export default function UserCreate() {
  const [form, setForm] = useState<UserForm>(initialState);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: UserForm) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: keyof UserForm, value: string) => {
    setForm((prev: UserForm) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: UserForm) => ({ ...prev, [name]: value ? Number(value) : null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.birthDay) {
        toast.error('تاریخ تولد الزامی است');
         return;
    }
    // TODO: Replace with actual API call
    // Example: await createUser(form)
    postTable('users', form);
    // navigate("/users/list");
  };

  return (
    <div className="container mx-auto max-w-xl py-10">
      <h1 className="text-2xl font-bold mb-6">ایجاد کاربر جدید</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>نام*</Label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <Label>نام خانوادگی*</Label>
            <Input name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div>
            <Label>ایمیل*</Label>
            <Input name="email" value={form.email} onChange={handleChange} type="email" required />
          </div>
          <div>
            <Label>رمز عبور*</Label>
            <Input name="password" value={form.password} onChange={handleChange} type="password" required />
          </div>
          <div>
            <Label>موبایل*</Label>
            <Input name="mobile" value={form.mobile} onChange={handleChange} required />
          </div>
          <div>
            <Label>تلفن منزل*</Label>
            <Input name="homePhone" value={form.homePhone} onChange={handleChange} required />
          </div>
          <div>
            <Label>تلفن محل کار*</Label>
            <Input name="workPhone" value={form.workPhone} onChange={handleChange} required />
          </div>
          <div>
            <Label>کد ملی*</Label>
            <Input name="nationalNumber" value={form.nationalNumber} onChange={handleChange} required />
          </div>
          <div className="col-span-2">
            <Label>آدرس*</Label>
            <Input name="address" value={form.address} onChange={handleChange} required />
          </div>
          <div>
            <Label>جنسیت*</Label>
            <Select value={form.sex} onValueChange={v => handleSelect("sex", v)} required>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">مرد</SelectItem>
                <SelectItem value="female">زن</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Calendar22
              title="تاریخ تولد*"
              date={birthDate}
              setDate={(d) => {
                setBirthDate(d);
                setForm((prev) => ({ ...prev, birthDay: d ? d.toISOString().split("T")[0] : "" }));
              }}
            />
          </div>
          <div>
            <Label>نوع اکانت*</Label>
            <Select value={form.type} onValueChange={v => handleSelect("type", v)} required>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">ادمین</SelectItem>
                <SelectItem value="tehranUni">عضو دانشگاه تهران</SelectItem>
                <SelectItem value="otherUni">عضو سایر دانشگاه ها</SelectItem>
                <SelectItem value="free">عضو آزاد</SelectItem>
                <SelectItem value="employee">کارمند</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>درصد ایثارگری</Label>
            <Input name="isargaryPercent" value={form.isargaryPercent ?? ""} onChange={handleNumberChange} type="number" min="0" max="100" />
          </div>
          <div>
            <Label>ماه های اسارت</Label>
            <Input name="azadeEsaratMonths" value={form.azadeEsaratMonths ?? ""} onChange={handleNumberChange} type="number" min="0" />
          </div>
          <div>
            <Label>ماه های آزادگی</Label>
            <Input name="azadeMonths" value={form.azadeMonths ?? ""} onChange={handleNumberChange} type="number" min="0" />
          </div>
          <div>
            <Label>تعداد اعضای خانواده شاهد</Label>
            <Input name="shahedFamilyNumber" value={form.shahedFamilyNumber ?? ""} onChange={handleNumberChange} type="number" min="0" />
          </div>
          <div>
            <Label>ارتباط با ایثارگر</Label>
            <Select value={form.shahedRelation ?? ""} onValueChange={v => handleSelect("shahedRelation", v)}>
              <SelectTrigger>
                <SelectValue placeholder="ندارد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="azade_wife">همسر آزاده</SelectItem>
                <SelectItem value="azade_child">فرزند آزاده</SelectItem>
                <SelectItem value="jan_wife">همسر جانباز</SelectItem>
                <SelectItem value="jan_child">فرزند جانباز</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="w-full mt-4">ایجاد کاربر</Button>
      </form>
    </div>
  );
}
