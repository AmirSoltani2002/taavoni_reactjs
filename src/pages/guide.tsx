import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  CheckCircle2, 
  CreditCard, 
  KeyRound, 
  FileCheck, 
  User as UserIcon, 
  MessageSquare,
  Play,
  BookOpen,
  Crown,
  ArrowLeft,
  Circle
} from "lucide-react";
import { getTable } from "@/general";
import { PageLoader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  steps: string[];
  route?: string;
  tourTarget?: string;
}

const adminGuides: GuideStep[] = [
  {
    id: "add-user",
    title: "افزودن کاربر جدید",
    description: "راهنمای کامل برای ایجاد حساب کاربری جدید",
    steps: [
      "از منوی سمت راست، روی 'کاربران' کلیک کنید",
      "از زیرمنو، گزینه 'ایجاد کاربر جدید' یا 'ایجاد ادمین جدید' را انتخاب کنید",
      "فرم ایجاد کاربر را با اطلاعات مورد نیاز پر کنید",
      "اطلاعات ضروری شامل: نام، نام خانوادگی، کد ملی، موبایل و رمز عبور",
      "نوع کاربر را انتخاب کنید (ادمین، عضو دانشگاه تهران، و غیره)",
      "پس از تکمیل فرم، روی دکمه 'ذخیره' کلیک کنید"
    ],
    route: "/users/create?type=other",
    tourTarget: "users-menu"
  },
  {
    id: "verify-user",
    title: "تایید کاربر",
    description: "راهنمای تایید حساب کاربری کاربران",
    steps: [
      "از منوی سمت راست، روی 'کاربران' کلیک کنید",
      "گزینه 'مشاهده همه کاربران' را انتخاب کنید",
      "در لیست کاربران، کاربر مورد نظر را پیدا کنید",
      "روی ردیف کاربر کلیک کنید تا به صفحه پروفایل بروید",
      "یا از منوی عملیات (سه نقطه) در انتهای ردیف، گزینه 'تایید کاربر' را انتخاب کنید",
      "پس از تایید، وضعیت کاربر به 'تایید شده' تغییر می‌کند"
    ],
    route: "/users/list",
    tourTarget: "users-list"
  },
  {
    id: "preselling",
    title: "اعطای پیش‌فروش به کاربر",
    description: "راهنمای ثبت پیش‌فروش برای کاربران",
    steps: [
      "از منوی سمت راست، روی 'پروژه‌ها' کلیک کنید",
      "از زیرمنو، گزینه 'پیش‌فروش‌ها' را انتخاب کنید",
      "در صفحه پیش‌فروش‌ها، روی دکمه 'ثبت پیش‌فروش جدید' کلیک کنید",
      "کاربر مورد نظر را از لیست انتخاب کنید",
      "پروژه، کاربر و متراژ مورد نظر را انتخاب کنید",
      "پس از تکمیل اطلاعات، روی دکمه 'ذخیره' کلیک کنید",
      "پیش‌فروش با موفقیت ثبت می‌شود و در لیست نمایش داده می‌شود"
    ],
    route: "/projects/preselling/list",
    tourTarget: "create-preselling-button"
  },
  {
    id: "assign-subproject",
    title: "اعطای واحد به کاربر",
    description: "راهنمای اختصاص واحد مسکونی به کاربر",
    steps: [
      "از منوی سمت راست، روی دکمه 'اعطای واحد به کاربر' کلیک کنید",
      "در پنجره باز شده، کاربر مورد نظر را از لیست انتخاب کنید",
      "پروژه مورد نظر را از لیست انتخاب کنید",
      "بلوک مورد نظر را انتخاب کنید",
      "واحد مورد نظر را انتخاب کنید",
      "اطلاعات تکمیلی را بررسی و تایید کنید",
      "روی دکمه 'اعطای واحد' کلیک کنید",
      "واحد با موفقیت به کاربر اختصاص داده می‌شود"
    ],
    route: "/users/0/assign-project",
    tourTarget: "assign-unit"
  },
  {
    id: "verify-transaction",
    title: "تایید تراکنش‌ها",
    description: "راهنمای بررسی و تایید تراکنش‌های کاربران",
    steps: [
      "از منوی سمت راست، روی 'رسیدهای پرداخت' کلیک کنید",
      "برای پیش‌فروش: گزینه 'رسیدهای پیش‌فروش' را انتخاب کنید",
      "برای پرداخت نهایی: گزینه 'رسیدهای نهایی' را انتخاب کنید",
      "در لیست تراکنش‌ها، تراکنش مورد نظر را پیدا کنید",
      "روی ردیف تراکنش کلیک کنید تا جزئیات کامل را ببینید",
      "اطلاعات پرداخت، فیش بانکی و سایر مدارک را بررسی کنید",
      "از منوی عملیات (سه نقطه)، گزینه 'تایید' را انتخاب کنید",
      "پس از تایید، وضعیت تراکنش به 'تایید شده' تغییر می‌کند"
    ],
    route: "/transactions/preselling/list",
    tourTarget: "verify-transaction"
  }
];

