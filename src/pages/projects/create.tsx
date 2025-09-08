import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Trash } from "lucide-react";
import { Calendar22 } from "@/components/calendars/calendar";
import { CityPicker } from "@/components/ui/city-picker";

interface UnitType {
  id: number;
  count: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  block?: string;
  options?: string;
}

interface Unit {
  land_lord: number;
  unit_number: number;
  floor: number;
  block?: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  point: number;
}

export default function ProjectCreate() {
  const [project, setProject] = useState<{
    name: string;
    city: string;
    address: string;
    postal_code: string;
    start_date: Date | undefined;
    end_date: Date | undefined;
    floors: number;
    units_count: number;
    land_area: number;
    building_area: number;
    description: string;
  }>({
    name: "",
    city: "",
    address: "",
    postal_code: "",
    start_date: undefined,
    end_date: undefined,
    floors: 0,
    units_count: 0,
    land_area: 0,
    building_area: 0,
    description: "",
  });

  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [nextId, setNextId] = useState(1);

  const handleProjectChange = (name: string, value: any) => {
    setProject({ ...project, [name]: value });
  };

  const addUnitType = () => {
    setUnitTypes([...unitTypes, { id: nextId, count: 0, area: 0, bedrooms: 0, bathrooms: 0 }]);
    setNextId(nextId + 1);
  };

  const updateUnitType = (id: number, field: keyof UnitType, value: string | number) => {
    setUnitTypes(unitTypes.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const removeUnitType = (id: number) => {
    setUnitTypes(unitTypes.filter(u => u.id !== id));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: replace with API call
    console.log("Project:", project);
    console.log("Units:", units);
    alert("Project created!");
  };

  useEffect(() => {
    const totalUnits = unitTypes.reduce((sum, u) => sum + u.count, 0);
    handleProjectChange("units_count", totalUnits);

    const generatedUnits: Unit[] = [];
    unitTypes.forEach((type) => {
      for (let i = 0; i < type.count; i++) {
        generatedUnits.push({
          land_lord: 0,
          unit_number: generatedUnits.length + 1,
          floor: 0,
          block: type.block,
          area: type.area,
          bedrooms: type.bedrooms,
          bathrooms: type.bathrooms,
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
              <Input type='text' name="name" value={project.name} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>شهر</Label>
              <CityPicker provinceId={8} onCityChange={(city) => handleProjectChange('city', city)} />
            </div>
            <div className="md:col-span-2">
              <Label>آدرس</Label>
              <Input type='text' name="address" value={project.address} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Calendar22 title="تاریخ شروع" date={project.start_date} setDate={(d) => handleProjectChange('start_date', d)} />
            </div>
            <div>
              <Calendar22 title="تاریخ پایان" date={project.end_date} setDate={(d) => handleProjectChange('end_date', d)} />
            </div>
            <div>
              <Label>تعداد طبقات</Label>
              <Input type='number' name="floors" value={project.floors} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>مساحت زمین (متر)</Label>
              <Input type='number' name="land_area" value={project.land_area} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>زیربنا (متر)</Label>
              <Input type='number' name="building_area" value={project.building_area} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <Label>کد پستی</Label>
              <Input type='text' name="postal_code" value={project.postal_code} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>توضیحات</Label>
              <Input type="text" name="description" value={project.description} onChange={(e) => handleProjectChange(e.target.name, e.target.value)} />
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
                  <Label>حمام</Label>
                  <Input
                    type="number"
                    value={u.bathrooms}
                    onChange={(e) => updateUnitType(u.id, "bathrooms", Number(e.target.value))}
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
        
        {project.units_count > 0 && <div className="text-muted-foreground text-xl">
          {`این پروژه شامل ${project.units_count} واحد است.`}
        </div>}
        <Button type="submit" className="w-full">
          ذخیره پروژه
        </Button>
      </form>
    </div>
  );
}
