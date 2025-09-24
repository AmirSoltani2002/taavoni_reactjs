import { Calendar22 } from "@/components/calendars/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Building, MapPin, Calendar, Users, Home, Square, FileText, Camera, Sparkle } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Project, UnitType } from "./columns";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
interface GeneralInfoProps {
    project: Project;
    handleProjectChange: (name: string, value?: string) => void;
}
export const GeneralInfo: React.FC<GeneralInfoProps> = ({project, handleProjectChange}) => {
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
                    <div className="p-1 rounded-md">
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
                    <div className="p-1 rounded-md">
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
                    <div className="p-1 rounded-md">
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
                    <div className="p-1 rounded-md">
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
                <div className="p-1 rounded-md">
                    <Camera className="w-4 h-4 text-pink-600" />
                </div>
                تصویر پروژه
                </Label>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors">
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

interface ProjectSpecsProps {
    project: Project;
    handleProjectChange: (name: string, value?: string) => void;
    floorCounts: number[];
    setFloorCounts: (fc: number[]) => void;
}

export const ProjectSpecs: React.FC<ProjectSpecsProps> = ({ project, handleProjectChange, floorCounts, setFloorCounts }) => {
    useEffect(() => {
      if(!project.blockNumber){return};
      setFloorCounts(
        Array.from({length: project.blockNumber}).map(_ => 0)
      )
    }, [project.blockNumber]);
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

            {project.blockNumber && Array.from({length: project.blockNumber}).map((_, bn) => (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                <Building className="w-4 h-4" />
                {`تعداد طبقات بلوک ${bn + 1}`}
                </Label>
                <Input 
                required 
                type='number' 
                name="floorCount" 
                value={floorCounts[bn]} 
                onChange={(e) => {
                  const fc = [...floorCounts];
                  fc[bn] = Number(e.currentTarget.value);
                  setFloorCounts(fc);
                }}
                className="h-12"
                min="1"
                />
                {(project.blockNumber && project.blockNumber > 1) && (
                <p className="text-xs text-slate-500">مجموع طبقات همه بلوک‌ها</p>
                )}
            </div>))}

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
                مساحت زیربنا (متر مربع) *
                </Label>
                <Input 
                required 
                type='number' 
                name='buildingArea'
                value={project.buildingArea} 
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
    floorCounts?: number[];
}
export const UnitTypes: React.FC<UnitProps> = ({unitTypes, setUnitTypes, floorCounts}) => {
    const [nextId, setNextId] = useState(1);
    const addUnitType = (block: number, floor: number) => {
        const newUnitType: UnitType = { id: nextId, count: 1, area: 50, roomCount: 1, point: 7, floor, block };
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
             <CardHeader className="border-b border-purple-200/30 pb-6">
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-4 text-xl">
                   <div className="relative">
                     <div className="absolute inset-0 rounded-xl blur-sm opacity-30"></div>
                     <div className="relative p-3 bg-purple-500 rounded-xl">
                       <Users className="w-6 h-6 text-white" />
                     </div>
                   </div>
                   <div>
                     <span className="bg-purple-600 bg-clip-text text-transparent font-bold">
                       تیپ واحدهای پروژه
                     </span>
                     <p className="text-sm text-slate-500 font-normal mt-1">
                       انواع واحدهای مسکونی و مشخصات آن‌ها را تعریف کنید
                     </p>
                   </div>
                 </CardTitle>
               </div>
             </CardHeader>
            <CardContent className="p-6">
              {!floorCounts ? (
                <div className="space-y-4">لطفا ابتدا تعداد طبقات را مشخص کنید</div>
              ) : (<div>
                {floorCounts.map((floors, blockIndex) => (
                  <Card key={blockIndex} className="mb-8 border-2 border-blue-200/40 bg-blue-50/30 shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-700 text-lg">بلوک {blockIndex + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {floors === 0 && "ابتدا تعداد طبقات این بلوک را در مرحله قبل مشخص کنید"}
                      {Array.from({length: floors}).map((_, floorIndex) => {
                        const this_floor_unitYpes = unitTypes.filter(u => u.block === blockIndex && u.floor === floorIndex)
                        return <div className="space-y-4" key={floorIndex}>
                          <div className="font-bold text-slate-700 mb-2">طبقه {floorIndex + 1}</div>
                            <Card key={`${blockIndex}_${floorIndex}`} className="bg-gradient-to-br from-white/80 to-purple-50/30 border-0 ring-1 ring-purple-200/50 hover:ring-purple-300/70 shadow-lg hover:shadow-xl transition-all duration-300">
                              <CardContent className="p-6">
                                {this_floor_unitYpes.map((u, index) => (
                                  <div className="my-4 py-4 border-b border-purple-500">
                                    <div className="flex items-center justify-between mb-6">
                                      <h4 className="font-bold text-slate-900 flex items-center gap-3 text-lg">
                                        <div className="p-2 bg-purple-500 rounded-lg">
                                          <Home className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="bg-purple-600 bg-clip-text text-transparent">
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
                                          <div className="p-1 rounded-md">
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
                                          <div className="p-1 rounded-md">
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
                                          <div className="p-1 rounded-md">
                                            <Home className="w-3 h-3 text-purple-600" />
                                          </div>
                                          تعداد خواب
                                        </Label>
                                        <Input
                                          type="number"
                                          value={u.roomCount}
                                          onChange={(e) => updateUnitType(u.id, 'roomCount', Number(e.target.value) || 0)}
                                          className="h-11 bg-white/60 border-slate-200 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                                          min="0"
                                          placeholder="2"
                                        />
                                      </div>
                                      <div>
                                        <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                                          <div className="p-1 rounded-md">
                                            <Sparkle className="w-3 h-3 text-purple-600" />
                                          </div>
                                          {`امتیاز: ${u.point}`}
                                        </Label>
                                        <Slider
                                          value={[u.point || 7]}
                                          onValueChange={(val: number[]) => updateUnitType(u.id, 'point', val[0])}
                                          className="h-11 bg-white/60 border-slate-200 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                                          min={0}
                                          max={10}
                                          defaultValue={[7]}
                                        />
                                      </div>
                                    </div>
                                  </div>))}
                                <Button className="mt-4" type="button" variant={'secondary'} onClick={() => addUnitType(blockIndex, floorIndex)}>افزودن تیپ واحد <Plus /></Button>
                              </CardContent>
                            </Card>
                        </div>
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>)}
            </CardContent>
          </Card>
          
}