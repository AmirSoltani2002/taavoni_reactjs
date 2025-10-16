import { useEffect, useState, useRef } from "react";
import { docs_columns, type User, type UserDoc } from "./users/columns";
import { getTable, updateTableRow, uploadFile } from "@/general";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar22 } from "@/components/calendars/calendar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { useNavigate, useParams } from "react-router-dom";
import { PageLoader } from "@/components/ui/loader";

// Document type for user-doc/profile
const LABEL_CLASS = "font-bold text-blue-900"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});
  const [fullName, setFullName] = useState<string>("")
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [docs, setDocs] = useState<UserDoc[]>([]);
  const [fileInputTitle, setFileInputTitle] = useState('')
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { userId } = useParams();
  const navigate = useNavigate()

  useEffect(() => {
    getTable(userId ? `users/${userId}` : "users/profile", (data: User) => {
      setUser(data);
      setForm(data);
      setBirthDate(data.birthDay ? new Date(data.birthDay) : undefined);
      setLoading(false);
      if(userId){
        setFullName(`${data.sex === 'male' ? 'آقای' : 'خانم'} ${data.name} ${data.lastName}`)
      } else {
        setFullName('شما')
      }
    });
    getTable(userId ? `user-doc/user/${userId}` : "user-doc/profile", (data: UserDoc[]) => {
      setDocs(data);
    });
  }, []);

  const handleAddDocument = async () => {
    if(!user){return}
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("لطفاً یک فایل انتخاب کنید");
      return;
    }
    setUploading(true);
    await uploadFile("user-doc", file, [
      {
        titleName: 'detail',
        titleValue: fileInputTitle,
      },
      
    ], user?.id);
    await getTable("user-doc/profile", (data: UserDoc[]) => {
      setDocs(data);
    });
    setUploading(false);
    setFileInputTitle('');
    if(fileInputRef.current) {
      fileInputRef.current.files = null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelect = (name: keyof User, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value ? Number(value) : null }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.birthDay) {
      toast.error("تاریخ تولد الزامی است");
      return;
    }
    updateTableRow("users", 'profile', { ...form, type: undefined, accepted: undefined, birthDay: birthDate ? birthDate.toISOString().split("T")[0] : "" }, () => {
      toast.success("اطلاعات با موفقیت ویرایش شد");
      setEdit(false);
      setUser({ ...user, ...form } as User);
    });
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!user) return <div>کاربر یافت نشد</div>;

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div className="flex flex-col gap-4">
            <CardTitle>پروفایل کاربری</CardTitle>
            <CardDescription>
              {`اطلاعات و مدارک ${fullName}`}
            </CardDescription>
          </div>
          
          {userId && <Button variant={'outline'} onClick={() => navigate('/users/list')}>بازگشت</Button>}
        </CardHeader>
        <CardContent>
          {!edit ? (
            <div className="space-y-4">
              {(userId && user) && (
                user.accepted ? (
                  <Button variant="secondary" className="bg-green-300">
                    کاربر تایید شده
                  </Button>
                ) : (
                  <Button variant="default" onClick={async() => {
                    setIsLoading(true);
                    await updateTableRow(`users`, userId, {accepted: true}, () => {
                        getTable(`users/${userId}`, (data: User) => {
                          setUser(data);
                          setForm(data);
                          setBirthDate(data.birthDay ? new Date(data.birthDay) : undefined);
                        });
                    })
                    setIsLoading(false)
                  }}>
                    تایید کاربر
                  </Button>
                )
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>نام:</Label><div>{user.name}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>نام خانوادگی:</Label><div>{user.lastName}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>ایمیل:</Label><div>{user.email}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>موبایل:</Label><div>{user.mobile}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>تلفن منزل:</Label><div>{user.homePhone}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>تلفن محل کار:</Label><div>{user.workPhone}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>کد ملی:</Label><div>{user.nationalNumber}</div></div>
                <div className="col-span-2"><Label className={LABEL_CLASS}>آدرس:</Label><div>{user.address}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>جنسیت:</Label><div>{user.sex === "male" ? "مرد" : "زن"}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>تاریخ تولد:</Label><div>{user.birthDay ? (new Date(user.birthDay || '')).toLocaleDateString('fa-IR') : 'تاریخ تولد ثبت نشده'}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>درصد ایثارگری:</Label><div>{user.isargaryPercent ?? "-"}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>ماه های اسارت:</Label><div>{user.azadeEsaratMonths ?? "-"}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>ماه های آزادگی:</Label><div>{user.azadeMonths ?? "-"}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>تعداد اعضای خانواده شاهد:</Label><div>{user.shahedFamilyNumber ?? "-"}</div></div>
                <div className="flex flex-row gap-2 items-center"><Label className={LABEL_CLASS}>ارتباط با ایثارگر:</Label><div>{user.shahedRelation ?? "-"}</div></div>
              </div>
              {!userId &&
                <Button onClick={() => setEdit(true)} className="w-full mt-4">ویرایش اطلاعات</Button>
              }
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className={LABEL_CLASS}>نام</Label><Input name="name" value={form.name ?? ""} onChange={handleChange} required /></div>
                <div><Label className={LABEL_CLASS}>نام خانوادگی</Label><Input name="lastName" value={form.lastName ?? ""} onChange={handleChange} required /></div>
                <div><Label className={LABEL_CLASS}>ایمیل</Label><Input name="email" value={form.email ?? ""} onChange={handleChange} type="email" required /></div>
                <div><Label className={LABEL_CLASS}>موبایل</Label><Input name="mobile" value={form.mobile ?? ""} onChange={handleChange} required /></div>
                <div><Label className={LABEL_CLASS}>تلفن منزل</Label><Input name="homePhone" value={form.homePhone ?? ""} onChange={handleChange} required /></div>
                <div><Label className={LABEL_CLASS}>تلفن محل کار</Label><Input name="workPhone" value={form.workPhone ?? ""} onChange={handleChange} required /></div>
                <div><Label className={LABEL_CLASS}>کد ملی</Label><Input name="nationalNumber" value={form.nationalNumber ?? ""} onChange={handleChange} required /></div>
                <div className="col-span-2"><Label className={LABEL_CLASS}>آدرس</Label><Input name="address" value={form.address ?? ""} onChange={handleChange} required /></div>
                <div><Label className={LABEL_CLASS}>جنسیت</Label>
                  <Select value={form.sex ?? ""} onValueChange={v => handleSelect("sex", v)} required>
                    <SelectTrigger><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">مرد</SelectItem>
                      <SelectItem value="female">زن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Calendar22 title="تاریخ تولد" date={birthDate} setDate={d => { setBirthDate(d); setForm(f => ({ ...f, birthDay: d ? d.toISOString().split("T")[0] : "" })); }} /></div>
                <div><Label className={LABEL_CLASS}>درصد ایثارگری</Label>
                  <Input name="isargaryPercent" value={form.isargaryPercent ?? ""} onChange={handleChange} type="number" min="0" />
                </div>
                <div><Label className={LABEL_CLASS}>ماه های اسارت</Label>
                  <Input name="azadeEsaratMonths" value={form.azadeEsaratMonths ?? ""} onChange={handleNumberChange} type="number" min="0" />
                </div>
                <div><Label className={LABEL_CLASS}>ماه های آزادگی</Label>
                  <Input name="azadeMonths" value={form.azadeMonths ?? ""} onChange={handleNumberChange} type="number" min="0" />
                </div>
                <div><Label className={LABEL_CLASS}>تعداد اعضای خانواده شاهد</Label>
                  <Input name="shahedFamilyNumber" value={form.shahedFamilyNumber ?? ""} onChange={handleNumberChange} type="number" min="0" />
                </div>
                <div><Label className={LABEL_CLASS}>ارتباط با ایثارگر</Label>
                  <Select value={form.shahedRelation ?? ""} onValueChange={v => handleSelect("shahedRelation", v)} required>
                    <SelectTrigger><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="azade_wife">همسر آزاده</SelectItem>
                      <SelectItem value="azade_child">فرزند آزاده</SelectItem>
                      <SelectItem value="jan_wife">همسر جانباز</SelectItem>
                      <SelectItem value="jan_child">فرزند جانباز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="w-full">ذخیره</Button>
                <Button type="button" variant="secondary" onClick={() => { setEdit(false); setForm(user); setBirthDate(user.birthDay ? new Date(user.birthDay) : undefined); }}>انصراف</Button>
              </div>
            </form>
          )}
          <div className="mt-8">
            <h2 className="font-bold mb-2">{`مدارک ${fullName}`}</h2>
            {!userId && <div className="mt-4">
              <h3 className="font-medium mb-2">افزودن مدرک</h3>
              <div className="flex items-center gap-2">
                <Input type='text' value={fileInputTitle} placeholder="موضوع فایل" 
                  onChange={(e) => setFileInputTitle(e.target.value)} 
                />
                <Input ref={fileInputRef} type="file" accept="image/*,application/pdf" />
                <Button onClick={handleAddDocument} disabled={uploading}>
                  {uploading ? "در حال آپلود..." : "افزودن مدرک"}
                </Button>
              </div>
            </div>}
            {docs.length === 0 ? (
              <div>مدرکی ثبت نشده است.</div>
            ) : (
              <DataTable columns={docs_columns} data={docs} tableName="user-doc" />
            )}
          </div>
        </CardContent>
      </Card>
      {isLoading && <PageLoader />}
    </div>
  );
}


