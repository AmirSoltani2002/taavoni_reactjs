import { useEffect, useState, useRef } from "react";
import {
  FRONT_PRESENCE_TYPE_OPTIONS,
  getDocsColumns,
  getFrontPresenceTypeLabel,
  getIsargarRelationLabel,
  getIsargaryTypeLabel,
  getMartyrRelationLabel,
  ISARGAR_RELATION_OPTIONS,
  ISARGARY_TYPE_OPTIONS,
  MARTYR_RELATION_OPTIONS,
  REGULAR_USER_TYPE_OPTIONS,
  type IsargaryType,
  type User,
  type UserDoc,
} from "./columns";
import { getTable, updateTableRow, uploadFile, deleteTableRow, getImageBlobUrl, downloadDocument } from "@/general";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Calendar22 } from "@/components/calendars/calendar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/ui/loader";
import FInput from "@/components/ui/functional-input";
import { cn } from "@/lib/utils";
import UserProjects from "./userProjects";
import { 
  User as UserIcon, Mail, Phone, MapPin, Calendar, FileText, 
  Edit2, Save, X, ArrowRight, CheckCircle2, Upload, Lock, 
  Award, Home, Briefcase, Hash, CreditCard, Camera,
  Download, Trash2, History
} from "lucide-react";
import { getTransactionHistoryColumns, type TransactionHistory } from "./transactionHistory";
import { FaFaceSmile } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import type { Transaction, FinalTransaction } from "../transactions/columns";
import {
  columns as transactionColumns,
  getFinalTransactionColumns,
  getFinalTransactionOptions,
  getTransactionOptions,
} from "../transactions/columns";
import TransactionEditDialog from "../transactions/transaction-edit-dialog";
import type { PreSelling } from "../preselling/columns";
import { columns as presellingColumns } from "../preselling/columns";
import type { SubProject } from "../projects/columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Document type for user-doc/profile
const LABEL_CLASS = "font-semibold text-gray-700 mb-1.5 block"
const JANBAZI_PERCENTAGES = Array.from({ length: 16 }, (_, index) => (index + 1) * 5)

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingFinalTransactions, setLoadingFinalTransactions] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [profileImageDoc, setProfileImageDoc] = useState<UserDoc | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [loadingProfileImage, setLoadingProfileImage] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [downloadingDocs, setDownloadingDocs] = useState<Set<number>>(new Set());
  const [downloadingProfileImage, setDownloadingProfileImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [subProjectHistory, setSubProjectHistory] = useState<TransactionHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [projectScores, setProjectScores] = useState<{ id: string; score: string; projectName: string; area?: number }[]>([]);
  const [presellings, setPresellings] = useState<PreSelling[]>([]);
  const [loadingPresellings, setLoadingPresellings] = useState(false);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [finalTransactions, setFinalTransactions] = useState<FinalTransaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<{
    type: 'preselling' | 'final';
    transaction: Transaction | FinalTransaction;
  } | null>(null);
  const canManageDocuments = !userId || Boolean(
    user &&
    ['admin', 'system'].includes(viewer?.type || '') &&
    !['admin', 'system'].includes(user.type || '')
  );
  const canManageTransactions = ['admin', 'system'].includes(viewer?.type || '');

  const refreshTransactions = () => {
    const endpoint = userId ? `transaction/users/${userId}` : 'transaction/profile';
    getTable(endpoint, (data: Transaction[] | {error?: unknown}) => {
      setTransactions(Array.isArray(data) ? data : []);
    }, false);
  };

  const refreshFinalTransactions = () => {
    const endpoint = userId ? `final-transaction/users/${userId}` : 'final-transaction/profile';
    getTable(endpoint, (data: FinalTransaction[] | {error?: unknown}) => {
      setFinalTransactions(Array.isArray(data) ? data : []);
    }, false);
  };
  
  // Get initial tab from URL hash, default to 'personal'
  const getInitialTab = () => {
    const hash = location.hash.replace('#', '');
    const validTabs = ['personal', 'contact', 'martyrdom', 'documents', 'projects', 'payments', 'history'];
    return validTabs.includes(hash) ? hash : 'personal';
  };
  
  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

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
      // Find profile image doc
      const profileDoc = data.find(doc => doc.detail && doc.detail === 'profile-image');
      setProfileImageDoc(profileDoc || null);
      if (profileDoc?.id) {
        loadProfileImage(profileDoc.id);
      } else {
        setProfileImageUrl(undefined);
      }
    });

    // Load project scores
    const endpoint = userId ? `transaction/score?userId=${userId}` : "transaction/profile/score";
    getTable(endpoint, (data: any) => {
      try {
        if (!data || typeof data !== "object") return;
        const entries = Object.entries(data) as [string, any][];
        const scores = entries
          .filter(([key]) => key !== "userInfo")
          .map(([key, value]) => {
            const v = value as any;
            const projectName = v?.presellingInfo?.project?.name || "پروژه";
            const area = v?.presellingInfo?.area as number | undefined;
            return {
              id: key,
              score: typeof v?.score === "string" ? v.score : String(v?.score ?? ""),
              projectName,
              area,
            };
          })
          .filter((x) => x.score);
        setProjectScores(scores);
      } catch {
        setProjectScores([]);
      }
    }, false);
  }, [userId]);
  useEffect(() => {
    getTable('users/profile', setViewer)
  }, [])

  useEffect(() => {
    if (user) {
      setLoadingTransactions(true);
      const endpoint = userId ? `transaction/users/${userId}` : 'transaction/profile';
      getTable(endpoint, (data: Transaction[] | {error?: any}) => {
        if (data && !('error' in data)) {
          setTransactions(data as Transaction[] || []);
        } else {
          setTransactions([]);
        }
        setLoadingTransactions(false);
      });
    }
  }, [user, userId]);

  useEffect(() => {
    if (user && activeTab === 'history') {
      setLoadingHistory(true);
      const endpoint = userId ? `transaction-history/user/${userId}` : 'transaction-history/profile';
      getTable(endpoint, (data: TransactionHistory[] | {error?: any}) => {
        if (data && !('error' in data)) {
          setSubProjectHistory(data as TransactionHistory[] || []);
        } else {
          setSubProjectHistory([]);
        }
        setLoadingHistory(false);
      }, false);
    }
  }, [user, userId, activeTab]);

  useEffect(() => {
    if (user) {
      setLoadingPresellings(true);
      const endpoint = userId ? `pre-selling/user/${userId}` : 'users/pre-selling';
      getTable(endpoint, (data: PreSelling[] | {error?: any}) => {
        if (data && !('error' in data)) {
          setPresellings(data as PreSelling[] || []);
        } else {
          setPresellings([]);
        }
        setLoadingPresellings(false);
      }, false);
    }
  }, [user, userId]);

  useEffect(() => {
    if (user) {
      const endpoint = userId ? `subprojects/user/${userId}` : 'subprojects/profile';
      getTable(endpoint, (data: SubProject[] | {error?: any}) => {
        if (data && !('error' in data)) {
          setSubProjects(Array.isArray(data) ? data : []);
        } else {
          setSubProjects([]);
        }
      }, false);
    }
  }, [user, userId]);

  useEffect(() => {
    if (user) {
      setLoadingFinalTransactions(true);
      const endpoint = userId ? `final-transaction/users/${userId}` : 'final-transaction/profile';
      getTable(endpoint, (data: FinalTransaction[] | {error?: any}) => {
        if (data && !('error' in data)) {
          setFinalTransactions(Array.isArray(data) ? data : []);
        } else {
          setFinalTransactions([]);
        }
        setLoadingFinalTransactions(false);
      }, false);
    }
  }, [user, userId]);

  // Cleanup blob URLs on unmount or when profileImageUrl changes
  useEffect(() => {
    return () => {
      if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [profileImageUrl]);

  // Update tab when hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const validTabs = ['personal', 'contact', 'martyrdom', 'documents', 'projects', 'payments', 'history'];
    if (validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL hash without causing a page reload
    window.history.replaceState(null, '', `#${value}`);
  };

  const loadProfileImage = async (docId: number) => {
    setLoadingProfileImage(true);
    try {
      const blobUrl = await getImageBlobUrl(docId, 'user-doc', false);
      if (blobUrl) {
        // Clean up old blob URL if exists
        if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(profileImageUrl);
        }
        setProfileImageUrl(blobUrl);
      } else {
        setProfileImageUrl(undefined);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      setProfileImageUrl(undefined);
    } finally {
      setLoadingProfileImage(false);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!user) return;
    const file = profileImageInputRef.current?.files?.[0];
    if (!file) {
      toast.error("لطفاً یک فایل تصویری انتخاب کنید");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("لطفاً فقط فایل تصویری انتخاب کنید");
      return;
    }

    setUploadingProfileImage(true);
    try {
      // Delete existing profile image if any
      if (profileImageDoc?.id) {
        await deleteTableRow('user-doc', profileImageDoc.id, undefined, false);
      }
      
      // Upload new profile image
      await uploadFile("user-doc", file, [
        {
          titleName: 'detail',
          titleValue: 'profile-image',
        },
      ], user?.id);
      
      // Reload docs to get the new profile image
      await getTable(userId ? `user-doc/user/${userId}` : "user-doc/profile", (data: UserDoc[]) => {
        setDocs(data);
        const profileDoc = data.find(doc => doc.detail && doc.detail === 'profile-image');
        setProfileImageDoc(profileDoc || null);
        if (profileDoc?.id) {
          loadProfileImage(profileDoc.id);
        }
      });
      toast.success("تصویر پروفایل با موفقیت آپلود شد");
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error("خطا در آپلود تصویر پروفایل");
    } finally {
      setUploadingProfileImage(false);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    }
  };

  const handleProfileImageDelete = async () => {
    if (!profileImageDoc?.id) return;
    
    try {
      await deleteTableRow('user-doc', profileImageDoc.id, () => {
        // Clean up blob URL before clearing
        if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(profileImageUrl);
        }
        setProfileImageDoc(null);
        setProfileImageUrl(undefined);
        // Reload docs
        getTable(userId ? `user-doc/user/${userId}` : "user-doc/profile", (data: UserDoc[]) => {
          setDocs(data);
        });
        toast.success("تصویر پروفایل با موفقیت حذف شد");
      }, true);
    } catch (error) {
      console.error('Error deleting profile image:', error);
      toast.error("خطا در حذف تصویر پروفایل");
    }
  };

  const handleProfileImageDownload = async () => {
    if (!profileImageDoc?.id) return;
    setDownloadingProfileImage(true);
    try {
      await downloadDocument(profileImageDoc.id, 'user-doc', 'profile-image', true);
    } finally {
      setDownloadingProfileImage(false);
    }
  };

  const handleAddDocument = async () => {
    if(!user){return}
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("لطفاً یک فایل انتخاب کنید");
      return;
    }
    setUploading(true);
    try {
      await uploadFile("user-doc", file, [
        {
          titleName: 'detail',
          titleValue: fileInputTitle,
        },
        
      ], user?.id);
      await getTable(userId ? `user-doc/user/${userId}` : "user-doc/profile", (data: UserDoc[]) => {
        setDocs(data);
        // Update profile image doc if it exists
        const profileDoc = data.find(doc => doc.detail && doc.detail === 'profile-image');
        setProfileImageDoc(profileDoc || null);
        if (profileDoc?.id) {
          loadProfileImage(profileDoc.id);
        } else {
          setProfileImageUrl(undefined);
        }
      });
      setFileInputTitle('');
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
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
  const handleIsargaryTypeChange = (value: IsargaryType) => {
    setForm((prev) => ({
      ...prev,
      isargaryType: value,
      martyrRelation: null,
      isargarRelation: null,
      janbaziPercent: null,
      captivityMonths: null,
      frontPresenceType: null,
      frontPresenceMonths: null,
    }));
  };
  const getIsargaryValidationError = () => {
    const isargaryType = form.isargaryType ?? 'none';
    if (isargaryType === 'none') return null;
    if (isargaryType === 'martyrFamily') {
      return form.martyrRelation ? null : 'لطفا نسبت با شهید را انتخاب کنید';
    }
    if (!form.isargarRelation) {
      return 'لطفا نسبت با ایثارگر را انتخاب کنید';
    }
    if (isargaryType === 'janbaz') {
      return JANBAZI_PERCENTAGES.includes(form.janbaziPercent ?? 0)
        ? null
        : 'لطفا درصد جانبازی را انتخاب کنید';
    }
    if (isargaryType === 'azade') {
      return Number.isInteger(form.captivityMonths) && (form.captivityMonths ?? 0) > 0
        ? null
        : 'مدت اسارت باید یک عدد صحیح مثبت باشد';
    }
    if (!form.frontPresenceType) {
      return 'لطفا نوع حضور در جبهه را انتخاب کنید';
    }
    return Number.isInteger(form.frontPresenceMonths) && (form.frontPresenceMonths ?? 0) > 0
      ? null
      : 'مدت حضور در جبهه باید یک عدد صحیح مثبت باشد';
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = getIsargaryValidationError();
    if (validationError) {
      toast.error(validationError);
      return;
    }
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

  if (loading) return <PageLoader />;
  if (!user) return (
    <div className="container mx-auto py-10">
      <Card className="p-8 text-center">
        <p className="text-gray-500">کاربر یافت نشد</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-10" data-tour="profile-page">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">پروفایل کاربری</h1>
              <p className="text-gray-600 text-lg">{`اطلاعات و مدارک ${fullName}`}</p>
            </div>
            {userId && (
              <Button variant="outline" onClick={() => navigate('/users/list')} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                بازگشت
              </Button>
            )}
          </div>
          
          {/* Status Badge */}
          {(userId && user) && (
            <div className="mb-6 flex items-center gap-4">
              {user.accepted ? (
                <>
                  <Badge className="bg-green-500 text-white px-4 py-2 text-sm gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    کاربر تایید شده
                  </Badge>
                  <button
                    onClick={() => setShowDeactivateDialog(true)}
                    className="cursor-pointer text-red-600 hover:text-red-700 text-sm font-medium underline-offset-4 hover:underline transition-colors"
                  >
                    غیر فعال کردن حساب کاربری
                  </button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  onClick={async() => {
                    setIsLoading(true);
                    await updateTableRow(`users`, userId, {accepted: true}, () => {
                        getTable(`users/${userId}`, (data: User) => {
                          setUser(data);
                          setForm(data);
                          setBirthDate(data.birthDay ? new Date(data.birthDay) : undefined);
                        });
                    })
                    setIsLoading(false)
                  }}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  تایید کاربر
                </Button>
              )}
            </div>
          )}

          {/* Deactivate User Confirmation Dialog */}
          <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>غیر فعال کردن حساب کاربری</DialogTitle>
                <DialogDescription className="text-right">
                  آیا مطمئن هستید که می‌خواهید حساب کاربری {fullName} را غیر فعال کنید؟
                  این عمل باعث می‌شود کاربر دیگر نتواند به سیستم دسترسی داشته باشد.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeactivateDialog(false)}
                >
                  انصراف
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!userId) return;
                    setIsLoading(true);
                    await updateTableRow(`users`, userId, {accepted: false}, () => {
                      getTable(`users/${userId}`, (data: User) => {
                        setUser(data);
                        setForm(data);
                        setBirthDate(data.birthDay ? new Date(data.birthDay) : undefined);
                        toast.success("حساب کاربری با موفقیت غیر فعال شد");
                      });
                    });
                    setIsLoading(false);
                    setShowDeactivateDialog(false);
                  }}
                >
                  غیر فعال کردن
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Main Content with Tabs */}
        {!edit ? (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b border-gray-200 mb-6">
              <TabsList className="w-full h-auto bg-transparent p-0 gap-0 inline-flex flex-wrap">
                <TabsTrigger 
                  value="personal" 
                  className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">اطلاعات شخصی</span>
                  <span className="sm:hidden">شخصی</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">اطلاعات تماس</span>
                  <span className="sm:hidden">تماس</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="martyrdom" 
                  className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                >
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">اطلاعات ایثارگری</span>
                  <span className="sm:hidden">ایثارگری</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  مدارک
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  پروژه ها
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  پرداخت ها
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                >
                  <History className="h-4 w-4" />
                  تاریخچه واحدها
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="mt-0">
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      اطلاعات شخصی
                    </CardTitle>
                    {((viewer?.type === 'system' || viewer?.type === 'admin') || (!userId && !user.accepted)) && (
                      <Button onClick={() => setEdit(true)} variant="outline" size="sm" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        ویرایش
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Profile Image Section */}
                  <div className="mb-8 flex justify-center">
                    <div className="relative group">
                      <input
                        ref={profileImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="hidden"
                        disabled={uploadingProfileImage}
                      />
                      {loadingProfileImage ? (
                        <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
                          <div className="text-gray-500">در حال بارگذاری...</div>
                        </div>
                      ) : profileImageUrl ? (
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 group">
                          <img 
                            src={profileImageUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                          {/* Hover overlay with download icon - available to all */}
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                            {downloadingProfileImage ? (
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            ) : (
                              <Download 
                                className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                onClick={handleProfileImageDownload}
                              />
                            )}
                          </div>
                          {/* Delete button at bottom - only for admins or user themselves */}
                          {((viewer?.type === 'system' || viewer?.type === 'admin') || (!userId && !user.accepted)) && (
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-10 flex items-center justify-center cursor-pointer pointer-events-none group-hover:pointer-events-auto"
                              onClick={handleProfileImageDelete}
                            >
                              <Trash2 className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="relative w-40 h-40 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden group"
                          onClick={() => {
                            if (uploadingProfileImage) return;
                            profileImageInputRef.current?.click();
                          }}
                        >
                          <FaFaceSmile className="h-16 w-16 text-gray-400 opacity-100 group-hover:opacity-0 transition-opacity duration-200" />
                          {/* Camera icon on hover */}
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                            <Camera 
                              className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            />
                          </div>
                          {uploadingProfileImage && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
                              <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                <div className="text-white text-sm font-medium">در حال آپلود...</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><UserIcon className="h-4 w-4 inline ml-2" />نام</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.name || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><UserIcon className="h-4 w-4 inline ml-2" />نام خانوادگی</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.lastName || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><Hash className="h-4 w-4 inline ml-2" />کد ملی</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.nationalNumber || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><UserIcon className="h-4 w-4 inline ml-2" />جنسیت</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.sex === "male" ? "مرد" : user.sex === "female" ? "زن" : "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><Calendar className="h-4 w-4 inline ml-2" />تاریخ تولد</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">
                        {user.birthDay ? (new Date(user.birthDay || '')).toLocaleDateString('fa-IR') : 'تاریخ تولد ثبت نشده'}
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <Label className={LABEL_CLASS}><MapPin className="h-4 w-4 inline ml-2" />آدرس</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg min-h-[60px]">{user.address || "-"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="mt-0">
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-600" />
                      اطلاعات تماس
                    </CardTitle>
                    {((viewer?.type === 'system' || viewer?.type === 'admin') || (!userId && !user.accepted)) && (
                      <Button onClick={() => setEdit(true)} variant="outline" size="sm" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        ویرایش
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><Mail className="h-4 w-4 inline ml-2" />ایمیل</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.email || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><Phone className="h-4 w-4 inline ml-2" />موبایل</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.mobile || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><Home className="h-4 w-4 inline ml-2" />تلفن منزل</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.homePhone || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL_CLASS}><Briefcase className="h-4 w-4 inline ml-2" />تلفن محل کار</Label>
                      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.workPhone || "-"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Martyrdom Information Tab */}
            <TabsContent value="martyrdom" className="mt-0">
              {user.isargaryType && user.isargaryType !== 'none' ? (
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        اطلاعات ایثارگری
                      </CardTitle>
                      {(!userId || viewer?.type === 'system' || viewer?.type === 'admin') && (
                        <Button onClick={() => setEdit(true)} variant="outline" size="sm" className="gap-2">
                          <Edit2 className="h-4 w-4" />
                          ویرایش
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className={LABEL_CLASS}>نوع ایثارگری</Label>
                        <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{getIsargaryTypeLabel(user.isargaryType)}</div>
                      </div>
                      {user.isargaryType === 'martyrFamily' ? (
                        <div className="space-y-1">
                          <Label className={LABEL_CLASS}>نسبت با شهید</Label>
                          <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{getMartyrRelationLabel(user.martyrRelation)}</div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Label className={LABEL_CLASS}>نسبت با ایثارگر</Label>
                          <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{getIsargarRelationLabel(user.isargarRelation)}</div>
                        </div>
                      )}
                      {user.isargaryType === 'janbaz' && (
                        <div className="space-y-1">
                          <Label className={LABEL_CLASS}>درصد جانبازی</Label>
                          <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.janbaziPercent}%</div>
                        </div>
                      )}
                      {user.isargaryType === 'azade' && (
                        <div className="space-y-1">
                          <Label className={LABEL_CLASS}>مدت اسارت (به ماه)</Label>
                          <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.captivityMonths}</div>
                        </div>
                      )}
                      {user.isargaryType === 'isargar' && (
                        <>
                          <div className="space-y-1">
                            <Label className={LABEL_CLASS}>نوع حضور در جبهه</Label>
                            <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{getFrontPresenceTypeLabel(user.frontPresenceType)}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className={LABEL_CLASS}>مدت حضور در جبهه (به ماه)</Label>
                            <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg">{user.frontPresenceMonths}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg border-0 bg-white">
                  <CardContent className="pt-6 text-center py-12 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>اطلاعات ایثارگری ثبت نشده است.</p>
                    {(!userId || viewer?.type === 'system' || viewer?.type === 'admin') && (
                      <Button onClick={() => setEdit(true)} variant="outline" size="sm" className="mt-4 gap-2">
                        <Edit2 className="h-4 w-4" />
                        ویرایش
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-0">
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    مدارک {fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {canManageDocuments && (
                    <Card className="mb-6 bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Upload className="h-5 w-5 text-blue-600" />
                          افزودن مدرک جدید
                        </h3>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Input 
                            aria-label="موضوع مدرک"
                            type='text' 
                            value={fileInputTitle} 
                            placeholder="موضوع فایل (اختیاری)" 
                            onChange={(e) => setFileInputTitle(e.target.value)}
                            className="flex-1 h-11"
                            disabled={uploading}
                          />
                          <Input 
                            aria-label="فایل مدرک"
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="flex-1 h-11"
                            disabled={uploading}
                          />
                          <Button 
                            onClick={handleAddDocument} 
                            disabled={uploading}
                            className="gap-2 h-11"
                          >
                            {uploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                در حال آپلود...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                افزودن مدرک
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {docs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>مدرکی ثبت نشده است.</p>
                    </div>
                  ) : (
                    <DataTable
                      columns={getDocsColumns(downloadingDocs, setDownloadingDocs, canManageDocuments)}
                      data={docs.filter(doc => doc.detail !== 'profile-image')}
                      tableName={canManageDocuments ? "user-doc" : undefined}
                      _showDeleteButton={canManageDocuments}
                      onRefresh={() => {
                        getTable(userId ? `user-doc/user/${userId}` : "user-doc/profile", (data: UserDoc[]) => {
                          setDocs(data);
                        });
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-0">
              {/* Payment Summary Per Project Section */}
              {(() => {
                // Group presellings by project (Land payments)
                const landProjectPayments = new Map<number, {
                  projectName: string;
                  projectId: number;
                  totalToPay: number;
                  totalPaid: number;
                  remaining: number;
                }>();

                // Calculate total to pay per project from presellings (Land)
                presellings.forEach(preselling => {
                  const projectId = preselling.projectId || preselling.project?.id;
                  if (!projectId) return;
                  
                  const projectName = preselling.project?.name || 'پروژه بدون نام';
                  const existing = landProjectPayments.get(projectId);
                  
                  if (existing) {
                    existing.totalToPay += preselling.totalPrice || 0;
                  } else {
                    landProjectPayments.set(projectId, {
                      projectName,
                      projectId,
                      totalToPay: preselling.totalPrice || 0,
                      totalPaid: 0,
                      remaining: 0,
                    });
                  }
                });

                // Calculate total paid per project from transactions (Land)
                transactions.forEach(transaction => {
                  const preselling = transaction.preselling;
                  const projectId = preselling?.projectId || preselling?.project?.id;
                  if (!projectId) return;
                  
                  const existing = landProjectPayments.get(projectId);
                  if (existing) {
                    existing.totalPaid += transaction.amount || 0;
                  } else {
                    // If project not in presellings but has transactions, add it
                    const projectName = preselling?.project?.name || 'پروژه بدون نام';
                    landProjectPayments.set(projectId, {
                      projectName,
                      projectId,
                      totalToPay: 0,
                      totalPaid: transaction.amount || 0,
                      remaining: 0,
                    });
                  }
                });

                // Calculate remaining for each land project
                landProjectPayments?.forEach(payment => {
                  payment.remaining = payment.totalToPay - payment.totalPaid;
                });

                // Calculate property (subProject) totals
                const propertyTotalToPay = subProjects.reduce((sum, subProject) => {
                  const area = subProject.area || 0;
                  const pricePerMeter = subProject.pricePerMeter || 0;
                  return sum + (area * pricePerMeter);
                }, 0);

                const propertyTotalPaid = finalTransactions.reduce((sum, transaction) => {
                  return sum + (transaction.amount || 0);
                }, 0);

                // Calculate land totals
                const landTotalToPay = landProjectPayments.size > 0 
                  ? Array.from(landProjectPayments.values()).reduce((sum, payment) => sum + payment.totalToPay, 0)
                  : 0;
                const landTotalPaid = landProjectPayments.size > 0
                  ? Array.from(landProjectPayments.values()).reduce((sum, payment) => sum + payment.totalPaid, 0)
                  : 0;

                // Calculate combined totals
                const totalToPay = landTotalToPay + propertyTotalToPay;
                const totalPaid = landTotalPaid + propertyTotalPaid;
                const totalRemaining = totalToPay - totalPaid;

                const landPaymentArray = Array.from(landProjectPayments.values());
                
                // Show summary if there are land payments or property payments
                if (landPaymentArray.length === 0 && propertyTotalToPay === 0 && propertyTotalPaid === 0) return null;
                
                return (
                  <>
                    {/* Payment Summary */}
                    {(landPaymentArray.length > 0 || propertyTotalToPay > 0 || propertyTotalPaid > 0) && (
                      <Card className="shadow-lg border-0 bg-white mb-6">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            جزئیات پرداخت‌های زمین به تفکیک پروژه
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {landPaymentArray.map((payment) => (
                              <div key={payment.projectId} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="font-semibold text-gray-900 mb-4 text-sm border-b pb-2">
                                  {payment.projectName}
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">قابل پرداخت (زمین):</span>
                                    <span className="text-sm font-semibold text-blue-700">
                                      {payment.totalToPay.toLocaleString('fa-IR')} تومان
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">قابل پرداخت (ملک):</span>
                                    <span className="text-sm font-semibold text-blue-700">
                                      {propertyTotalToPay.toLocaleString('fa-IR')} تومان
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">پرداخت شده (زمین):</span>
                                    <span className="text-sm font-semibold text-green-700">
                                      {payment.totalPaid.toLocaleString('fa-IR')} تومان
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">پرداخت شده (ملک):</span>
                                    <span className="text-sm font-semibold text-green-700">
                                      {propertyTotalPaid.toLocaleString('fa-IR')} تومان
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <span className={`text-xs font-medium ${
                                      totalRemaining > 0 
                                        ? 'text-orange-600' 
                                        : totalRemaining < 0
                                        ? 'text-purple-600'
                                        : 'text-gray-600'
                                    }`}>
                                      {totalRemaining > 0 
                                        ? 'باقیمانده:' 
                                        : totalRemaining < 0
                                        ? 'اضافه پرداخت:'
                                        : 'تسویه شده'}
                                    </span>
                                    <span className={`text-base font-bold ${
                                      totalRemaining > 0 
                                        ? 'text-orange-700' 
                                        : totalRemaining < 0
                                        ? 'text-purple-700'
                                        : 'text-gray-700'
                                    }`}>
                                      {Math.abs(totalRemaining).toLocaleString('fa-IR')} تومان
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                );
              })()}
              
              {/* Scores Section */}
              {projectScores.length > 0 && (
                <Card className="shadow-lg border-0 bg-white mb-6">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      امتیازات پروژه‌ها
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projectScores.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm">{item.projectName}</h3>
                            <Award className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-yellow-700">
                              {item.score}
                            </span>
                            <span className="text-sm text-gray-600">امتیاز</span>
                          </div>
                          {item.area && (
                            <div className="mt-2 text-xs text-gray-600">
                              مساحت: {item.area.toLocaleString('fa-IR')} متر مربع
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                    </Card>
                  )}
              
              {/* Pre-selling Projects Section */}
              <Card className="shadow-lg border-0 bg-white mb-6">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    پروژه‌های پیش‌فروش {fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingPresellings ? (
                    <PageLoader />
                  ) : presellings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>پروژه پیش‌فروشی ثبت نشده است.</p>
                    </div>
                  ) : (
                    <DataTable 
                      columns={presellingColumns} 
                      data={presellings} 
                      tableName="pre-selling"
                      _showDeleteButton={false}
                    />
                  )}
                </CardContent>
              </Card>

              <UserProjects user={user} isSelf={userId ? false : true} isAdmin={['system', 'admin'].includes(viewer?.type || '')} />
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-0 space-y-6">
              {/* Summary Cards */}
              {(() => {
                const transactionsTotal = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                const finalTransactionsTotal = finalTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                const totalSum = transactionsTotal + finalTransactionsTotal;

                if (transactionsTotal === 0 && finalTransactionsTotal === 0 && !loadingTransactions && !loadingFinalTransactions) {
                  return null;
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          پرداخت‌های زمین
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                          {loadingTransactions ? (
                            <div className="animate-pulse">...</div>
                          ) : (
                            `${transactionsTotal.toLocaleString('fa-IR')} ریال`
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {transactions.length} تراکنش
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Home className="h-4 w-4 text-blue-600" />
                          پرداخت‌های ساخت
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-700">
                          {loadingFinalTransactions ? (
                            <div className="animate-pulse">...</div>
                          ) : (
                            `${finalTransactionsTotal.toLocaleString('fa-IR')} ریال`
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {finalTransactions.length} تراکنش
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                          مجموع کل
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-700">
                          {loadingTransactions || loadingFinalTransactions ? (
                            <div className="animate-pulse">...</div>
                          ) : (
                            `${totalSum.toLocaleString('fa-IR')} ریال`
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {transactions.length + finalTransactions.length} تراکنش
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

              {/* Preselling Transactions */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    پرداخت‌های زمین
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingTransactions ? (
                    <PageLoader />
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>پرداخت زمینی ثبت نشده است.</p>
                    </div>
                  ) : (
                    <DataTable
                      columns={transactionColumns}
                      data={transactions}
                      tableName="transaction"
                      onRefresh={refreshTransactions}
                      options={canManageTransactions
                        ? getTransactionOptions(
                            refreshTransactions,
                            viewer || undefined,
                            (transaction) => setEditingTransaction({ type: 'preselling', transaction }),
                          )
                        : undefined}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Final Transactions */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    پرداخت‌های ساخت
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingFinalTransactions ? (
                    <PageLoader />
                  ) : finalTransactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>پرداخت ملکی ثبت نشده است.</p>
                    </div>
                  ) : (
                    <DataTable
                      columns={getFinalTransactionColumns()}
                      data={finalTransactions}
                      tableName="final-transaction"
                      onRefresh={refreshFinalTransactions}
                      options={canManageTransactions
                        ? getFinalTransactionOptions(
                            refreshFinalTransactions,
                            viewer || undefined,
                            (transaction) => setEditingTransaction({ type: 'final', transaction }),
                          )
                        : undefined}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-0">
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    تاریخچه واحدهای {fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingHistory ? (
                    <PageLoader />
                  ) : subProjectHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>تاریخچه‌ای ثبت نشده است.</p>
                    </div>
                  ) : (
                    <DataTable 
                      columns={getTransactionHistoryColumns()} 
                      data={subProjectHistory} 
                      tableName="transaction-history"
                      _showDeleteButton={false}
                      onClickRow={(row) => {
                        if (row.subProjectId) {
                          navigate(`/unit/${row.subProjectId}`);
                        }
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                ویرایش اطلاعات
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><UserIcon className="h-4 w-4 inline ml-2" />نام</Label>
                    <Input name="name" value={form.name ?? ""} onChange={handleChange} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><UserIcon className="h-4 w-4 inline ml-2" />نام خانوادگی</Label>
                    <Input name="lastName" value={form.lastName ?? ""} onChange={handleChange} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><Mail className="h-4 w-4 inline ml-2" />ایمیل</Label>
                    <Input name="email" value={form.email ?? ""} onChange={handleChange} type="email" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><Phone className="h-4 w-4 inline ml-2" />موبایل</Label>
                    <Input name="mobile" value={form.mobile ?? ""} onChange={handleChange} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><Home className="h-4 w-4 inline ml-2" />تلفن منزل</Label>
                    <Input name="homePhone" value={form.homePhone ?? ""} onChange={handleChange} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><Briefcase className="h-4 w-4 inline ml-2" />تلفن محل کار</Label>
                    <Input name="workPhone" value={form.workPhone ?? ""} onChange={handleChange} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><Hash className="h-4 w-4 inline ml-2" />کد ملی</Label>
                    <Input name="nationalNumber" value={form.nationalNumber ?? ""} onChange={handleChange} className="h-11" />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className={LABEL_CLASS}><MapPin className="h-4 w-4 inline ml-2" />آدرس</Label>
                    <Input name="address" value={form.address ?? ""} onChange={handleChange} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><UserIcon className="h-4 w-4 inline ml-2" />جنسیت</Label>
                    <Select value={form.sex ?? ""} onValueChange={v => handleSelect("sex", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">مرد</SelectItem>
                        <SelectItem value="female">زن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLASS}><Calendar className="h-4 w-4 inline ml-2" />تاریخ تولد</Label>
                    <Calendar22 date={birthDate} setDate={d => { 
                        setBirthDate(d); 
                        // Format date in local timezone to avoid timezone conversion issues
                        const formatDateLocal = (date: Date): string => {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                        };
                        setForm(f => ({ ...f, birthDay: d ? formatDateLocal(d) : undefined })); 
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isargaryType" className={LABEL_CLASS}>نوع ایثارگری</Label>
                    <Select value={form.isargaryType ?? "none"} onValueChange={value => handleIsargaryTypeChange(value as IsargaryType)}>
                      <SelectTrigger id="isargaryType" className="h-11"><SelectValue placeholder="هیچ کدام" /></SelectTrigger>
                      <SelectContent>
                        {ISARGARY_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.isargaryType === 'martyrFamily' && (
                    <div className="space-y-2">
                      <Label htmlFor="martyrRelation" className={LABEL_CLASS}>نسبت با شهید</Label>
                      <Select value={form.martyrRelation ?? ""} onValueChange={value => handleSelect("martyrRelation", value)}>
                        <SelectTrigger id="martyrRelation" className="h-11"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                        <SelectContent>
                          {MARTYR_RELATION_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.isargaryType && !['none', 'martyrFamily'].includes(form.isargaryType) && (
                    <div className="space-y-2">
                      <Label htmlFor="isargarRelation" className={LABEL_CLASS}>نسبت با ایثارگر</Label>
                      <Select value={form.isargarRelation ?? ""} onValueChange={value => handleSelect("isargarRelation", value)}>
                        <SelectTrigger id="isargarRelation" className="h-11"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                        <SelectContent>
                          {ISARGAR_RELATION_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.isargaryType === 'janbaz' && (
                    <div className="space-y-2">
                      <Label htmlFor="janbaziPercent" className={LABEL_CLASS}>درصد جانبازی</Label>
                      <Select value={form.janbaziPercent?.toString() ?? ""} onValueChange={value => handleSelect("janbaziPercent", Number(value))}>
                        <SelectTrigger id="janbaziPercent" className="h-11"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                        <SelectContent>
                          {JANBAZI_PERCENTAGES.map(percent => (
                            <SelectItem key={percent} value={percent.toString()}>{percent}%</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.isargaryType === 'azade' && (
                    <div className="space-y-2">
                      <Label htmlFor="captivityMonths" className={LABEL_CLASS}>مدت اسارت (به ماه)</Label>
                      <Input id="captivityMonths" name="captivityMonths" value={form.captivityMonths ?? ""} onChange={handleNumberChange} type="number" min="1" step="1" className="h-11" />
                    </div>
                  )}
                  {form.isargaryType === 'isargar' && (
                    <>
                      <fieldset className="space-y-2">
                        <legend className={LABEL_CLASS}>نوع حضور در جبهه</legend>
                        <div className="flex h-11 items-center gap-6 rounded-md border px-3">
                          {FRONT_PRESENCE_TYPE_OPTIONS.map(option => (
                            <label key={option.value} className="flex cursor-pointer items-center gap-2">
                              <input
                                type="radio"
                                name="frontPresenceType"
                                value={option.value}
                                checked={form.frontPresenceType === option.value}
                                onChange={() => handleSelect("frontPresenceType", option.value)}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <div className="space-y-2">
                        <Label htmlFor="frontPresenceMonths" className={LABEL_CLASS}>مدت حضور در جبهه (به ماه)</Label>
                        <Input id="frontPresenceMonths" name="frontPresenceMonths" value={form.frontPresenceMonths ?? ""} onChange={handleNumberChange} type="number" min="1" step="1" className="h-11" />
                      </div>
                    </>
                  )}
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
                        ...REGULAR_USER_TYPE_OPTIONS,
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
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Lock className="h-5 w-5 text-gray-600" />
                          تغییر رمز عبور
                        </CardTitle>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                          className="gap-2"
                        >
                          {showPasswordChange ? (
                            <>
                              <X className="h-4 w-4" />
                              بستن
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" />
                              تغییر رمز عبور
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                  
                    {showPasswordChange && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password" className={LABEL_CLASS}>رمز عبور جدید</Label>
                            <PasswordInput
                              id="new-password"
                              name="newPassword" 
                              value={passwordForm.newPassword} 
                              onChange={handlePasswordChange}
                              minLength={6}
                              required
                              className="h-11"
                              visibilityLabel="رمز عبور جدید"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-new-password" className={LABEL_CLASS}>تأیید رمز عبور جدید</Label>
                            <PasswordInput
                              id="confirm-new-password"
                              name="confirmPassword" 
                              value={passwordForm.confirmPassword} 
                              onChange={handlePasswordChange}
                              minLength={6}
                              required
                              className="h-11"
                              visibilityLabel="تأیید رمز عبور جدید"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" onClick={handlePasswordSubmit} className="flex-1 gap-2" disabled={isLoading}>
                            <Lock className="h-4 w-4" />
                            {isLoading ? "در حال تغییر..." : "تغییر رمز عبور"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="secondary" 
                            className="flex-1 gap-2"
                            onClick={() => {
                              setPasswordForm({
                                newPassword: '',
                                confirmPassword: ''
                              });
                              setShowPasswordChange(false);
                            }}
                          >
                            <X className="h-4 w-4" />
                            انصراف
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}
                
                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1 gap-2 h-11">
                    <Save className="h-4 w-4" />
                    ذخیره تغییرات
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 gap-2 h-11"
                    onClick={() => { 
                      setEdit(false); 
                      setForm(user); 
                      setBirthDate(user.birthDay ? new Date(user.birthDay) : undefined); 
                    }}
                  >
                    <X className="h-4 w-4" />
                    انصراف
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <TransactionEditDialog
        transaction={editingTransaction?.transaction || null}
        type={editingTransaction?.type || 'preselling'}
        userInfo={viewer || undefined}
        onClose={() => setEditingTransaction(null)}
        onSaved={() => {
          if (editingTransaction?.type === 'final') {
            refreshFinalTransactions();
          } else {
            refreshTransactions();
          }
        }}
      />
      {isLoading && <PageLoader />}
    </div>
  );
}
