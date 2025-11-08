import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building, Camera, FileText, Download, Receipt } from "lucide-react";
import { getTable, getImageBlobUrl, downloadDocument, getToken } from "@/general";
import { toast } from "sonner";
import type { SubProject, ProjectDoc } from "../projects/columns";
import { PageLoader } from "@/components/ui/loader";
import { api_base_url } from "@/config";

export default function SubProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const [subProject, setSubProject] = useState<SubProject | null>(null);
    const [projectDocs, setProjectDocs] = useState<ProjectDoc[]>([]);
    const [projectImages, setProjectImages] = useState<Array<{ id: number; url?: string; index: number }>>([]);
    const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [invoice, setInvoice] = useState<{
        id: number;
        amount?: number;
        number?: string;
        detail?: string;
        document?: string;
    } | null>(null);

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

                // Load invoice if subproject has a userId
                const userId = (subProjectData as SubProject).userId;
                if (userId) {
                    const invoicesData = await getTable(`invoice/profile`, undefined, false);
                    if (invoicesData && Array.isArray(invoicesData) && !('error' in invoicesData)) {
                        console.log({invoicesData});
                        const foundInvoice = (invoicesData as any[]).find((inv: any) => 
                            inv.subProjectId?.toString() === subProjectId
                        );
                        if (foundInvoice) {
                            setInvoice({
                                id: foundInvoice.id,
                                amount: foundInvoice.amount,
                                number: foundInvoice.number,
                                detail: foundInvoice.detail,
                                document: foundInvoice.document,
                            });
                        }
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
            {/* SubProject Info */}
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

            {/* Project Images */}
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

            {/* Project Documents */}
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

            {/* Invoice Information */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-200/30 pb-6">
                    <CardTitle className="flex items-center gap-4 text-xl">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur-sm opacity-30"></div>
                            <div className="relative p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
                                اطلاعات فاکتور
                            </span>
                            <p className="text-sm text-slate-500 font-normal mt-1">
                                اطلاعات فاکتور واحد
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {invoice ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {invoice.document && (
                                <div className="md:col-span-2 lg:col-span-3">
                                    <Label className="text-slate-700 font-semibold mb-2 block">فایل فاکتور</Label>
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText className="h-5 w-5 text-orange-600 flex-shrink-0" />
                                            <span className="font-medium text-slate-900 truncate">{invoice.document}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={async () => {
                                                if (!invoice.id) return;
                                                try {
                                                    const token = getToken();
                                                    const resp = await fetch(`${api_base_url}/invoice/download/${invoice.id}`, {
                                                        method: 'GET',
                                                        headers: {
                                                            'Authorization': token ? `Bearer ${token}` : ''
                                                        }
                                                    });
                                                    
                                                    if (resp.ok) {
                                                        const blob = await resp.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        
                                                        // Get filename from Content-Disposition header or use document filename
                                                        const contentDisposition = resp.headers.get('Content-Disposition');
                                                        let downloadFilename = invoice.document || 'invoice';
                                                        if (contentDisposition) {
                                                            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                                                            if (filenameMatch && filenameMatch[1]) {
                                                                downloadFilename = filenameMatch[1].replace(/['"]/g, '');
                                                            }
                                                        }
                                                        
                                                        a.download = downloadFilename;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        window.URL.revokeObjectURL(url);
                                                        document.body.removeChild(a);
                                                        toast.success('فایل با موفقیت دانلود شد');
                                                    } else {
                                                        const err = await resp.json();
                                                        toast.error(err.message || 'خطا در دانلود فایل');
                                                    }
                                                } catch (error: any) {
                                                    console.error('Download error:', error);
                                                    toast.error('خطا در دانلود فایل');
                                                }
                                            }}
                                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 flex-shrink-0"
                                            title="دانلود فایل"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {invoice.amount && (
                                <div>
                                    <Label className="text-slate-700 font-semibold mb-2 block">مبلغ (تومان)</Label>
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                        <p className="text-slate-900 font-medium">{invoice.amount.toLocaleString('fa-IR')}</p>
                                    </div>
                                </div>
                            )}
                            {invoice.number && (
                                <div>
                                    <Label className="text-slate-700 font-semibold mb-2 block">شماره فاکتور</Label>
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                        <p className="text-slate-900 font-medium">{invoice.number}</p>
                                    </div>
                                </div>
                            )}
                            {invoice.detail && (
                                <div className="md:col-span-2 lg:col-span-3">
                                    <Label className="text-slate-700 font-semibold mb-2 block">جزئیات</Label>
                                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                        <p className="text-slate-900 font-medium whitespace-pre-wrap">{invoice.detail}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                            <p className="text-sm">هیچ فاکتوری برای این واحد ثبت نشده است</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

