import { Calendar22 } from "@/components/calendars/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Building, MapPin, Calendar, Users, Home, Square, FileText, Camera, Sparkles } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Project, UnitType } from "./columns";
interface Props {
    project: Project;
    handleProjectChange: (name: string, value?: string) => void;
}
export const GeneralInfo: React.FC<Props> = ({project, handleProjectChange}) => {
    return <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
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
                اطلاعات اصلی پروژه
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
                    <div className="p-1 bg-blue-100 rounded-md">
                    <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    نام پروژه *
                </Label>
                <Input 
                    required 
                    type='text' 
                    name="name" 
                    value={project.name} 
                    onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                    className="h-12 text-lg bg-white/50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                    placeholder="نام پروژه خود را وارد کنید..."
                />
                </div>
                
                <div>
                <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                    <div className="p-1 bg-green-100 rounded-md">
                    <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    آدرس پروژه *
                </Label>
                <Input 
                    required 
                    type='text' 
                    name="address" 
                    value={project.address} 
                    onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                    className="h-12 bg-white/50 border-slate-200 focus:bg-white focus:border-green-400 focus:ring-green-400/20 transition-all duration-200"
                    placeholder="آدرس کامل پروژه را وارد کنید..."
                />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                    <div className="p-1 bg-purple-100 rounded-md">
                        <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    تاریخ شروع
                    </Label>
                    <div className="[&>div>button]:bg-white/50 [&>div>button]:border-slate-200 [&>div>button:hover]:bg-white [&>div>button]:h-12 [&>div>button]:transition-all [&>div>button]:duration-200">
                    <Calendar22 title="" date={project.startDate} setDate={(d) => handleProjectChange('startDate', d?.toISOString())} />
                    </div>
                </div>
                <div>
                    <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                    <div className="p-1 bg-orange-100 rounded-md">
                        <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    تاریخ پایان
                    </Label>
                    <div className="[&>div>button]:bg-white/50 [&>div>button]:border-slate-200 [&>div>button:hover]:bg-white [&>div>button]:h-12 [&>div>button]:transition-all [&>div>button]:duration-200">
                    <Calendar22 title="" date={project.endDate} setDate={(d) => handleProjectChange('endDate', d?.toISOString())} />
                    </div>
                </div>
                </div>
            </div>

            {/* Project Image */}
            <div className="space-y-4">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <div className="p-1 bg-pink-100 rounded-md">
                    <Camera className="w-4 h-4 text-pink-600" />
                </div>
                تصویر پروژه
                </Label>
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors">
                <ImageUpload 
                    value={project?.docs?.[0]}
                    onChange={(value) => handleProjectChange('image', value)}
                />
                </div>
                <p className="text-xs text-slate-500 text-center">
                تصویر زیبایی از پروژه خود آپلود کنید
                </p>
            </div>
        </div>
    </CardContent>
</Card>
}

export const ProjectSpecs: React.FC<Props> = ({ project, handleProjectChange }) => {
    return <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-b border-green-200/30 pb-6">
            <CardTitle className="flex items-center gap-4 text-xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-sm opacity-30"></div>
                    <div className="relative p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <Square className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                    مشخصات فنی پروژه
                    </span>
                    <p className="text-sm text-slate-500 font-normal mt-1">
                    جزئیات فنی و آماری پروژه را مشخص کنید
                    </p>
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                <Home className="w-4 h-4" />
                تعداد بلوک‌ها *
                </Label>
                <Input 
                required 
                type='number' 
                name="blockNumber" 
                value={project.blockNumber} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                className="h-12"
                min="1"
                />
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                <Building className="w-4 h-4" />
                تعداد طبقات *
                </Label>
                <Input 
                required 
                type='number' 
                name="floorCount" 
                value={project.floorCount} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                className="h-12"
                min="1"
                />
                {(project.blockNumber && project.blockNumber > 1) && (
                <p className="text-xs text-slate-500">مجموع طبقات همه بلوک‌ها</p>
                )}
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                <Users className="w-4 h-4" />
                تعداد کل واحدها *
                </Label>
                <Input 
                required 
                type='number' 
                name="unitCount" 
                value={project.unitCount} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                className="h-12"
                min="1"
                />
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                <Square className="w-4 h-4" />
                مساحت زمین (متر مربع) *
                </Label>
                <Input 
                required 
                type='number' 
                name="landArea" 
                value={project.landArea} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                className="h-12"
                min="1"
                />
            </div>


            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                <Square className="w-4 h-4" />
                مشاعات (متر مربع)
                </Label>
                <Input 
                type='number' 
                name="sharedArea" 
                value={project.sharedArea} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                className="h-12"
                min="0"
                />
            </div>
            </div>

            <div className="mt-6">
            <Label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                <FileText className="w-4 h-4" />
                توضیحات و یادداشت‌ها
            </Label>
            <Input 
                type="text" 
                name="options" 
                value={project.options} 
                onChange={(e) => handleProjectChange(e.target.name, e.target.value)}
                className="h-12"
                placeholder="توضیحات اضافی درباره پروژه..."
            />
            </div>
        </CardContent>
    </Card>

}

