import { columns, type Project } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable } from "@/general"
import { useEffect, useState } from "react"
import ProjectCreate from "./create"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Calendar, MapPin, Users, Home, LayoutGrid, Table, Plus, TrendingUp, Edit, Trash2 } from "lucide-react"
import { ImageModal } from "@/components/ui/image-modal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { deleteTableRow, updateTableRow } from "@/general"
import { ImageStorage } from "@/lib/imageStorage"

export default function ProjectsList() {
    const [data, setData] = useState<Project[]>([])
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
    const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [deletingProject, setDeletingProject] = useState<Project | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        getTable('projects/all', (data) => {
            console.log('Projects data received:', data);
            
            // Enhance projects with locally stored images
            const enhancedData = data.map((project: any) => {
                const localImage = ImageStorage.getProjectImage(project.id);
                return {
                    ...project,
                    image: localImage || project.image || '' // Use local image if available
                };
            });
            
            // Debug: Check image field in each project
            enhancedData.forEach((project: any, index: number) => {
                console.log(`Project ${index + 1} (${project.name}):`, {
                    hasImage: !!project.image,
                    imageType: typeof project.image,
                    imageLength: project.image?.length || 0,
                    imagePrefix: project.image?.substring(0, 50) || 'No image',
                    source: ImageStorage.getProjectImage(project.id) ? 'localStorage' : 'API'
                });
            });
            
            setData(enhancedData);
        });
    }, [])

    const refreshData = () => {
        getTable('projects/all', (data) => {
            // Enhance projects with locally stored images
            const enhancedData = data.map((project: any) => {
                const localImage = ImageStorage.getProjectImage(project.id);
                return {
                    ...project,
                    image: localImage || project.image || ''
                };
            });
            setData(enhancedData);
        });
    }

    const handleDelete = async (project: Project) => {
        try {
            await deleteTableRow('projects', project.id);
            
            // Also remove locally stored image
            ImageStorage.removeProjectImage(project.id);
            console.log('Locally stored image removed for project:', project.id);
            
            refreshData();
            setDeletingProject(null);
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    }

    const handleEdit = (project: Project) => {
        console.log('Opening edit modal for project:', project);
        setEditingProject(project);
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString('fa-IR');
        } catch {
            return dateString;
        }
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto py-8 px-4">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                                <Building className="w-10 h-10 text-blue-600" />
                                مدیریت پروژه‌ها
                            </h1>
                            <p className="text-slate-600 text-lg">مشاهده و مدیریت تمام پروژه‌های موجود در سیستم</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border">
                                <Button 
                                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                    onClick={() => setViewMode('cards')}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    کارت‌ها
                                </Button>
                                <Button 
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    onClick={() => setViewMode('table')}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Table className="w-4 h-4" />
                                    جدول
                                </Button>
                            </div>
                            
                            <Button 
                                className="gap-2 shadow-md"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Plus className="w-4 h-4" />
                                پروژه جدید
                            </Button>
                        </div>
                    </div>
                
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-700 mb-1">کل پروژه‌ها</p>
                                        <p className="text-3xl font-bold text-blue-900">{data.length}</p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            <TrendingUp className="w-3 h-3 inline ml-1" />
                                            فعال در سیستم
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-500 rounded-xl">
                                        <Building className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-700 mb-1">کل واحدها</p>
                                        <p className="text-3xl font-bold text-emerald-900">{data.reduce((sum, project) => sum + (project.unitCount || 0), 0).toLocaleString()}</p>
                                        <p className="text-xs text-emerald-600 mt-1">
                                            <TrendingUp className="w-3 h-3 inline ml-1" />
                                            واحد مسکونی
                                        </p>
                                    </div>
                                    <div className="p-3 bg-emerald-500 rounded-xl">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        
                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-700 mb-1">کل بلوک‌ها</p>
                                        <p className="text-3xl font-bold text-purple-900">{data.reduce((sum, project) => sum + (project.blockNumber || 0), 0)}</p>
                                        <p className="text-xs text-purple-600 mt-1">
                                            <Home className="w-3 h-3 inline ml-1" />
                                            بلوک ساختمانی
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-500 rounded-xl">
                                        <Home className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {viewMode === 'table' ? (
                        <div className="bg-white rounded-xl shadow-sm border">
                            <DataTable 
                                columns={columns} 
                                data={data} 
                                tableName="projects" 
                                onRefresh={refreshData}
                                editComponent={ProjectCreate}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {data.length === 0 ? (
                                <div className="col-span-full">
                                    <Card className="text-center py-16 bg-white shadow-sm">
                                        <CardContent>
                                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Building className="w-10 h-10 text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-slate-900 mb-2">هیچ پروژه‌ای یافت نشد</h3>
                                            <p className="text-slate-500 mb-6">برای شروع، اولین پروژه خود را ایجاد کنید</p>
                                            <Button 
                                                className="gap-2"
                                                onClick={() => setShowCreateModal(true)}
                                            >
                                                <Plus className="w-4 h-4" />
                                                ایجاد پروژه جدید
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                data.map((project) => (
                                    <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 bg-white border-slate-200 hover:border-blue-300 cursor-pointer overflow-hidden">
                                        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                                        
                                        {/* Project Image */}
                                        <div 
                                            className="relative h-48 overflow-hidden cursor-pointer"
                                            onClick={() => project.image && setSelectedImage({url: project.image, title: project.name})}
                                        >
                                            {project.image ? (
                                                <>
                                                    <img 
                                                        src={project.image} 
                                                        alt={project.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            console.error('Image load error for project:', project.name, 'Image URL:', project.image);
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                        onLoad={() => {
                                                            console.log('Image loaded successfully for project:', project.name);
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <div className="bg-white/90 rounded-full p-2">
                                                            <Plus className="w-5 h-5 text-slate-700" />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Building className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                                                        <p className="text-slate-500 text-sm">بدون تصویر</p>
                                                        {/* Debug info */}
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Debug: {project.image ? `Has: ${project.image.substring(0, 20)}...` : 'No image data'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                        </div>
                                        
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                        <Building className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <span className="text-slate-900 group-hover:text-blue-700 transition-colors">
                                                        {project.name}
                                                    </span>
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <TooltipProvider>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEdit(project);
                                                                    }}
                                                                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>ویرایش پروژه</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeletingProject(project);
                                                                    }}
                                                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>حذف پروژه</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TooltipProvider>
                                            </CardTitle>
                                        </CardHeader>
                                        
                                        <CardContent className="space-y-4">
                                            {/* Address */}
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                                    {project.address || "آدرس مشخص نشده"}
                                                </p>
                                            </div>
                                            
                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-slate-50 rounded-lg p-3 group-hover:bg-blue-50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Calendar className="w-4 h-4 text-slate-500" />
                                                        <span className="text-xs text-slate-500 font-medium">تاریخ شروع</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700">{formatDate(project.startDate)}</p>
                                                </div>
                                                
                                                <div className="bg-slate-50 rounded-lg p-3 group-hover:bg-emerald-50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Users className="w-4 h-4 text-slate-500" />
                                                        <span className="text-xs text-slate-500 font-medium">واحدها</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700">{(project.unitCount || 0).toLocaleString()} واحد</p>
                                                </div>
                                                
                                                <div className="bg-slate-50 rounded-lg p-3 group-hover:bg-purple-50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Home className="w-4 h-4 text-slate-500" />
                                                        <span className="text-xs text-slate-500 font-medium">بلوک‌ها</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700">{project.blockNumber || 1} بلوک</p>
                                                </div>
                                                
                                            </div>

                                            {/* Description */}
                                            {project.options && (
                                                <div className="pt-3 border-t border-slate-100">
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        {project.options}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Image Modal */}
            {selectedImage && (
                <ImageModal
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    imageUrl={selectedImage.url}
                    title={selectedImage.title}
                />
            )}

            {/* Edit Modal */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">ویرایش پروژه</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingProject(null)}
                                className="h-8 w-8 p-0"
                            >
                                ✕
                            </Button>
                        </div>
                        <div className="p-6">
                            <ProjectCreate
                                initialValues={editingProject}
                                isEdit={true}
                                onSubmit={async (values) => {
                                    try {
                                        console.log('Updating project:', editingProject.id, values);
                                        await updateTableRow('projects', editingProject.id, values, (updatedData) => {
                                            console.log('Project updated successfully:', updatedData);
                                            refreshData();
                                            setEditingProject(null);
                                        });
                                    } catch (error) {
                                        console.error('Error updating project:', error);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deletingProject && (
                <Dialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-red-600">
                                <Trash2 className="w-5 h-5" />
                                حذف پروژه
                            </DialogTitle>
                            <DialogDescription className="text-slate-600">
                                آیا مطمئن هستید که می‌خواهید پروژه "{deletingProject.name}" را حذف کنید؟
                                <br />
                                <span className="text-red-500 font-medium">این عمل قابل بازگشت نیست.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingProject(null)}
                            >
                                انصراف
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(deletingProject)}
                                className="gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                حذف پروژه
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 rounded-none border-0 p-0">
                        <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100">
                            {/* Header */}
                            <div className="bg-white border-b px-6 py-4 shadow-sm">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-2xl">
                                        <Plus className="w-6 h-6" />
                                        ایجاد پروژه جدید
                                    </DialogTitle>
                                    <DialogDescription className="text-lg mt-1">
                                        اطلاعات پروژه جدید خود را وارد کنید
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                            
                            {/* Content */}
                            <div className="h-[calc(100vh-80px)] overflow-y-auto">
                                <div className="container mx-auto py-6 px-4">
                               <ProjectCreate 
                                   onSubmit={async (values) => {
                                       console.log('Creating new project:', values);
                                       // The ProjectCreate component handles the API call
                                       // After successful creation, refresh data and close modal
                                       refreshData();
                                       setShowCreateModal(false);
                                   }}
                                   onBack={() => {
                                       setShowCreateModal(false);
                                   }}
                               />
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
