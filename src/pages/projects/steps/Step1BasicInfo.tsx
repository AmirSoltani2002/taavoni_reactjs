import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building, MapPin, Calendar, Camera } from "lucide-react";
import { Calendar22 } from "@/components/calendars/calendar";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Project } from "../columns";

interface Step1BasicInfoProps {
  project: Project;
  handleProjectChange: (name: string, value: any) => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ 
  project, 
  handleProjectChange 
}) => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-200/30 pb-6">
        <CardTitle className="flex items-center gap-4 text-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-sm opacity-30"></div>
            <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              اطلاعات پایه پروژه
            </span>
            <p className="text-sm text-slate-500 font-normal mt-1">
              مشخصات کلی و اطلاعات اصلی پروژه را وارد کنید
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Name & Address */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <div className="p-1 rounded-md">
                  <Building className="w-4 h-4 text-blue-600" />
                </div>
                نام پروژه *
              </Label>
              <Input 
                required 
                type='text' 
                name="name" 
                value={project.name || ""} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                className="h-12 text-lg bg-white/50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                placeholder="نام پروژه خود را وارد کنید..."
              />
            </div>
            
            <div>
              <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <div className="p-1 rounded-md">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                آدرس پروژه *
              </Label>
              <Input 
                required 
                type='text' 
                name="address" 
                value={project.address || ""} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                className="h-12 bg-white/50 border-slate-200 focus:bg-white focus:border-green-400 focus:ring-green-400/20 transition-all duration-200"
                placeholder="آدرس کامل پروژه را وارد کنید..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <div className="p-1 rounded-md">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  تاریخ شروع *
                </Label>
                <div className="[&>div>button]:bg-white/50 [&>div>button]:border-slate-200 [&>div>button:hover]:bg-white [&>div>button]:h-12 [&>div>button]:transition-all [&>div>button]:duration-200">
                  <Calendar22 
                    title="" 
                    date={project.startDate ? new Date(project.startDate) : undefined} 
                    setDate={(d) => handleProjectChange('startDate', d?.toISOString())} 
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <div className="p-1 rounded-md">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  تاریخ پایان
                </Label>
                <div className="[&>div>button]:bg-white/50 [&>div>button]:border-slate-200 [&>div>button:hover]:bg-white [&>div>button]:h-12 [&>div>button]:transition-all [&>div>button]:duration-200">
                  <Calendar22 
                    title="" 
                    date={project.endDate ? new Date(project.endDate) : undefined} 
                    setDate={(d) => handleProjectChange('endDate', d?.toISOString())} 
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <div className="p-1 rounded-md">
                  <Building className="w-4 h-4 text-indigo-600" />
                </div>
                مساحت زمین (متر مربع) *
              </Label>
              <Input 
                required 
                type='number' 
                name="landArea" 
                value={project.landArea || ""} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value ? Number(e.target.value) : "")}
                className="h-12 bg-white/50 border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200"
                placeholder="مساحت زمین را وارد کنید..."
                min="1"
              />
            </div>
          </div>

          {/* Project Image */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
              <div className="p-1 rounded-md">
                <Camera className="w-4 h-4 text-pink-600" />
              </div>
              تصویر پروژه
            </Label>
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors">
              <ImageUpload 
                value={project?.projectDocs?.[0]?.document}
                onChange={(value) => handleProjectChange('projectImage', value)}
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              تصویر زیبایی از پروژه خود آپلود کنید
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
