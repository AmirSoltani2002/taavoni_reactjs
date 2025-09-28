import { useEffect, useState, type HTMLInputTypeAttribute } from "react";
import { Button } from "@/components/ui/button";
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
import { useSearchParams } from "react-router-dom";
import type { User } from "./columns";

// User type based on columns.tsx

const initialState: User = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  mobile: "",
  homePhone: "",
  workPhone: "",
  nationalNumber: "",
  address: "",
  sex: "",
  birthDay: "",
  type: null,
  isargaryPercent: null,
  azadeEsaratMonths: 0,
  azadeMonths: 0,
  shahedFamilyNumber: 0,
  shahedRelation: null,
};


type UserCreateProps = {
  initialValues?: User;
  onSubmit?: (values: User) => void;
  isEdit?: boolean;
};

export default function UserCreate({ initialValues, onSubmit, isEdit }: UserCreateProps) {
  const [form, setForm] = useState<User>(initialValues || initialState);
  const [searchParams] = useSearchParams();
  const urlType = searchParams.get("type") as User["type"] | null;
  const FIELDS: {
    title?: string;
    name: keyof User;
    isRequired?: boolean;
    type?: HTMLInputTypeAttribute | 'select';
    options?: { label: string; value: string }[];
    className?: string;
    hideWhenEdit?: boolean;
    showWhenNotAdmin?: boolean;
    
  }[] = [
    {
      title: 'نام',
      name: 'name',
      isRequired: true,
    },
    {
      title: 'نام خانوادگی',
      name: 'lastName',
      isRequired: true,
    },
    {
      title: 'کد ملی',
      name: 'nationalNumber',
      isRequired: true,
      showWhenNotAdmin: true
    },
    {
      title: 'ایمیل',
      name: 'email',
      isRequired: true,
      type: 'email'
    },
    {
      title: 'رمز عبور',
      name: 'password',
      isRequired: true,
      hideWhenEdit: true,
      showWhenNotAdmin: true,
      type: 'password'
    },
    {
      title: 'موبایل',
      name: 'mobile',
      isRequired: true,
    },
    {
      title: 'آدرس',
      name: 'address',
      isRequired: true,
      className: "col-span-2"
    },
    {
      title: 'تاریخ تولد',
      name: 'birthDay',
      type: 'date',
      isRequired: true,
    },
    
  ]
  useEffect(() => {
    if (urlType && !form.type) {
      setForm((prev) => ({ ...prev, type: urlType }));
    }
  }, [urlType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: User) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: keyof User, value: string) => {
    setForm((prev: User) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.birthDay) {
      toast.error('تاریخ تولد الزامی است');
      return;
    }
    if (onSubmit) {
      onSubmit(form);
    } else {
      postTable('users', form, (_data) => {
        toast.success('کاربر با موفقیت ایجاد شد');
        setForm(initialState);
      });
    }
  };
  const NAME_TO_DISPLAY = (urlType === 'admin') ? 'ادمین' : 'کاربر'
  return (
    <div className="container mx-auto max-w-xl py-10">
  <h1 className="text-2xl font-bold mb-6">{
    isEdit 
    ? `ویرایش ${NAME_TO_DISPLAY}` 
    : `ایجاد ${NAME_TO_DISPLAY} جدید`}</h1>
  <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map(item => {
            if(
              (item.hideWhenEdit && isEdit) ||
              (!item.showWhenNotAdmin && !(urlType == 'admin' || urlType == 'system'))
            ){
              return undefined;
            } else if(item.type === 'select' && item.options) {
              return <div>
                <label>{item.title + (item.isRequired ? '*' : '')}</label>
                <Select value={form[item.name]?.toString()} onValueChange={v => handleSelect(item.name, v)} required={item.isRequired}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {item.options.map(sopt => (
                      <SelectItem value={sopt.value}>{sopt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            } else if(item.type === 'date') {
              return <div>
                <Calendar22 
                  title={item.title + (item.isRequired ? '*' : '')}
                  date={form[item.name]?.toString()}
                  setDate={(d) => {
                    handleSelect(item.name, d ? d.toISOString() : '')
                  }}
                />
              </div>
            } else {
              return <div>
                <label>{item.title + (item.isRequired ? '*' : '')}</label>
                <Input 
                  name={item.name} 
                  value={form[item.name]?.toString()}
                  type={item.type || 'text'} 
                  onChange={handleChange} 
                  required={item.isRequired} 
                />
              </div>
            }
          })}
        </div>
        <Button type="submit" className="w-full mt-4">{`${isEdit ? 'تغییر' : 'افزودن'} کاربر`}</Button>
      </form>
    </div>
  );
}
