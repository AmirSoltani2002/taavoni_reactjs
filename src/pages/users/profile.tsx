import { useEffect, useState, useRef } from "react";
import { docs_columns, type User, type UserDoc } from "./columns";
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
import FInput from "@/components/ui/functional-input";
import { cn } from "@/lib/utils";
import UserProjects from "./userProjects";

// Document type for user-doc/profile
const LABEL_CLASS = "font-bold text-blue-900"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null);
  const [viewer, setViewer] = useState<User | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});
  const [fullName, setFullName] = useState<string>("")
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [docs, setDocs] = useState<UserDoc[]>([]);
  const [fileInputTitle, setFileInputTitle] = useState('')
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
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
  useEffect(() => {
    getTable('users/profile', setViewer)
  }, [])

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
  const handleSelect = (name: keyof User, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value ? Number(value) : null }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTableRow("users", userId ? userId : 'profile', { ...form, accepted: undefined, birthDay: birthDate ? birthDate.toISOString().split("T")[0] : undefined }, () => {
      toast.success("اطلاعات با موفقیت ویرایش شد");
      setEdit(false);
      setUser({ ...user, ...form } as User);
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("رمز عبور جدید و تأیید آن مطابقت ندارند");
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error("رمز عبور جدید باید حداقل 6 کاراکتر باشد");
      return;
    }

    setIsLoading(true);
    try {
      await updateTableRow("users", userId ? userId : 'profile', {
        password: passwordForm.newPassword
      }, () => {
        toast.success("رمز عبور با موفقیت تغییر کرد");
        setPasswordForm({
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordChange(false);
      });
    } catch (error) {
      toast.error("خطا در تغییر رمز عبور");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!user) return <div>کاربر یافت نشد</div>;

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card className="bg-cyan-50">
        <CardHeader className="flex flex-row justify-between">
          <div className={cn("flex flex-col gap-4", LABEL_CLASS)}>
            <CardTitle>پروفایل کاربری</CardTitle>
            <CardDescription className={LABEL_CLASS}>
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
              {(!userId || viewer?.type === 'system') &&
                <Button onClick={() => setEdit(true)} className="w-full mt-4">ویرایش اطلاعات</Button>
              }
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className={LABEL_CLASS}>نام</Label><Input className="bg-secondary" name="name" value={form.name ?? ""} onChange={handleChange} /></div>
                <div><Label className={LABEL_CLASS}>نام خانوادگی</Label><Input className="bg-secondary" name="lastName" value={form.lastName ?? ""} onChange={handleChange} /></div>
                <div><Label className={LABEL_CLASS}>ایمیل</Label><Input className="bg-secondary" name="email" value={form.email ?? ""} onChange={handleChange} type="email" /></div>
                <div><Label className={LABEL_CLASS}>موبایل</Label><Input className="bg-secondary" name="mobile" value={form.mobile ?? ""} onChange={handleChange} /></div>
                <div><Label className={LABEL_CLASS}>تلفن منزل</Label><Input className="bg-secondary" name="homePhone" value={form.homePhone ?? ""} onChange={handleChange} /></div>
                <div><Label className={LABEL_CLASS}>تلفن محل کار</Label><Input className="bg-secondary" name="workPhone" value={form.workPhone ?? ""} onChange={handleChange} /></div>
                <div><Label className={LABEL_CLASS}>کد ملی</Label><Input className="bg-secondary" name="nationalNumber" value={form.nationalNumber ?? ""} onChange={handleChange} /></div>
                <div className="col-span-2"><Label className={LABEL_CLASS}>آدرس</Label><Input className="bg-secondary" name="address" value={form.address ?? ""} onChange={handleChange} /></div>
                <div><Label className={LABEL_CLASS}>جنسیت</Label>
                  <Select value={form.sex ?? ""} onValueChange={v => handleSelect("sex", v)}>
                    <SelectTrigger className={LABEL_CLASS}><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">مرد</SelectItem>
                      <SelectItem value="female">زن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className={LABEL_CLASS}>تاریخ تولد</Label>
                  <Calendar22 date={birthDate} setDate={d => { setBirthDate(d); setForm(f => ({ ...f, birthDay: d ? d.toISOString().split("T")[0] : undefined })); }} /></div>
                <div><Label className={LABEL_CLASS}>درصد ایثارگری</Label>
                  <Input className="bg-secondary" name="isargaryPercent" value={form.isargaryPercent ?? ""} onChange={handleChange} type="number" min="0" />
                </div>
                <div><Label className={LABEL_CLASS}>ماه های اسارت</Label>
                  <Input className="bg-secondary" name="azadeEsaratMonths" value={form.azadeEsaratMonths ?? ""} onChange={handleNumberChange} type="number" min="0" />
                </div>
                <div><Label className={LABEL_CLASS}>ماه های آزادگی</Label>
                  <Input className="bg-secondary" name="azadeMonths" value={form.azadeMonths ?? ""} onChange={handleNumberChange} type="number" min="0" />
                </div>
                <div><Label className={LABEL_CLASS}>تعداد اعضای خانواده شاهد</Label>
                  <Input className="bg-secondary" name="shahedFamilyNumber" value={form.shahedFamilyNumber ?? ""} onChange={handleNumberChange} type="number" min="0" />
                </div>
                <div><Label className={LABEL_CLASS}>ارتباط با ایثارگر</Label>
                  <Select value={form.shahedRelation ?? ""} onValueChange={v => handleSelect("shahedRelation", v)}>
                    <SelectTrigger className={LABEL_CLASS}><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="azade_wife">همسر آزاده</SelectItem>
                      <SelectItem value="azade_child">فرزند آزاده</SelectItem>
                      <SelectItem value="jan_wife">همسر جانباز</SelectItem>
                      <SelectItem value="jan_child">فرزند جانباز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {viewer?.type === 'system' && (
                  <FInput<User>
                    className={cn("w-full", LABEL_CLASS)}
                    values={form}
                    item={{
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
                        {
                          label: 'ادمین',
                          value: 'admin'
                        }
                        
                      ]
                    }}
                    handleChange={handleChange}
                    handleSelect={handleSelect}
                  />
                )}
              </div>
              
              {/* Password Change Section for System Users or Self */}
              {(viewer?.type === 'system' || !userId) && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">تغییر رمز عبور</h3>
                    <Button 
                      type="button" 
                      variant="default" 
                      size="sm"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                    >
                      {showPasswordChange ? 'بستن' : 'تغییر رمز عبور'}
                    </Button>
                  </div>
                  
                  {showPasswordChange && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className={LABEL_CLASS}>رمز عبور جدید</Label>
                          <Input 
                            name="newPassword" 
                            type="password" 
                            value={passwordForm.newPassword} 
                            onChange={handlePasswordChange}
                            minLength={6}
                            required
                          />
                        </div>
                        <div>
                          <Label className={LABEL_CLASS}>تأیید رمز عبور جدید</Label>
                          <Input 
                            name="confirmPassword" 
                            type="password" 
                            value={passwordForm.confirmPassword} 
                            onChange={handlePasswordChange}
                            minLength={6}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={handlePasswordSubmit} className="w-1/2" disabled={isLoading}>
                          {isLoading ? "در حال تغییر..." : "تغییر رمز عبور"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="w-1/2"
                          onClick={() => {
                            setPasswordForm({
                              newPassword: '',
                              confirmPassword: ''
                            });
                            setShowPasswordChange(false);
                          }}
                        >
                          انصراف
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 w-full">
                <Button type="submit" className="w-3/4">ذخیره</Button>
                <Button type="button" className="w-1/4" variant="secondary" onClick={() => { setEdit(false); setForm(user); setBirthDate(user.birthDay ? new Date(user.birthDay) : undefined); }}>انصراف</Button>
              </div>
            </form>
          )}
          <Card className="mt-8">
            <CardContent>
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
            </CardContent>
          </Card>
          <UserProjects />
        </CardContent>
      </Card>
      {isLoading && <PageLoader />}
    </div>
  );
}


