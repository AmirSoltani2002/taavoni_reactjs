import { columns, type Project } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable } from "@/general"
import { useEffect, useState, useMemo } from "react"
import ProjectCreate from "./newCreate"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, Users, Home, Plus, TrendingUp, Trash2, List } from "lucide-react"
import { ImageModal } from "@/components/ui/image-modal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deleteTableRow } from "@/general"
import { ImageStorage } from "@/lib/imageStorage"
import { useNavigate } from "react-router-dom"
import type { User } from "../users/columns"

export default function ProjectsList() {
    const [data, setData] = useState<Project[]>([])
    const [userInfo, setUserInfo] = useState<User>()
    const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | undefined>()
    const [editingProject, setEditingProject] = useState<Project>()
    const [deletingProject, setDeletingProject] = useState<Project>()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const navigate = useNavigate();
    useEffect(() => {
        try{
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
        } catch (_) {}
    }, [])

    useEffect(() => {
        getTable('users/profile', setUserInfo);
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

    const tableOptions = useMemo(() => [
        {
            title: <div className="flex items-center gap-2 text-blue-600">
                <List className="h-4 w-4" />
                <span>مشاهده واحدها</span>
            </div>,
            onClick: (row: Project) => {
                if (row.id) {
                    navigate(`/projects/${row.id}/units`);
                }
            },
        }
    ], [navigate]);

    const handleDelete = async (project: Project) => {
        if(!project?.id){return}
        try {
            await deleteTableRow('projects', project.id);
            
            // Also remove locally stored image
            ImageStorage.removeProjectImage(project.id);
            console.log('Locally stored image removed for project:', project.id);
            
            refreshData();
            setDeletingProject(undefined);
        } catch (error) {
            console.error('Error deleting project:', error);
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
                            <p className="text-slate-600 text-lg">
                                {['admin', 'system'].includes(userInfo?.type || '') ? 'مشاهده و مدیریت تمام پروژه‌های موجود در سیستم' : 'پروژه‌های شما'}
                            </p>
                        </div>
                        
                        {['admin', 'system'].includes(userInfo?.type || '') && <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                                className="gap-2 shadow-md"
                                onClick={() => navigate('/projects/create')}
                            >
                                <Plus className="w-4 h-4" />
                                پروژه جدید
                            </Button>
                        </div>}
                    </div>
                
                    {/* Statistics Cards */}
                    {['admin', 'system'].includes(userInfo?.type || '') && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                        <p className="text-3xl font-bold text-emerald-900">{data.reduce((sum, project) => sum + (project.blocks?.length || 0), 0).toLocaleString()}</p>
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
                                        <p className="text-3xl font-bold text-purple-900">{data.reduce((sum, project) => sum + (project.blocks?.length || 0), 0)}</p>
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
                    </div>}
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border">
                            <DataTable 
                                columns={columns} 
                                data={data} 
                                tableName="projects" 
                                onRefresh={refreshData}
                                onClickRow={(row) => row.id && navigate(`/projects/edit/${row.id}`)}
                                options={tableOptions}
                            />
                        </div>
                </div>
            </div>
            
            {/* Image Modal */}
            {selectedImage && (
                <ImageModal
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(undefined)}
                    imageUrl={selectedImage.url}
                    title={selectedImage.title}
                />
            )}

            {/* Edit Modal - Navigate to edit route instead */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">ویرایش پروژه</h2>
                        <p className="text-slate-600 mb-6">
                            آیا می‌خواهید پروژه "{editingProject.name}" را ویرایش کنید؟
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    if (editingProject.id) {
                                        navigate(`/projects/edit/${editingProject.id}`);
                                    }
                                    setEditingProject(undefined);
                                }}
                                className="flex-1"
                            >
                                بله، ویرایش کن
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setEditingProject(undefined)}
                                className="flex-1"
                            >
                                انصراف
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deletingProject && (
                <Dialog open={!!deletingProject} onOpenChange={() => setDeletingProject(undefined)}>
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
                                onClick={() => setDeletingProject(undefined)}
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
