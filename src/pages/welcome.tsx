import React from "react"
import { Button } from "../components/ui/button"
import logo from '../assets/logo.png'
import admin from '../assets/admin.jpg'
import invest from '../assets/invest.jpg'
import { project_name } from "../config"
import { useNavigate } from "react-router-dom"


const Welcome: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[url('/home/amirabbas/Documents/personal/work/taavoni/project/src/assets/Cover.png')] bg-center bg-cover">
      <div className="bg-white/75 rounded-md">
        {/* Project title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-primary mt-6">
          {project_name}
        </h1>
        <p className="mt-10 font-semibold">
          به سامانه سرمایه‌گذاری {project_name} خوش آمدید
        </p>
        <p className="text-muted-foreground">
          پلتفرم حرفه‌ای سرمایه‌گذاری پروژه‌های املاک و مستغلات
        </p>
      </div>

      {/* Logo */}
      <div className="mb-8">
        <img
          src={logo}
          alt="Logo"
          className="w-48 sm:max-md:w-full h-auto mx-auto"
        />
      </div>

      {/* Roles section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Manager */}
        <div className="flex flex-col items-center gap-4 border rounded-xl p-6 shadow-sm">
          <img src={admin} alt="مدیر" className="w-2xl h-2/4" />
          <p className="font-semibold">ورود به عنوان مدیر</p>
          <p className="text-sm text-muted-foreground text-center">
            مدیریت پروژه‌ها، کاربران و پیگیری درخواست‌ها
          </p>
          <Button onClick={() => navigate("/signin?type=admin")} variant="outline" className="w-full">
            ورود به عنوان مدیر
          </Button>
        </div>

        {/* Investor */}
        <div className="flex flex-col items-center gap-4 border rounded-xl p-6 shadow-sm">
          <img src={invest} alt="سرمایه‌گذار" className="w-2xl h-2/4" />
          <p className="font-semibold">ورود به عنوان سرمایه‌گذار</p>
          <p className="text-sm text-muted-foreground text-center">
            مشاهده پروژه‌ها، مقایسه پروژه‌ها و پیگیری درخواست‌ها
          </p>
          <Button onClick={() => navigate("/signin?type=investor")} variant="outline" className="w-full">
            ورود به عنوان سرمایه‌گذار
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Welcome
