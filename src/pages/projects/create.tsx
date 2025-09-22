import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Trash, Building, MapPin, Calendar, Users, Home, Square, FileText, Camera, CheckCircle, ArrowLeft, Sparkles, Upload, PaperclipIcon, FolderOpen } from "lucide-react";
import { Calendar22 } from "@/components/calendars/calendar";
import { postTable } from "@/general";
import { PageLoader } from "@/components/ui/loader";
import { ImageUpload } from "@/components/ui/image-upload";

interface UnitType {
  id: number;
  count: number;
  area: number;
  bedrooms: number;
  block?: string;
  options?: string;
}

interface DocumentFile {
  id: number;
  originalName: string;
  customName: string;
  category: string;
  size: number;
  type: string;
  uploadDate: string;
}

interface Unit {
  projectId?: number;
  unit_number?: number;
  floor?: number;
  block?: string | number;
  area?: number;
  roomCount?: number;
  point?: number;
  options?: string;
}

interface ProjectCreateProps {
  initialValues?: any;
  onSubmit?: (values: any) => void;
  isEdit?: boolean;
}

export default function ProjectCreate({ initialValues, onSubmit, isEdit = false }: ProjectCreateProps = {}) {
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
      sharedArea: number;
      options: string;
      image: string;
      // Additional documents and info
      documents: DocumentFile[];
      contractType: string;
      ownershipType: string;
      buildingPermit: string;
      notes: string;
  }>(() => {
    if (initialValues) {
      return {
        name: initialValues.name || "",
        address: initialValues.address || "",
        startDate: initialValues.startDate ? new Date(initialValues.startDate) : undefined,
        endDate: initialValues.endDate ? new Date(initialValues.endDate) : undefined,
        floorCount: initialValues.floorCount || 0,
        unitCount: initialValues.unitCount || 0,
        blockNumber: initialValues.blockNumber || 1,
        landArea: initialValues.landArea || 0,
        sharedArea: initialValues.sharedArea || 0,
        options: initialValues.options || "",
        image: initialValues.image || "",
        documents: initialValues.documents || [],
        contractType: initialValues.contractType || "",
        ownershipType: initialValues.ownershipType || "",
        buildingPermit: initialValues.buildingPermit || "",
        notes: initialValues.notes || "",
      };
    }
    return {
      name: "",
      address: "",
      startDate: undefined,
      endDate: undefined,
      floorCount : 0,
      unitCount: 0,
      blockNumber: 1,
      landArea: 0,
      sharedArea: 0,
      options: "",
      image: "",
      documents: [],
      contractType: "",
      ownershipType: "",
      buildingPermit: "",
      notes: "",
    };
  });

  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [nextId, setNextId] = useState(1);


  // Update project state when initialValues change (for editing)
  useEffect(() => {
    if (initialValues && isEdit) {
      setProject({
        name: initialValues.name || "",
        address: initialValues.address || "",
        startDate: initialValues.startDate ? new Date(initialValues.startDate) : undefined,
        endDate: initialValues.endDate ? new Date(initialValues.endDate) : undefined,
        floorCount: initialValues.floorCount || 0,
        unitCount: initialValues.unitCount || 0,
        blockNumber: initialValues.blockNumber || 1,
        landArea: initialValues.landArea || 0,
        sharedArea: initialValues.sharedArea || 0,
        options: initialValues.options || "",
        image: initialValues.image || "",
        documents: initialValues.documents || [],
        contractType: initialValues.contractType || "",
        ownershipType: initialValues.ownershipType || "",
        buildingPermit: initialValues.buildingPermit || "",
        notes: initialValues.notes || "",
      });
    }
  }, [initialValues, isEdit]);

  const handleProjectChange = (name: string, value: any) => {
    setProject({ ...project, [name]: value });
  };

  const addUnitType = () => {
<<<<<<< HEAD
    setUnitTypes([...unitTypes, { id: nextId, count: 0, area: 0, bedrooms: 0 }]);
=======
    const newUnitType = { id: nextId, count: 1, area: 50, bedrooms: 1, bathrooms: 1 };
    setUnitTypes([...unitTypes, newUnitType]);
>>>>>>> b3fa02e (WIP: save local changes before rebase)
    setNextId(nextId + 1);
  };

  const updateUnitType = (id: number, field: keyof UnitType, value: string | number) => {
    setUnitTypes(unitTypes.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const removeUnitType = (id: number) => {
    setUnitTypes(unitTypes.filter(u => u.id !== id));
  };

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDocuments: DocumentFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`فایل ${file.name} بیش از 10 مگابایت است`);
        continue;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert(`نوع فایل ${file.name} پشتیبانی نمی‌شود`);
        continue;
      }

      // Create document object with default values
      const documentFile: DocumentFile = {
        id: Date.now() + i,
        originalName: file.name,
        customName: file.name, // Keep original name
        category: 'عمومی', // Default category
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      };

      newDocuments.push(documentFile);
    }

    if (newDocuments.length > 0) {
      handleProjectChange('documents', [...project.documents, ...newDocuments]);
    }
    
    // Reset input
    event.target.value = '';
  };

  // Update document info
  const updateDocument = (id: number, field: keyof DocumentFile, value: string) => {
    const updatedDocuments = project.documents.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    );
    handleProjectChange('documents', updatedDocuments);
  };

  // Remove document
  const removeDocument = (id: number) => {
    const updatedDocuments = project.documents.filter(doc => doc.id !== id);
    handleProjectChange('documents', updatedDocuments);
  };


  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    try{
      setLoading(true);
      // await postTable('projects', project);
      await postTable('subprojects/multiple', units);
    } catch(_){}
