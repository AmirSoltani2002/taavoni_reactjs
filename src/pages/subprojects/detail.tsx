import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building, Camera, FileText, Download, MapPin, History } from "lucide-react";
import { getTable, getImageBlobUrl, downloadDocument } from "@/general";
import { toast } from "sonner";
import type { SubProject, ProjectDoc } from "../projects/columns";
import { PageLoader } from "@/components/ui/loader";
import MapView from "@/components/app/MapView";
import { DataTable } from "@/components/ui/data-table";
import { getSubProjectHistoryColumns, type TransactionHistory } from "../users/transactionHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { User } from "../users/columns";

export default function SubProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [subProject, setSubProject] = useState<SubProject | null>(null);
    const [projectDocs, setProjectDocs] = useState<ProjectDoc[]>([]);
    const [projectImages, setProjectImages] = useState<Array<{ id: number; url?: string; index: number }>>([]);
    const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [ownerHistory, setOwnerHistory] = useState<TransactionHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('info');
    
    // Load user info to check admin status
    useEffect(() => {
        getTable('users/profile', (user: User | {error?: any}) => {
            if (user && !('error' in user)) {
                setIsAdmin(['admin', 'system'].includes((user as User)?.type || ''));
            }
        }, false);
    }, []);
    
    // Update active tab when admin status or hash changes
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        const validTabs = isAdmin 
            ? ['info', 'location', 'images', 'documents', 'invoice', 'history']
            : ['info', 'location', 'images', 'documents', 'invoice'];
        if (validTabs.includes(hash)) {
            setActiveTab(hash);
        } else {
            setActiveTab('info');
            window.history.replaceState(null, '', '#info');
        }
    }, [location.hash, isAdmin]);
    
    // Update URL hash when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        window.history.replaceState(null, '', `#${value}`);
    };

    useEffect(() => {
        if (id) {
            loadSubProjectData(id);
        }
    }, [id]);

    const loadSubProjectData = async (subProjectId: string) => {
        setIsLoading(true);
        try {
            // Load subproject data
            const subProjectData = await getTable(`subprojects/${subProjectId}`, undefined, false);
            if (subProjectData && !('error' in subProjectData)) {
                setSubProject(subProjectData as SubProject);
                
                // Get project ID from subproject
                const projectId = subProjectData.block?.project?.id;
                if (projectId) {
                    // Load project docs
                    const projectDocsData = await getTable(`project-docs/project/${projectId}`, undefined, false);
                    if (projectDocsData && Array.isArray(projectDocsData) && !('error' in projectDocsData)) {
                        // Separate images from documents
                        const images: Array<{ id: number; url?: string; index: number }> = [];
                        const docs: ProjectDoc[] = [];
                        
                        projectDocsData.forEach((doc: any) => {
                            if (doc.detail && doc.detail.startsWith('!!image')) {
                                // This is an image, extract index
                                const match = doc.detail.match(/!!image(\d+)/);
                                if (match && doc.id) {
                                    const imageIndex = parseInt(match[1]);
                                    images.push({ id: doc.id, url: doc.document, index: imageIndex });
                                }
                            } else {
                                // This is a regular document
                                docs.push(doc);
                            }
                        });
                        
                        // Sort images by index
                        images.sort((a, b) => a.index - b.index);
                        setProjectImages(images);
                        setProjectDocs(docs);
                    }
                }
            } else {
                toast.error('خطا در بارگذاری اطلاعات واحد');
            }
        } catch (error) {
            console.error('Error loading subproject data:', error);
            toast.error('خطا در بارگذاری اطلاعات واحد');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id && isAdmin) {
            setLoadingHistory(true);
            getTable(`transaction-history/subProject/${id}`, (data: TransactionHistory[] | {error?: any}) => {
                if (data && !('error' in data)) {
                    setOwnerHistory(data as TransactionHistory[] || []);
                } else {
                    setOwnerHistory([]);
                }
                setLoadingHistory(false);
            }, false);
        }
    }, [id, isAdmin]);

    // Load image URLs when projectImages change
    useEffect(() => {
        const loadImageUrls = async () => {
            const newUrls: { [key: number]: string } = {};
            
            for (const image of projectImages) {
                if (image.id) {
                    try {
                        const blobUrl = await getImageBlobUrl(image.id, 'project-docs', false);
                        if (blobUrl) {
                            newUrls[image.id] = blobUrl;
                        }
                    } catch (error) {
                        console.error(`Error loading image ${image.id}:`, error);
                    }
                }
            }
            
            setImageUrls(prevUrls => {
                // Revoke old blob URLs
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

    if (isLoading) {
        return <PageLoader />;
    }

    if (!subProject) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="p-8">
                    <CardContent>
                        <p className="text-center text-gray-500">واحد یافت نشد</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const project = subProject.block?.project;
    const block = subProject.block;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="my-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Building className="h-10 w-10 text-blue-600" />
                    واحد {subProject.unitNumber}
                </h1>
                <p className="text-gray-600 text-lg">
                    {project?.name && block?.name 
                        ? `${project.name} - بلوک ${block.name.replace('بلوک ', '')}`
                        : project?.name || block?.name?.replace('بلوک ', '') || 'جزئیات واحد'}
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="border-b border-gray-200 mb-6">
                    <TabsList className="w-full h-auto bg-transparent p-0 gap-0 inline-flex flex-wrap">
                        <TabsTrigger 
                            value="info" 
                            className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                        >
                            <Building className="h-4 w-4" />
                            <span className="hidden sm:inline">اطلاعات واحد</span>
                            <span className="sm:hidden">واحد</span>
                        </TabsTrigger>
                        {project && project.latitude != null && project.longitude != null && 
                         Number.isFinite(project.latitude) && Number.isFinite(project.longitude) && (
                            <TabsTrigger 
                                value="location" 
                                className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                            >
                                <MapPin className="h-4 w-4" />
                                <span className="hidden sm:inline">موقعیت</span>
                                <span className="sm:hidden">نقشه</span>
                            </TabsTrigger>
                        )}
                        <TabsTrigger 
                            value="images" 
                            className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                        >
                            <Camera className="h-4 w-4" />
                            <span className="hidden sm:inline">تصاویر</span>
                            <span className="sm:hidden">عکس</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="documents" 
                            className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">اسناد</span>
                            <span className="sm:hidden">سند</span>
                        </TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger 
                                value="history" 
                                className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                            >
                                <History className="h-4 w-4" />
                                <span className="hidden sm:inline">تاریخچه</span>
                                <span className="sm:hidden">تاریخ</span>
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                {/* Unit Info Tab */}
                <TabsContent value="info" className="mt-0">
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
                                اطلاعات واحد
                            </span>
                            <p className="text-sm text-slate-500 font-normal mt-1">
                                جزئیات واحد و پروژه
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">شناسه پروژه</Label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-slate-900 font-medium">{project?.id || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">نام پروژه</Label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-slate-900 font-medium">{project?.name || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">شناسه بلوک</Label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-slate-900 font-medium">{block?.id || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">نام بلوک</Label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-slate-900 font-medium">{block?.name || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">شماره واحد</Label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-slate-900 font-medium">{subProject.unitNumber || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">مساحت (متر مربع)</Label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-slate-900 font-medium">{subProject.area || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">طبقه</Label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-slate-900 font-medium">{subProject.floor || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">تعداد اتاق</Label>
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-slate-900 font-medium">{subProject.roomCount || '-'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                    </Card>
                </TabsContent>

                {/* Location Tab */}
                {project && project.latitude != null && project.longitude != null && 
                 Number.isFinite(project.latitude) && Number.isFinite(project.longitude) && (
                    <TabsContent value="location" className="mt-0">
                        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-200/30 pb-6">
                        <CardTitle className="flex items-center gap-4 text-xl">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur-sm opacity-30"></div>
                                <div className="relative p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">
                                    موقعیت پروژه
                                </span>
                                <p className="text-sm text-slate-500 font-normal mt-1">
                                    موقعیت جغرافیایی پروژه روی نقشه
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <MapView 
                                position={[project.latitude, project.longitude]} 
                                zoom={16}
                                title={project.name || project.address || 'موقعیت پروژه'}
                            />
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                <div>
                                    <span className="font-semibold">عرض جغرافیایی: </span>
                                    <span>{project.latitude.toFixed(6)}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">طول جغرافیایی: </span>
                                    <span>{project.longitude.toFixed(6)}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Label className="text-slate-700 font-semibold mb-2 block flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                    آدرس پروژه
                                </Label>
                                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200 hover:border-green-300 transition-all duration-200">
                                    <p className="text-slate-900 font-medium leading-relaxed text-base">
                                        {project?.address || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* Images Tab */}
                <TabsContent value="images" className="mt-0">
                    <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-200/30 pb-6">
                    <CardTitle className="flex items-center gap-4 text-xl">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur-sm opacity-30"></div>
                            <div className="relative p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-bold">
                                تصاویر پروژه
                            </span>
                            <p className="text-sm text-slate-500 font-normal mt-1">
                                تصاویر مربوط به پروژه
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {projectImages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {projectImages.map((image) => (
                                <div key={image.id} className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                                    <div className="relative aspect-video bg-slate-100">
                                        {imageUrls[image.id] ? (
                                            <img
                                                src={imageUrls[image.id]}
                                                alt={`تصویر ${image.index + 1} پروژه`}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                                                <Camera className="w-12 h-12 text-purple-300" />
                                            </div>
                                        )}
                                        
                                        {/* Overlay with download button - appears on hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => downloadDocument(image.id, 'project-docs', `project-image-${image.index + 1}`, true)}
                                                className="h-10 w-10 p-0 text-white hover:bg-blue-500/80 bg-blue-500/60 backdrop-blur-sm"
                                                title="دانلود تصویر"
                                            >
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        {/* Image number badge */}
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
                                            {image.index + 1}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                            <Camera className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm">هیچ تصویری ثبت نشده است</p>
                        </div>
                    )}
                </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="mt-0">
                    <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-200/30 pb-6">
                    <CardTitle className="flex items-center gap-4 text-xl">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl blur-sm opacity-30"></div>
                            <div className="relative p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-bold">
                                اسناد پروژه
                            </span>
                            <p className="text-sm text-slate-500 font-normal mt-1">
                                اسناد و مدارک مربوط به پروژه
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {projectDocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projectDocs.map((doc, index) => {
                                const filename = doc.document ? doc.document.split('/').pop() || doc.document.split('\\').pop() : 'فایل';
                                return (
                                    <Card key={doc.id || index} className="bg-slate-50 border-2 border-slate-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-5 h-5 text-indigo-600" />
                                                        <div>
                                                            <p className="font-medium text-slate-900">{doc.detail || 'سند'}</p>
                                                            <p className="text-sm text-slate-500">{filename}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {doc.id && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => downloadDocument(doc.id!, 'project-docs', doc.detail || 'document', true)}
                                                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                                            title="دانلود سند"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm">هیچ سندی ثبت نشده است</p>
                        </div>
                    )}
                </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab - Only visible to admins */}
                {isAdmin && (
                    <TabsContent value="history" className="mt-0">
                    <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-200/30 pb-6">
                    <CardTitle className="flex items-center gap-4 text-xl">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-sm opacity-30"></div>
                            <div className="relative p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                                <History className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                                تاریخچه مالکان
                            </span>
                            <p className="text-sm text-slate-500 font-normal mt-1">
                                تاریخچه کاربرانی که این واحد به آن‌ها اختصاص داده شده است
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Current Owner Section */}
                    {loadingHistory ? (
                        <PageLoader />
                    ) : (() => {
                        // Find current owner (most recent transaction)
                        const sortedHistory = [...ownerHistory].sort((a, b) => {
                            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return dateB - dateA;
                        });
                        const currentOwner = sortedHistory.length > 0 ? sortedHistory[0] : null;
                        
                        return (
                            <>
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-indigo-600" />
                                        مالک فعلی واحد
                                    </h3>
                                    {currentOwner && currentOwner.user ? (
                                        <div className="space-y-3">
                                            <div className="bg-white rounded-lg p-4 border border-indigo-100">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-lg font-semibold text-slate-900 mb-2">
                                                            {currentOwner.user.name || ''} {currentOwner.user.lastName || ''}
                                                        </p>
                                                        <div className="space-y-1 text-sm text-slate-600">
                                                            {currentOwner.user.email && (
                                                                <p className="flex items-center gap-2">
                                                                    <span className="font-medium">ایمیل:</span>
                                                                    <span>{currentOwner.user.email}</span>
                                                                </p>
                                                            )}
                                                            {currentOwner.user.mobile && (
                                                                <p className="flex items-center gap-2">
                                                                    <span className="font-medium">موبایل:</span>
                                                                    <span>{currentOwner.user.mobile}</span>
                                                                </p>
                                                            )}
                                                            {currentOwner.user.nationalNumber && (
                                                                <p className="flex items-center gap-2">
                                                                    <span className="font-medium">کد ملی:</span>
                                                                    <span>{currentOwner.user.nationalNumber}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {currentOwner.userId && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                window.location.href = `/users/${currentOwner.userId}`;
                                                            }}
                                                            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                                                        >
                                                            مشاهده پروفایل
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {currentOwner.createdAt && (
                                                <div className="text-sm text-slate-600 bg-white/70 rounded-lg p-3 border border-indigo-100">
                                                    <span className="font-medium">تاریخ واگذاری: </span>
                                                    <span>
                                                        {new Date(currentOwner.createdAt).toLocaleDateString('fa-IR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg p-6 border-2 border-dashed border-slate-300 text-center">
                                            <Building className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                            <p className="text-slate-700 font-medium text-base">
                                                این واحد در حال حاضر به هیچ کاربری اختصاص داده نشده است
                                            </p>
                                            <p className="text-slate-500 text-sm mt-2">
                                                واحد آماده واگذاری می‌باشد
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* History Table */}
                                {ownerHistory.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <History className="w-5 h-5 text-indigo-600" />
                                            تاریخچه کامل واگذاری‌ها
                                        </h3>
                                        <DataTable 
                                            columns={getSubProjectHistoryColumns()} 
                                            data={ownerHistory} 
                                            tableName="transaction-history"
                                            _showDeleteButton={false}
                                            onClickRow={(row) => {
                                                if (row.userId) {
                                                    window.location.href = `/users/${row.userId}`;
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </CardContent>
                    </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