interface UnitProps {
    unitTypes: UnitType[];
    setUnitTypes: (newTypes: UnitType[]) => void;
    nextId: number;
    setNextId: (i: number) => void
}
export const UnitTypes: React.FC<UnitProps> = ({unitTypes, setUnitTypes, nextId, setNextId}) => {
    const addUnitType = () => {
        const newUnitType = { id: nextId, count: 1, area: 50, bedrooms: 1, bathrooms: 1 };
        setUnitTypes([...unitTypes, newUnitType]);
        setNextId(nextId + 1);
    };

    const updateUnitType = (id: number, field: keyof UnitType, value: string | number) => {
        setUnitTypes(unitTypes.map(u => u.id === id ? { ...u, [field]: value } : u));
    };

    const removeUnitType = (id: number) => {
        setUnitTypes(unitTypes.filter(u => u.id !== id));
    };

    return <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
             <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b border-purple-200/30 pb-6">
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-4 text-xl">
                   <div className="relative">
                     <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-sm opacity-30"></div>
                     <div className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                       <Users className="w-6 h-6 text-white" />
                     </div>
                   </div>
                   <div>
                     <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                       تیپ واحدهای پروژه
                     </span>
                     <p className="text-sm text-slate-500 font-normal mt-1">
                       انواع واحدهای مسکونی و مشخصات آن‌ها را تعریف کنید
                     </p>
                   </div>
                 </CardTitle>
                 <Button 
                   type="button" 
                   onClick={addUnitType}
                   className="gap-2 h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                 >
                   <Plus className="h-5 w-5" /> 
                   افزودن تیپ جدید
                 </Button>
               </div>
             </CardHeader>
            <CardContent className="p-6">
              {unitTypes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-30"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">هیچ تیپ واحدی تعریف نشده</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                    برای ایجاد پروژه کامل، ابتدا انواع واحدهای مسکونی و مشخصات آن‌ها را تعریف کنید
                  </p>
                  <Button 
                    type="button" 
                    onClick={addUnitType}
                    className="gap-3 h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Sparkles className="h-5 w-5" /> 
                    افزودن اولین تیپ واحد
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {unitTypes.map((u, index) => (
                    <Card key={u.id} className="bg-gradient-to-br from-white/80 to-purple-50/30 border-0 ring-1 ring-purple-200/50 hover:ring-purple-300/70 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-bold text-slate-900 flex items-center gap-3 text-lg">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                              <Home className="w-5 h-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              تیپ واحد #{index + 1}
                            </span>
                          </h4>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeUnitType(u.id)}
                            className="h-10 w-10 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          <div>
                            <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                              <div className="p-1 bg-blue-100 rounded-md">
                                <Users className="w-3 h-3 text-blue-600" />
                              </div>
                              تعداد واحد
                            </Label>
                            <Input
                              type="number"
                              value={u.count}
                              onChange={(e) => updateUnitType(u.id, "count", Number(e.target.value) || 0)}
                              className="h-11 bg-white/60 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                              min="1"
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                              <div className="p-1 bg-green-100 rounded-md">
                                <Square className="w-3 h-3 text-green-600" />
                              </div>
                              متراژ (متر)
                            </Label>
                            <Input
                              type="number"
                              value={u.area}
                              onChange={(e) => updateUnitType(u.id, "area", Number(e.target.value) || 0)}
                              className="h-11 bg-white/60 border-slate-200 focus:bg-white focus:border-green-400 focus:ring-green-400/20 transition-all duration-200"
                              min="1"
                              placeholder="80"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                              <div className="p-1 bg-purple-100 rounded-md">
                                <Home className="w-3 h-3 text-purple-600" />
                              </div>
                              تعداد خواب
                            </Label>
                            <Input
                              type="number"
                              value={u.bedrooms}
                              onChange={(e) => updateUnitType(u.id, "bedrooms", Number(e.target.value) || 0)}
                              className="h-11 bg-white/60 border-slate-200 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                              min="0"
                              placeholder="2"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                              <div className="p-1 bg-orange-100 rounded-md">
                                <Square className="w-3 h-3 text-orange-600" />
                              </div>
                              تعداد حمام
                            </Label>
                            <Input
                              type="number"
                              value={u.bathrooms}
                              onChange={(e) => updateUnitType(u.id, "bathrooms", Number(e.target.value) || 0)}
                              className="h-11 bg-white/60 border-slate-200 focus:bg-white focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-200"
                              min="1"
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                              <div className="p-1 bg-pink-100 rounded-md">
                                <Building className="w-3 h-3 text-pink-600" />
                              </div>
                              بلوک
                            </Label>
                            <Input
                              value={u.block || ""}
                              onChange={(e) => updateUnitType(u.id, "block", e.target.value)}
                              className="h-11 bg-white/60 border-slate-200 focus:bg-white focus:border-pink-400 focus:ring-pink-400/20 transition-all duration-200"
                              placeholder="A"
                            />
                          </div>
                        </div>
                        
                        {(u.count > 0 && u.area > 0) && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">
                              <span className="font-medium">{u.count} واحد</span> با متراژ <span className="font-medium">{u.area} متر</span>
                              {u.bedrooms > 0 && <>, <span className="font-medium">{u.bedrooms} خواب</span></>}
                              {u.bathrooms > 0 && <>, <span className="font-medium">{u.bathrooms} حمام</span></>}
                              {u.block && <> در بلوک <span className="font-medium">{u.block}</span></>}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
}