=======
    setLoading(true);
    
    try {
      // Prepare data for API with correct field names and types
      const projectData = {
        name: project.name,
        address: project.address,
        startDate: project.startDate ? project.startDate.toISOString() : null,
        endDate: project.endDate ? project.endDate.toISOString() : null,
        floorCount: project.floorCount,
        unitCount: project.unitCount,
        blockNumber: project.blockNumber,
        landArea: Number(project.landArea) || 0,
        sharedArea: Number(project.sharedArea) || 0,
        buildingArea: Number(project.landArea) + Number(project.sharedArea), // Calculate buildingArea
        options: project.options,
        // Remove fields that API doesn't expect
        // image: project.image, // Remove - API doesn't expect this
        // documents: project.documents, // Handle separately if needed
        // contractType: project.contractType, // Handle separately if needed  
        // ownershipType: project.ownershipType, // Handle separately if needed
        // buildingPermit: project.buildingPermit, // Remove - API doesn't expect this
        // notes: project.notes, // Remove - API doesn't expect this
      };
      
      console.log('Submitting project data:', projectData);
      
      if (isEdit && onSubmit) {
        await onSubmit(projectData);
      } else {
        const result = await postTable('projects', projectData);
        if (result) {
          // Reset form on successful creation
          setProject({
            name: "",
            address: "",
            startDate: undefined,
            endDate: undefined,
            floorCount : 0,
            unitCount: 0,
            blockNumber: 1,
            landArea: 0,
            sharedArea: 0,
            options: "",
            image: "",
            documents: [],
            contractType: "",
            ownershipType: "",
            buildingPermit: "",
            notes: "",
          });
          
          // Call onSubmit callback for new projects too
          if (onSubmit) {
            await onSubmit(projectData);
          }
        }
      }
    } catch(error) {
      console.error('Error submitting project:', error);
    }
    
