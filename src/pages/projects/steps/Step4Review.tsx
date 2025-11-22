import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  MapPin, 
  Calendar, 
  Square, 
  Blocks, 
  Home, 
  Users, 
  Star, 
  Navigation,
} from "lucide-react";
import type { Project, Block, SubProject } from "../columns";

interface Step4ReviewProps {
  project: Project;
  blocks: Block[];
  units: SubProject[];
}

export const Step4Review: React.FC<Step4ReviewProps> = ({ 
  project, 
  blocks, 
  units 
}) => {
  const totalUnits = units.length;
  const totalFloors = blocks.reduce((sum, block) => sum + block.floorCount, 0);
  const totalBuildingArea = blocks.reduce((sum, block) => sum + block.buildingArea, 0);
  const totalShareArea = blocks.reduce((sum, block) => sum + block.shareArea, 0);

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
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
                خلاصه پروژه
              </span>
              <p className="text-sm text-slate-500 font-normal mt-1">
                بررسی نهایی اطلاعات پروژه قبل از تایید
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-700">نام پروژه:</span>
                <span className="text-slate-900">{project.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-slate-700">آدرس:</span>
                <span className="text-slate-900">{project.address}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Square className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-slate-700">مساحت زمین:</span>
                <span className="text-slate-900">{project.landArea} متر مربع</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-slate-700">تاریخ شروع:</span>
                <span className="text-slate-900">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('fa-IR') : 'تعیین نشده'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-slate-700">تاریخ پایان:</span>
                <span className="text-slate-900">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString('fa-IR') : 'تعیین نشده'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocks Summary */}
      <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
        <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-b border-green-200/30 pb-6">
          <CardTitle className="flex items-center gap-4 text-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-sm opacity-30"></div>
              <div className="relative p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Blocks className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                خلاصه بلوک‌ها
              </span>
              <p className="text-sm text-slate-500 font-normal mt-1">
                {blocks.length} بلوک - {totalFloors} طبقه - {totalBuildingArea} متر مربع زیربنا
                - {totalShareArea} متر مربع مشاعات
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {blocks.map((block, _index) => (
              <Card key={block.id} className="border border-green-200 bg-green-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-green-700 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {block.name}
                    </h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {block.floorCount} طبقه
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600">زیربنا:</span>
                      <span className="font-semibold">{block.buildingArea} متر مربع</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4 text-purple-600" />
                      <span className="text-slate-600">مشاعات:</span>
                      <span className="font-semibold">{block.shareArea} متر مربع</span>
                    </div>
                    
                    {block.description && (
                      <div className="md:col-span-3">
                        <span className="text-slate-600">توضیحات:</span>
                        <p className="text-slate-800 mt-1">{block.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Units Summary */}
      <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
        <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b border-purple-200/30 pb-6">
          <CardTitle className="flex items-center gap-4 text-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-sm opacity-30"></div>
              <div className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Home className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                خلاصه واحدها
              </span>
              <p className="text-sm text-slate-500 font-normal mt-1">
                {totalUnits} واحد مسکونی تعریف شده
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit, _index) => (
              <Card key={unit.id} className="border border-purple-200 bg-purple-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-purple-700 flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      واحد #{unit.unitNumber}
                    </h4>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      طبقه {unit.floor}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600">متراژ:</span>
                      <span className="font-semibold">{unit.area} متر مربع</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">خواب:</span>
                      <span className="font-semibold">{unit.roomCount}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-orange-600" />
                      <span className="text-slate-600">جهت:</span>
                      <span className="font-semibold">
                        {unit.direction === 'north' ? 'شمال' :
                         unit.direction === 'south' ? 'جنوب' :
                         unit.direction === 'east' ? 'شرق' :
                         unit.direction === 'west' ? 'غرب' :
                         unit.direction === 'north-east' ? 'شمال-شرق' :
                         unit.direction === 'north-west' ? 'شمال-غرب' :
                         unit.direction === 'south-east' ? 'جنوب-شرق' :
                         unit.direction === 'south-west' ? 'جنوب-غرب' : unit.direction}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="text-slate-600">امتیاز:</span>
                      <span className="font-semibold">{unit.point}/10</span>
                    </div>
                    
                    {unit.options && (
                      <div className="mt-2">
                        <span className="text-slate-600">توضیحات:</span>
                        <p className="text-slate-800 text-xs mt-1">{unit.options}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
