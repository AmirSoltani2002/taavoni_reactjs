import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Calendar, Camera, Plus, Trash, FileText, CheckCircle } from "lucide-react";
import { Calendar22 } from "@/components/calendars/calendar";
import { ImageUpload } from "@/components/ui/image-upload";
import { useRef, useState } from "react";
import { uploadProjectDoc } from "@/general";
import { toast } from "sonner";
import type { Project } from "../columns";

interface Step1BasicInfoProps {
  project: Project;
  handleProjectChange: (name: string, value: any) => void;
  projectId?: number | string; // For immediate upload in edit mode
  projectImages?: string[];
  setProjectImages?: (images: string[]) => void;
  projectDocs?: Array<{ title: string; file: File | null; id?: number; uploaded?: boolean }>;
  setProjectDocs?: (docs: Array<{ title: string; file: File | null; id?: number; uploaded?: boolean }>) => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ 
  project, 
  handleProjectChange,
  projectId,
  projectImages = [],
  setProjectImages,
  projectDocs = [],
  setProjectDocs
}) => {
  const docFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});
  const [uploadingDocs, setUploadingDocs] = useState<{ [key: number]: boolean }>({});

  // Convert base64 string to File object
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleImageAdd = async (imageData: string) => {
    if (setProjectImages) {
      const imageIndex = projectImages.length;
      setProjectImages([...projectImages, imageData]);
      
      // Upload immediately if projectId exists (edit mode)
      if (projectId) {
        setUploadingImages(prev => ({ ...prev, [imageIndex]: true }));
        try {
          const imageFile = base64ToFile(imageData, `project-image-${imageIndex + 1}.jpg`);
          const result = await uploadProjectDoc(
            imageFile,
            typeof projectId === 'string' ? parseInt(projectId) : projectId,
            `!!image${imageIndex}`,
            true
          );
          if (result && result.document && setProjectImages) {
            // Update the image with the uploaded URL instead of base64
            const updated = [...projectImages];
            updated[imageIndex] = result.document;
            setProjectImages(updated);
            toast.success(`تصویر ${imageIndex + 1} با موفقیت آپلود شد`);
          } else {
            // Upload failed, remove the image from state
            if (setProjectImages) {
              const filtered = projectImages.filter((_, i) => i !== imageIndex);
              setProjectImages(filtered);
            }
            toast.error(`خطا در آپلود تصویر ${imageIndex + 1}`);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          // Upload failed, remove the image from state
          if (setProjectImages) {
            const filtered = projectImages.filter((_, i) => i !== imageIndex);
            setProjectImages(filtered);
          }
          toast.error(`خطا در آپلود تصویر ${imageIndex + 1}`);
        } finally {
          setUploadingImages(prev => ({ ...prev, [imageIndex]: false }));
        }
      }
    }
  };

  const handleImageRemove = (index: number) => {
    if (setProjectImages) {
      setProjectImages(projectImages.filter((_, i) => i !== index));
    }
  };

  const handleDocAdd = () => {
    if (setProjectDocs) {
      setProjectDocs([...projectDocs, { title: '', file: null }]);
    }
  };

  const handleDocRemove = (index: number) => {
    if (setProjectDocs) {
      setProjectDocs(projectDocs.filter((_, i) => i !== index));
    }
  };

  const handleDocTitleChange = async (index: number, title: string) => {
    if (setProjectDocs) {
      const updated = [...projectDocs];
      // Validate: don't allow ! at the start for non-images
      if (title.startsWith('!')) {
        return; // Prevent updating if starts with !
      }
      updated[index] = { ...updated[index], title };
      setProjectDocs(updated);
      
      // Upload immediately if projectId exists, file is selected, and title is provided (edit mode)
      if (projectId && updated[index].file && title && !updated[index].uploaded) {
        setUploadingDocs(prev => ({ ...prev, [index]: true }));
        try {
          const result = await uploadProjectDoc(
            updated[index].file!,
            typeof projectId === 'string' ? parseInt(projectId) : projectId,
            title,
            true
          );
          if (result) {
            updated[index] = { ...updated[index], id: result.id, uploaded: true };
            setProjectDocs(updated);
            toast.success('سند با موفقیت آپلود شد');
          } else {
            // Upload failed, remove the doc from state
            const failed = updated.filter((_, i) => i !== index);
            setProjectDocs(failed);
            toast.error('خطا در آپلود سند');
          }
        } catch (error) {
          console.error('Error uploading document:', error);
          // Upload failed, remove the doc from state
          const failed = updated.filter((_, i) => i !== index);
          setProjectDocs(failed);
          toast.error('خطا در آپلود سند');
        } finally {
          setUploadingDocs(prev => ({ ...prev, [index]: false }));
        }
      }
    }
  };

  const handleDocFileChange = async (index: number, file: File | null) => {
    if (setProjectDocs) {
      const updated = [...projectDocs];
      updated[index] = { ...updated[index], file };
      setProjectDocs(updated);
      
      // Upload immediately if projectId exists, file is selected, and title is provided (edit mode)
      if (projectId && file && updated[index].title && !updated[index].title.startsWith('!')) {
        setUploadingDocs(prev => ({ ...prev, [index]: true }));
        try {
          const result = await uploadProjectDoc(
            file,
            typeof projectId === 'string' ? parseInt(projectId) : projectId,
            updated[index].title,
            true
          );
          if (result) {
            updated[index] = { ...updated[index], id: result.id, uploaded: true };
            setProjectDocs(updated);
            toast.success('سند با موفقیت آپلود شد');
          } else {
            // Upload failed, remove the doc from state
            const failed = updated.filter((_, i) => i !== index);
            setProjectDocs(failed);
            toast.error('خطا در آپلود سند');
          }
        } catch (error) {
          console.error('Error uploading document:', error);
          // Upload failed, remove the doc from state
          const failed = updated.filter((_, i) => i !== index);
          setProjectDocs(failed);
          toast.error('خطا در آپلود سند');
        } finally {
          setUploadingDocs(prev => ({ ...prev, [index]: false }));
        }
      }
    }
  };

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

          {/* Project Images */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
              <div className="p-1 rounded-md">
                <Camera className="w-4 h-4 text-pink-600" />
              </div>
              تصاویر پروژه
            </Label>
            <div className="space-y-3">
              {projectImages.map((image, index) => (
                <div key={index} className="bg-purple-50 rounded-xl p-3 border-2 border-purple-200 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      تصویر {index + 1} پروژه
                      {uploadingImages[index] && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          در حال آپلود...
                        </span>
                      )}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleImageRemove(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      disabled={uploadingImages[index]}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <img
                      src={image}
                      alt={`تصویر ${index + 1} پروژه`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {uploadingImages[index] && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors">
                <ImageUpload 
                  value=""
                  onChange={handleImageAdd}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              تصاویر زیبایی از پروژه خود آپلود کنید
            </p>
          </div>
        </div>

        {/* Project Documents Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <Label className="flex items-center gap-2 text-slate-700 font-semibold">
              <div className="p-1 rounded-md">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              اسناد پروژه
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDocAdd}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              افزودن سند
            </Button>
          </div>
          
          <div className="space-y-4">
            {projectDocs.map((doc, index) => (
              <Card key={index} className="bg-slate-50 border-2 border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label className="text-sm text-slate-700 font-medium mb-1 block">
                          عنوان سند
                        </Label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={doc.title}
                            onChange={(e) => handleDocTitleChange(index, e.target.value)}
                            placeholder="عنوان سند را وارد کنید..."
                            className="bg-white"
                            disabled={uploadingDocs[index]}
                          />
                          {uploadingDocs[index] && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                          {doc.uploaded && !uploadingDocs[index] && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        {doc.title.startsWith('!') && (
                          <p className="text-xs text-red-600 mt-1">
                            عنوان سند نمی‌تواند با علامت ! شروع شود
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-slate-700 font-medium mb-1 block">
                          فایل سند
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            ref={(el) => {
                              docFileInputRefs.current[index] = el;
                            }}
                            type="file"
                            accept="*/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleDocFileChange(index, file);
                            }}
                            className="bg-white"
                            disabled={uploadingDocs[index]}
                          />
                          {doc.file && (
                            <span className="text-sm text-slate-600 flex-1 flex items-center gap-2">
                              {doc.file.name}
                              {uploadingDocs[index] && (
                                <span className="text-xs text-blue-600 flex items-center gap-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                  در حال آپلود...
                                </span>
                              )}
                              {doc.uploaded && !uploadingDocs[index] && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  آپلود شد
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDocRemove(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 mt-6"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {projectDocs.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className="text-sm">هیچ سندی اضافه نشده است</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
