import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Trash } from "lucide-react";
import { Calendar22 } from "@/components/calendars/calendar";
import { postTable } from "@/general";
import { PageLoader } from "@/components/ui/loader";

interface UnitType {
  id: number;
  count: number;
  area: number;
  bedrooms: number;
  block?: string;
  options?: string;
}

interface Unit {
  projectId?: number;
  unit_number?: number;
  floor?: number;
  block?: string;
  area?: number;
  roomCount?: number;
  point?: number;
}

export default function ProjectCreate() {
  const [loading, setLoading] =  useState(false);
  const [project, setProject] = useState<{
    name: string;
    address: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    floorCount : number;
    unitCount: number;
    blockNumber: number;
    landArea: number;
    buildingArea: number;
    sharedArea: number;
    options: string;
  }>({
    name: "",
    address: "",
    startDate: undefined,
    endDate: undefined,
    floorCount : 0,
    unitCount: 0,
    blockNumber: 1,
    landArea: 0,
    buildingArea: 0,
    sharedArea: 0,
    options: "",
  });

  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [nextId, setNextId] = useState(1);

  const handleProjectChange = (name: string, value: any) => {
    setProject({ ...project, [name]: value });
  };

  const addUnitType = () => {
    setUnitTypes([...unitTypes, { id: nextId, count: 0, area: 0, bedrooms: 0 }]);
    setNextId(nextId + 1);
  };

  const updateUnitType = (id: number, field: keyof UnitType, value: string | number) => {
    setUnitTypes(unitTypes.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const removeUnitType = (id: number) => {
    setUnitTypes(unitTypes.filter(u => u.id !== id));
  };


  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    try{
      setLoading(true);
      // await postTable('projects', project);
      await postTable('subprojects/multiple', units);
    } catch(_){}
    setLoading(false);
    // TODO: replace with API call
    console.log("Units:", units);
  };

  useEffect(() => {
    const generatedUnits: Unit[] = [];
    unitTypes.forEach((type) => {
      for (let i = 0; i < type.count; i++) {
        generatedUnits.push({
          unit_number: generatedUnits.length + 1,
          floor: 0,
          block: type.block,
          area: type.area,
          roomCount: type.bedrooms,
          point: 0,
        });
      }
    });
    setUnits(generatedUnits);
  }, [unitTypes]);
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">ایجاد پروژه جدید</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات پروژه</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>نام پروژه</Label>
              <Input required type='text' name="name" value={project.name} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>آدرس</Label>
              <Input required type='text' name="address" value={project.address} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Calendar22 title="تاریخ شروع" date={project.startDate} setDate={(d) => handleProjectChange('startDate', d)} />
            </div>
            <div>
              <Calendar22 title="تاریخ پایان" date={project.endDate} setDate={(d) => handleProjectChange('endDate', d)} />
            </div>
            <div>
              <Label>تعداد بلوک‌های پروژه</Label>
              <Input required type='number' name="blockNumber" value={project.blockNumber} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>تعداد طبقات{project.blockNumber > 1 ? ' (مجموع طبقات همه بلوک‌ها)' : ''}</Label>
              <Input required type='number' name="floorCount" value={project.floorCount } onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>تعداد کل واحدهای پروژه</Label>
              <Input aria-required type='number' name="unitCount" value={project.unitCount} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>مساحت زمین (متر)</Label>
              <Input required type='number' name="landArea" value={project.landArea} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>زیربنا (متر)</Label>
              <Input required type='number' name="buildingArea" value={project.buildingArea} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>مشاعات (متر)</Label>
              <Input required type='number' name="sharedArea" value={project.sharedArea} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>توضیحات</Label>
              <Input type="text" name="options" value={project.options} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Unit Types */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>تیپ واحدها</CardTitle>
            <Button type="button" variant="outline" onClick={addUnitType}>
              <Plus className="h-4 w-4 mr-2" /> افزودن تیپ
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {unitTypes.map((u) => (
              <div key={u.id} className="grid grid-cols-6 gap-2 items-end border p-2 rounded">
                <div>
                  <Label>تعداد</Label>
                  <Input
                    type="number"
                    value={u.count}
                    onChange={(e) => updateUnitType(u.id, "count", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>متراژ</Label>
                  <Input
                    type="number"
                    value={u.area}
                    onChange={(e) => updateUnitType(u.id, "area", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>خواب</Label>
                  <Input
                    type="number"
                    value={u.bedrooms}
                    onChange={(e) => updateUnitType(u.id, "bedrooms", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>بلوک</Label>
                  <Input
                    value={u.block || ""}
                    onChange={(e) => updateUnitType(u.id, "block", e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="destructive" onClick={() => removeUnitType(u.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {project.unitCount > 0 && <div className="text-muted-foreground text-xl">
          {`این پروژه شامل ${project.unitCount} واحد است.`}
        </div>}
        <Button type="submit" className="w-full">
          ذخیره پروژه
        </Button>
      </form>
      {loading && <PageLoader />}
    </div>
  );
}