const userGuides: GuideStep[] = [
  {
    id: "fill-profile",
    title: "تکمیل اطلاعات پروفایل",
    description: "راهنمای تکمیل و به‌روزرسانی اطلاعات شخصی",
    steps: [
      "از منوی سمت راست، روی 'داشبورد' کلیک کنید",
      "در صفحه پروفایل، بخش‌های مختلف اطلاعات را بررسی کنید",
      "برای ویرایش هر بخش، روی دکمه 'ویرایش' کلیک کنید",
      "اطلاعات مورد نیاز را وارد کنید:",
      "  - اطلاعات شخصی: نام، نام خانوادگی، کد ملی، تاریخ تولد",
      "  - اطلاعات تماس: موبایل، تلفن منزل، تلفن محل کار، ایمیل",
      "  - آدرس: آدرس محل سکونت",
      "  - اطلاعات ایثارگری: در صورت وجود",
      "پس از تکمیل، روی دکمه 'ذخیره' کلیک کنید",
      "اطلاعات شما ذخیره و به‌روزرسانی می‌شود"
    ],
    route: "/dashboard",
    tourTarget: "profile-page"
  },
  {
    id: "send-ticket",
    title: "ارسال تیکت پشتیبانی",
    description: "راهنمای ارسال تیکت و ارتباط با پشتیبانی",
    steps: [
      "از منوی سمت راست، روی 'پشتیبانی' کلیک کنید",
      "روی دکمه 'تیکت جدید' کلیک کنید",
      "نوع تیکت را انتخاب کنید:",
      "  - تایید حساب کاربری: برای درخواست تایید حساب",
      "  - درخواست خرید واحد: برای درخواست خرید واحد مسکونی",
      "  - تایید پرداخت: برای تایید پرداخت انجام شده",
      "  - درخواست واگذاری: برای واگذاری واحد خریداری شده",
      "  - تغییر اطلاعات: برای تغییر اطلاعات پروفایل",
      "  - سایر: برای سایر درخواست‌ها",
      "عنوان و متن تیکت را وارد کنید",
      "در صورت نیاز، فایل یا تصویر ضمیمه کنید",
      "روی دکمه 'ارسال' کلیک کنید",
      "تیکت شما ثبت شده و می‌توانید پاسخ را در همان صفحه مشاهده کنید"
    ],
    route: "/tickets/list",
    tourTarget: "tickets-page"
  }
];

interface TourStep {
  target: string;
  content: string;
  title: string;
  position?: "top" | "bottom" | "left" | "right";
}

export default function GuidePage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTable('users/profile', (d) => {
      setIsAdmin(d?.type === 'admin' || d?.type === 'system');
      setIsLoading(false);
    });
  }, []);

  const startTour = (guide: GuideStep) => {
    // Create tour steps based on the guide
    const steps: TourStep[] = guide.steps.map((step, index) => ({
      target: guide.tourTarget || `step-${index}`,
      content: step,
      title: `${guide.title} - مرحله ${index + 1}`,
      position: "right" as const
    }));

    // Dispatch tour start event to global tour overlay
    const tourState = {
      activeTour: guide.id,
      tourStep: 0,
      tourSteps: steps,
      hasNavigated: false,
      tourGuide: {
        route: guide.route,
        tourTarget: guide.tourTarget
      }
    };

    window.dispatchEvent(new CustomEvent('tour:start', { detail: tourState }));
    
    // Set up navigation listener
    const handleNavigate = (event: CustomEvent<string>) => {
      navigate(event.detail);
    };
    
    // Listen for navigation events from tour overlay
    window.addEventListener('tour:navigate' as any, handleNavigate as any);
    
    // Clean up listener after a delay (in case tour ends)
    setTimeout(() => {
      window.removeEventListener('tour:navigate' as any, handleNavigate as any);
    }, 60000); // 60 seconds timeout
  };


  const guides = isAdmin ? adminGuides : userGuides;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">راهنمای استفاده از پلتفرم</h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
              <Crown className="h-3 w-3 mr-1" />
              راهنمای ادمین
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <UserIcon className="h-3 w-3 mr-1" />
              راهنمای کاربر
            </Badge>
          )}
        </div>
        <p className="text-gray-600 mt-4 text-lg">
          در این صفحه می‌توانید راهنمای کامل استفاده از پلتفرم را مشاهده کنید. 
          برای هر بخش، می‌توانید با کلیک روی دکمه 'شروع تور' یک راهنمای تعاملی را تجربه کنید.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {guides.map((guide, index) => (
          <Card key={guide.id} className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isAdmin ? (
                      <>
                        {index === 0 && <UserPlus className="h-5 w-5 text-blue-600" />}
                        {index === 1 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {index === 2 && <CreditCard className="h-5 w-5 text-purple-600" />}
                        {index === 3 && <KeyRound className="h-5 w-5 text-orange-600" />}
                        {index === 4 && <FileCheck className="h-5 w-5 text-red-600" />}
                      </>
                    ) : (
                      <>
                        {index === 0 && <UserIcon className="h-5 w-5 text-blue-600" />}
                        {index === 1 && <MessageSquare className="h-5 w-5 text-green-600" />}
                      </>
                    )}
                    <CardTitle className="text-xl">{guide.title}</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 mt-2">
                    {guide.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {guide.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="flex-shrink-0 mt-1">
                      <Circle className="h-4 w-4 text-blue-500 fill-current" />
                    </div>
                    <span className="flex-1 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button
                  onClick={() => startTour(guide)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Play className="h-4 w-4 ml-2" />
                  شروع تور
                </Button>
                {guide.route && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(guide.route!)}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 ml-2" />
                    رفتن به صفحه
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      <style>{`
        .tour-highlight {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
          transition: all 0.3s ease !important;
          z-index: 1000 !important;
          position: relative !important;
        }
      `}</style>
    </div>
  );
}

