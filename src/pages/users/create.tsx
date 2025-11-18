import { useEffect, useMemo, useState, type HTMLInputTypeAttribute } from "react";
import { Button } from "@/components/ui/button";
import { postTable } from "@/general";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import type { User } from "./columns";
import FInput from "@/components/ui/functional-input";

// User type based on columns.tsx

const initialState: User = {
  name: undefined,
  lastName: undefined,
  email: undefined,
  password: undefined,
  mobile: undefined,
  homePhone: undefined,
  workPhone: undefined,
  nationalNumber: undefined,
  address: undefined,
  sex: undefined,
  birthDay: undefined,
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
  const FIELDS = useMemo(() => {
    let fields: {
      title?: string;
      name: keyof User;
      isRequired?: boolean;
      type?: HTMLInputTypeAttribute | 'select';
      options?: { label: string; value: string }[];
      className?: string;
      hideWhenEdit?: boolean;
      hideWhenNotAdmin?: boolean;
    }[] = [
      {
        title: 'نام',
        name: 'name',
        isRequired: true,
        hideWhenNotAdmin: false,
      },
      {
        title: 'نام خانوادگی',
        name: 'lastName',
        isRequired: true,
        hideWhenNotAdmin: false,
      },
      {
        title: 'جنسیت',
        name: 'sex',
        isRequired: true,
        hideWhenNotAdmin: false,
        type: 'select',
        options: [
          { label: 'مرد', value: 'male' },
          { label: 'خانم', value: 'female' },
        ],
      },
      {
        title: 'کد ملی',
        name: 'nationalNumber',
        isRequired: true,
        hideWhenNotAdmin: false,
      },
      {
        title: 'ایمیل',
        name: 'email',
        isRequired: false,
        type: 'email',
        hideWhenNotAdmin: true,
      },
      {
        title: 'رمز عبور',
        name: 'password',
        isRequired: true,
        hideWhenEdit: true,
        hideWhenNotAdmin: false,
        type: 'password',
      },
      {
        title: 'موبایل',
        name: 'mobile',
        isRequired: true,
        hideWhenNotAdmin: true,
      },
      {
        title: 'آدرس',
        name: 'address',
        isRequired: false,
        className: "col-span-2",
        hideWhenNotAdmin: true,
      },
      {
        title: 'تاریخ تولد',
        name: 'birthDay',
        type: 'date',
        isRequired: false,
        hideWhenNotAdmin: true,
      }
    ];
    if(urlType !== 'admin') {
      fields.push({
        title: 'نوع عضویت',
        name: 'type',
        isRequired: true,
        hideWhenNotAdmin: false,
        type: 'select',
        options: [
          {
            label: 'کارمند دانشگاه تهران',
            value: 'tehranUni'
          },
          {
            label: 'کارمند سایر دانشگاه‌ها',
            value: 'otherUni'
          },
          {
            label: 'کارمند غیردانشگاهی',
            value: 'employee'
          },
          {
            label: 'عضو آزاد',
            value: 'free'
          },
          
        ]
      });
    }
    return fields;
  }, [urlType]);
  useEffect(() => {
    if (urlType && !form.type) {
      setForm((prev) => ({ ...prev, type: urlType }));
    }
  }, [urlType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: User) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: keyof User, value: string | number) => {
    setForm((prev: User) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          {FIELDS.map(item => (
            <FInput<User> 
              values={form} 
              item={item} 
              handleChange={handleChange} 
              handleSelect={handleSelect}
              isEdit={isEdit}
              urlType={urlType} 
            />
          ))}
        </div>
        <Button type="submit" className="w-full mt-4">{`${isEdit ? 'تغییر' : 'افزودن'} ${NAME_TO_DISPLAY}`}</Button>
      </form>
    </div>
  );
}