>>>>>>> b3fa02e (WIP: save local changes before rebase)
    setLoading(false);
    // TODO: replace with API call
    console.log("Units:", units);
  };

  useEffect(() => {
    const generatedUnits: Unit[] = [];
    unitTypes.forEach((type) => {
      for (let i = 0; i < type.count; i++) {
        generatedUnits.push({
          area: type.area,
          floor: 0,
          point: 0,
          block: type.block || 1,
          roomCount: type.bedrooms,
          options: '',        
          projectId: 1,
        });
      }
    });
    setUnits(generatedUnits);
  }, [unitTypes]);
  return (
<<<<<<< HEAD
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
        {Array.from({length: project.blockNumber}).map((_, b) => <Card className="flex flex-row flex-wrap p-4">
          <CardHeader>
            <CardTitle style={{width: 'max-content'}}>{`بلوک ${b}ام`}</CardTitle>
          </CardHeader>
          {Array.from({length: project.floorCount}).map((_, i) => <Card className="flex flex-col width-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{`تیپ واحدهای طبقه ${i}ام`}</CardTitle>
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
          </Card>)}
        </Card>)}
=======
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/60 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" />
              بازگشت
            </Button>
            <div className="h-6 w-px bg-gradient-to-b from-blue-300 to-purple-300"></div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20"></div>
                  <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {isEdit ? 'ویرایش پروژه' : 'ایجاد پروژه جدید'}
                  </h1>
                  
                </div>
              </div>
            </div>
          </div>


          {/* Static Progress Steps */}
          {!isEdit && (
            <div className="flex items-center justify-center mb-10">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center gap-8">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-r from-blue-500 to-blue-600">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-blue-600">
                        مرحله ۱
                      </span>
                      <p className="text-xs text-slate-600">اطلاعات پایه پروژه</p>
                    </div>
                  </div>
                  
                  {/* Connector 1-2 */}
                  <div className="w-16 h-px bg-gradient-to-r from-blue-300 to-purple-300"></div>
                  
                  {/* Step 2 */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-r from-purple-400 to-purple-500">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-purple-600">
                        مرحله ۲
                      </span>
                      <p className="text-xs text-slate-600">واحدهای مسکونی</p>
                    </div>
                  </div>
                  
                  {/* Connector 2-3 */}
                  <div className="w-16 h-px bg-gradient-to-r from-purple-300 to-orange-300"></div>
                  
                  {/* Step 3 */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-r from-orange-500 to-red-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-orange-600">
                        مرحله ۳
                      </span>
                      <p className="text-xs text-slate-600">اطلاعات تکمیلی و اسناد</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Basic Info */}
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
                        <Calendar22 title="" date={project.startDate} setDate={(d) => handleProjectChange('startDate', d)} />
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
                        <Calendar22 title="" date={project.endDate} setDate={(d) => handleProjectChange('endDate', d)} />
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
                      value={project.image}
                      onChange={(value) => handleProjectChange('image', value)}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    تصویر زیبایی از پروژه خود آپلود کنید
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Specifications */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
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
                  {project.blockNumber > 1 && (
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

          {/* Additional Information */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50/50 to-red-50/50 border-b border-orange-200/30 pb-6">
              <CardTitle className="flex items-center gap-4 text-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur-sm opacity-30"></div>
                  <div className="relative p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
                    اطلاعات تکمیلی و اسناد
                  </span>
                  <p className="text-sm text-slate-500 font-normal mt-1">
                    اسناد، مجوزها و اطلاعات اضافی پروژه
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Document Upload Section */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
                  <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-4">
                    <div className="p-1 bg-orange-100 rounded-md">
                      <Upload className="w-4 h-4 text-orange-600" />
                    </div>
                    آپلود اسناد پروژه
                  </Label>
                  <div 
                    className="border-2 border-dashed border-orange-200 rounded-lg p-8 text-center hover:border-orange-300 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-orange-400', 'bg-orange-50');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50');
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        // Create a synthetic event
                        const syntheticEvent = {
                          target: { files, value: '' }
                        } as React.ChangeEvent<HTMLInputElement>;
                        handleFileUpload(syntheticEvent);
                      }
                    }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-full">
                        <PaperclipIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-slate-700 font-medium">اسناد خود را اینجا بکشید یا کلیک کنید</p>
                        <p className="text-slate-500 text-sm mt-1">PDF, DOC, JPG, PNG - حداکثر 10 مگابایت</p>
                      </div>
                      <Button type="button" variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50">
                        <FolderOpen className="w-4 h-4" />
                        انتخاب فایل
                      </Button>
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {project.documents && project.documents.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 mb-3">فایل‌های آپلود شده:</p>
                      <div className="space-y-3">
                        {project.documents.map((doc) => (
                          <div key={doc.id} className="p-4 bg-white rounded-lg border border-orange-100 shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <FileText className="w-5 h-5 text-orange-600" />
                              </div>
                              
                              <div className="flex-1 space-y-3">
                                {/* File info header */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-slate-700">{doc.originalName}</p>
                                    <p className="text-xs text-slate-500">
                                      {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadDate).toLocaleDateString('fa-IR')}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDocument(doc.id)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Category select */}
                                <div>
                                  <Label className="text-xs text-slate-600 mb-1 block">دسته‌بندی:</Label>
                                  <select
                                    value={doc.category}
                                    onChange={(e) => updateDocument(doc.id, 'category', e.target.value)}
                                    className="w-full h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-400 focus:ring-blue-400/20"
                                  >
                                    <option value="عمومی">عمومی</option>
                                    <option value="قرارداد">قرارداد</option>
                                    <option value="مجوز">مجوز</option>
                                    <option value="نقشه">نقشه</option>
                                    <option value="تصاویر">تصاویر</option>
                                    <option value="مالی">مالی</option>
                                    <option value="فنی">فنی</option>
                                    <option value="حقوقی">حقوقی</option>
                                    <option value="سایر">سایر</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contract and Legal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                      <div className="p-1 bg-blue-100 rounded-md">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      نوع قرارداد
                    </Label>
                    <select
                      value={project.contractType}
                      onChange={(e) => handleProjectChange('contractType', e.target.value)}
                      className="w-full h-12 px-4 bg-white/50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                    >
                      <option value="">انتخاب کنید...</option>
                      <option value="مشارکت_در_ساخت">مشارکت در ساخت</option>
                      <option value="پیمانکاری">پیمانکاری</option>
                      <option value="سرمایه_گذاری">سرمایه گذاری</option>
                      <option value="خرید_زمین">خرید زمین</option>
                      <option value="سایر">سایر</option>
                    </select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                      <div className="p-1 bg-green-100 rounded-md">
                        <Home className="w-4 h-4 text-green-600" />
                      </div>
                      نوع مالکیت
                    </Label>
                    <select
                      value={project.ownershipType}
                      onChange={(e) => handleProjectChange('ownershipType', e.target.value)}
                      className="w-full h-12 px-4 bg-white/50 border border-slate-200 rounded-lg focus:bg-white focus:border-green-400 focus:ring-green-400/20 transition-all duration-200"
                    >
                      <option value="">انتخاب کنید...</option>
                      <option value="تک_برگ">تک برگ</option>
                      <option value="شش_دانگ">شش دانگ</option>
                      <option value="مشاع">مشاع</option>
                      <option value="اجاره_ای">اجاره‌ای</option>
                      <option value="وقفی">وقفی</option>
                    </select>
                  </div>
                </div>

                {/* Building Permit */}
                <div>
                  <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                    <div className="p-1 bg-purple-100 rounded-md">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    شماره پروانه ساختمان
                  </Label>
                  <Input
                    value={project.buildingPermit}
                    onChange={(e) => handleProjectChange('buildingPermit', e.target.value)}
                    placeholder="مثال: 1402/12345"
                    className="h-12 bg-white/50 border-slate-200 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                    <div className="p-1 bg-indigo-100 rounded-md">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    یادداشت‌های اضافی
                  </Label>
                  <textarea
                    value={project.notes}
                    onChange={(e) => handleProjectChange('notes', e.target.value)}
                    placeholder="توضیحات اضافی، نکات مهم، یادداشت‌ها..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

           {/* Unit Types */}
           <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
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
          
          {/* Project Summary */}
          {(project.unitCount > 0 || unitTypes.length > 0) && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">خلاصه پروژه</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">کل واحدها</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{project.unitCount || 0}</p>
                  </div>
                  
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">تیپ واحدها</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{unitTypes.length}</p>
                  </div>
                </div>
                
                {unitTypes.length > 0 && (
                  <div className="mt-4 p-4 bg-white/40 rounded-lg">
                    <p className="text-sm text-green-800 mb-2 font-medium">تیپ‌های تعریف شده:</p>
                    <div className="flex flex-wrap gap-2">
                      {unitTypes.map((type, index) => (
                        <span key={type.id} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          تیپ {index + 1}: {type.count} واحد × {type.area} متر
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-14 text-lg gap-2"
              disabled={loading}
            >
              <ArrowLeft className="w-5 h-5" />
              ذخیره پیش‌نویس
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1 h-14 text-lg gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {isEdit ? 'بروزرسانی پروژه' : 'ایجاد پروژه'}
                </>
              )}
            </Button>
          </div>
        </form>
>>>>>>> b3fa02e (WIP: save local changes before rebase)
        
        {loading && <PageLoader />}
      </div>
    </div>
  );
}
