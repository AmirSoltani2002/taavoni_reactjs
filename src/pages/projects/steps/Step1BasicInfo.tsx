import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Calendar, Camera, Plus, Trash, FileText, Download } from "lucide-react";
import { Calendar22 } from "@/components/calendars/calendar";
import { useRef, useState, useEffect } from "react";
import { uploadProjectDoc, downloadDocument, deleteTableRow, getImageBlobUrl } from "@/general";
import { toast } from "sonner";
import type { Project } from "../columns";
import MapPicker from "@/components/app/MapPicker";

interface Step1BasicInfoProps {
  project: Project;
  handleProjectChange: (name: string, value: any) => void;
  handleLocationChange?: (lat: number, lng: number) => void;
  projectId?: number | string; // For immediate upload in edit mode
  projectImages?: Array<string | {id: number, url?: string}>;
  setProjectImages?: (images: Array<string | {id: number, url?: string}>) => void;
  projectDocs?: Array<{ title: string; file: File | null; id?: number; uploaded?: boolean; filename?: string }>;
  setProjectDocs?: (docs: Array<{ title: string; file: File | null; id?: number; uploaded?: boolean; filename?: string }>) => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ 
  project, 
  handleProjectChange,
  handleLocationChange: parentHandleLocationChange,
  projectId,
  projectImages = [],
  setProjectImages,
  projectDocs = [],
  setProjectDocs
}) => {
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
  
  // State for new document being added
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

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
    // Validate file size from base64
    // Base64 encoding increases size by ~33%, so we check the decoded size
    const base64Data = imageData.split(',')[1] || imageData;
    const fileSizeInBytes = (base64Data.length * 3) / 4;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    
    if (fileSizeInMB > 5) {
      toast.error('حجم فایل نباید بیشتر از 5 مگابایت باشد');
      return;
    }

    if (setProjectImages) {
      const imageIndex = projectImages.length;
      setProjectImages([...projectImages, imageData]);
      // Set base64 image URL immediately for display
      setImageUrls(prev => ({ ...prev, [imageIndex]: imageData }));
      
      // Upload immediately if projectId exists (edit mode)
      if (projectId) {
        setUploadingImages(prev => ({ ...prev, [imageIndex]: true }));
        try {
          const imageFile = base64ToFile(imageData, `project-image-${imageIndex + 1}.jpg`);
          
          // Validate file size
          if (imageFile.size > 5 * 1024 * 1024) {
            toast.error('حجم فایل نباید بیشتر از 5 مگابایت باشد');
            if (setProjectImages) {
              const filtered = projectImages.filter((_, i) => i !== imageIndex);
              setProjectImages(filtered);
            }
            return;
          }
          
          const result = await uploadProjectDoc(
            imageFile,
            typeof projectId === 'string' ? parseInt(projectId) : projectId,
            `!!image${imageIndex}`,
            true
          );
          if (result && result.id && setProjectImages) {
            // Update the image with the uploaded id and url instead of base64
            const updated = [...projectImages];
            updated[imageIndex] = { id: result.id, url: result.document };
            setProjectImages(updated);
            // Fetch the image file and create a blob URL
            try {
              const blobUrl = await getImageBlobUrl(result.id, 'project-docs', false);
              if (blobUrl) {
                setImageUrls(prev => ({ ...prev, [imageIndex]: blobUrl }));
              }
            } catch (error) {
              console.error('Error fetching image:', error);
            }
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

  const handleImageRemove = async (index: number) => {
    const image = projectImages[index];
    if (!image) return;

    // Check if image has an ID (uploaded to database)
    const imageId = typeof image === 'object' && image.id ? image.id : null;

    if (!imageId) {
      // If no ID, just remove from local state (not uploaded yet)
      if (setProjectImages) {
        setProjectImages(projectImages.filter((_, i) => i !== index));
      }
      // Clean up blob URL if it exists
      const url = imageUrls[index];
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      const newUrls = { ...imageUrls };
      delete newUrls[index];
      setImageUrls(newUrls);
      return;
    }

    // Delete from database
    try {
      await deleteTableRow('project-docs', imageId, () => {
        // Remove from local state after successful deletion
        if (setProjectImages) {
          setProjectImages(projectImages.filter((_, i) => i !== index));
        }
        // Clean up blob URL if it exists
        const url = imageUrls[index];
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
        const newUrls = { ...imageUrls };
        delete newUrls[index];
        setImageUrls(newUrls);
      }, true);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('خطا در حذف تصویر');
    }
  };

  // Load image URLs for images with IDs
  useEffect(() => {
    const loadImageUrls = async () => {
      const newUrls: { [key: number]: string } = {};
      
      for (let i = 0; i < projectImages.length; i++) {
        const image = projectImages[i];
        if (typeof image === 'object' && image.id) {
          try {
            // Fetch the image file and create a blob URL
            const blobUrl = await getImageBlobUrl(image.id, 'project-docs', false);
            if (blobUrl) {
              newUrls[i] = blobUrl;
            }
          } catch (error) {
            console.error(`Error loading image ${i}:`, error);
          }
        } else if (typeof image === 'string') {
          // For base64 strings or old paths, use them directly
          newUrls[i] = image;
        }
      }
      setImageUrls(prevUrls => {
        // Clean up old blob URLs before setting new ones
        Object.values(prevUrls).forEach(url => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        return newUrls;
      });
    };
    
    loadImageUrls();
    
    // Cleanup function to revoke blob URLs on unmount
    return () => {
      setImageUrls(prevUrls => {
        Object.values(prevUrls).forEach(url => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        return {};
      });
    };
  }, [projectImages]);
  useEffect(() => {
    console.log("project", project)
  }, [project])

  const handleDocRemove = async (index: number) => {
    const doc = projectDocs[index];
    if (!doc || !doc.id) {
      // If no ID, just remove from local state (not uploaded yet)
      if (setProjectDocs) {
        setProjectDocs(projectDocs.filter((_, i) => i !== index));
      }
      return;
    }

    // Delete from database
    try {
      await deleteTableRow('project-docs', doc.id, () => {
        // Remove from local state after successful deletion
        if (setProjectDocs) {
          setProjectDocs(projectDocs.filter((_, i) => i !== index));
        }
      }, true);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('خطا در حذف سند');
    }
  };

  const handleNewDocUpload = async () => {
    if (!projectId || !newDocTitle || !newDocFile) {
      toast.error('لطفا عنوان و فایل سند را وارد کنید');
      return;
    }
    
    if (newDocTitle.startsWith('!')) {
      toast.error('عنوان سند نمی‌تواند با علامت ! شروع شود');
      return;
    }

    setUploadingDoc(true);
    try {
      const result = await uploadProjectDoc(
        newDocFile,
        typeof projectId === 'string' ? parseInt(projectId) : projectId,
        newDocTitle,
        true
      );
      if (result && setProjectDocs) {
        // Add the uploaded document to the list
        setProjectDocs([...projectDocs, {
          title: newDocTitle,
          file: null,
          id: result.id,
          uploaded: true,
          filename: newDocFile.name
        }]);
        // Reset form
        setNewDocTitle('');
        setNewDocFile(null);
        if (docFileInputRef.current) {
          docFileInputRef.current.value = '';
        }
        toast.success('سند با موفقیت آپلود شد');
      } else {
        toast.error('خطا در آپلود سند');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('خطا در آپلود سند');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Handle location change from MapPicker
  const handleLocationChange = (lat: number, lng: number) => {
    console.log("handleLocationChange", {lat, lng})
    // Use parent handler if provided (updates both at once), otherwise fall back to individual updates
    if (parentHandleLocationChange) {
      parentHandleLocationChange(lat, lng);
    } else {
      // Fallback: update both individually
      handleProjectChange('latitude', lat);
      handleProjectChange('longitude', lng);
    }
  };

  // Get map position from project coordinates, default to Tehran if not set
  const getMapPosition = (): [number, number] => {
    console.log({lat: project.latitude, lng: project.longitude})
    // Check if both coordinates are valid numbers (including 0, which is a valid coordinate)
    if (project.latitude && project.longitude && 
        Number.isFinite(project.latitude) && Number.isFinite(project.longitude)) {
      return [project.latitude, project.longitude];
    }
    // Default to Tehran coordinates
    return [35.6892, 51.3890];
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
          <div className="lg:col-span-3 space-y-6">
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

            <div>
              <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <div className="p-1 rounded-md">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                موقعیت جغرافیایی پروژه
              </Label>
              <div className="bg-white/50 border border-slate-200 rounded-md overflow-hidden">
                <MapPicker
                  onLocationChange={handleLocationChange}
                  position={getMapPosition()}
                  zoom={13}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                روی نقشه کلیک کنید یا نشانگر را بکشید تا موقعیت پروژه را مشخص کنید
              </p>
              {(project.latitude && project.longitude) && (
                <p className="text-xs text-slate-600 mt-1">
                  عرض جغرافیایی: {project.latitude.toFixed(6)} | طول جغرافیایی: {project.longitude.toFixed(6)}
                </p>
              )}
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
          <div className="lg:col-span-3 space-y-6">
            <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
              <div className="p-1 rounded-md">
                <Camera className="w-4 h-4 text-pink-600" />
              </div>
              تصاویر پروژه
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projectImages.map((image, index) => {
                const imageId = typeof image === 'object' && image.id ? image.id : null;
                return (
                <div key={index} className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-video bg-slate-100">
                    {imageUrls[index] ? (
                      <img
                        src={imageUrls[index]}
                        alt={`تصویر ${index + 1} پروژه`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                        <Camera className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    
                    {/* Overlay with download and delete buttons - appears on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {imageId && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadDocument(imageId, 'project-docs', `project-image-${index + 1}`, true)}
                          className="h-10 w-10 p-0 text-white hover:bg-blue-500/80 bg-blue-500/60 backdrop-blur-sm"
                          disabled={uploadingImages[index]}
                          title="دانلود تصویر"
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImageRemove(index)}
                        className="h-10 w-10 p-0 text-white hover:bg-red-500/80 bg-red-500/60 backdrop-blur-sm"
                        disabled={uploadingImages[index]}
                        title="حذف تصویر"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Uploading overlay */}
                    {uploadingImages[index] && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          <span className="text-white text-xs font-medium">در حال آپلود...</span>
                        </div>
                      </div>
                    )}

                    {/* Image number badge */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
                      {index + 1}
                    </div>
                  </div>
                </div>
                );
              })}
              
              {/* Add new image button */}
              <div 
                className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl overflow-hidden border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      toast.error('لطفا فقط فایل تصویری انتخاب کنید');
                      return;
                    }

                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('حجم فایل نباید بیشتر از 5 مگابایت باشد');
                      return;
                    }

                    // Convert to base64
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const result = event.target?.result as string;
                      if (result) {
                        handleImageAdd(result);
                      }
                    };
                    reader.readAsDataURL(file);
                  };
                  input.click();
                }}
              >
                <div className="aspect-video flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Camera className="w-8 h-8 text-purple-500 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-purple-700 group-hover:text-purple-800 transition-colors mb-1">
                    افزودن تصویر
                  </p>
                  <p className="text-xs text-purple-500 text-center">
                    حداکثر 5MB
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              تصاویر زیبایی از پروژه خود آپلود کنید
            </p>
          </div>
        </div>

        {/* Project Documents Section */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <Label className="flex items-center gap-2 text-slate-700 font-semibold mb-4">
            <div className="p-1 rounded-md">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            اسناد پروژه
          </Label>
          
          {/* Existing Documents */}
          <div className="space-y-3 mb-6">
            {projectDocs.filter(doc => doc.uploaded).map((doc, index) => {
              const actualIndex = projectDocs.findIndex(d => d.id === doc.id && d.uploaded);
              return (
                <Card key={doc.id || index} className="bg-slate-50 border-2 border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="font-medium text-slate-900">{doc.title}</p>
                            <p className="text-sm text-slate-500">{doc.filename || 'فایل'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.id && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadDocument(doc.id!, 'project-docs', doc.title || 'document', true)}
                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                            title="دانلود سند"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDocRemove(actualIndex)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          title="حذف سند"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {projectDocs.filter(doc => doc.uploaded).length === 0 && (
              <div className="text-center py-6 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <p className="text-sm">هیچ سندی اضافه نشده است</p>
              </div>
            )}
          </div>

          {/* Add New Document Form */}
          {projectId && (
            <Card className="bg-blue-50/50 border-2 border-dashed border-blue-200">
              <CardContent className="p-4">
                <Label className="text-sm text-slate-700 font-medium mb-3 block">
                  افزودن سند جدید
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="عنوان سند را وارد کنید..."
                      className="bg-white"
                      disabled={uploadingDoc}
                    />
                  </div>
                  <div>
                    <Input
                      ref={docFileInputRef}
                      type="file"
                      accept="*/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewDocFile(file);
                      }}
                      className="bg-white"
                      disabled={uploadingDoc}
                    />
                    {newDocFile && (
                      <p className="text-xs text-slate-600 mt-1">{newDocFile.name}</p>
                    )}
                  </div>
                  <div>
                    <Button
                      type="button"
                      onClick={handleNewDocUpload}
                      disabled={!newDocTitle || !newDocFile || uploadingDoc}
                      className="w-full"
                    >
                      {uploadingDoc ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          در حال آپلود...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          آپلود سند
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
