import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

interface viewTogglerProps {
    viewMode: 'cards' | 'table';
    setViewMode: (mode: 'cards' | 'table') => void
}
export const viewToggler: React.FC<viewTogglerProps> = ({
    viewMode,
    setViewMode
}) => {
    return <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border">
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
}
const CardView = () => {
    return undefined;
    // return <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    //     {data.length === 0 ? (
    //         <div className="col-span-full">
    //             <Card className="text-center py-16 bg-white shadow-sm">
    //                 <CardContent>
    //                     <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
    //                         <Building className="w-10 h-10 text-slate-400" />
    //                     </div>
    //                     <h3 className="text-xl font-semibold text-slate-900 mb-2">هیچ پروژه‌ای یافت نشد</h3>
    //                     <p className="text-slate-500 mb-6">برای شروع، اولین پروژه خود را ایجاد کنید</p>
    //                     <Button 
    //                         className="gap-2"
    //                         onClick={() => setShowCreateModal(true)}
    //                     >
    //                         <Plus className="w-4 h-4" />
    //                         ایجاد پروژه جدید
    //                     </Button>
    //                 </CardContent>
    //             </Card>
    //         </div>
    //     ) : (
    //         data.map((project) => (
    //             <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 bg-white border-slate-200 hover:border-blue-300 cursor-pointer overflow-hidden">
    //                 <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                    
    //                 {/* Project Image */}
    //                 <div 
    //                     className="relative h-48 overflow-hidden cursor-pointer"
    //                     onClick={() => (project.image && project.name) && setSelectedImage({url: project.image, title: project.name})}
    //                 >
    //                     {project.image ? (
    //                         <>
    //                             <img 
    //                                 src={project.image} 
    //                                 alt={project.name}
    //                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    //                                 onError={(e) => {
    //                                     console.error('Image load error for project:', project.name, 'Image URL:', project.image);
    //                                     e.currentTarget.style.display = 'none';
    //                                 }}
    //                                 onLoad={() => {
    //                                     console.log('Image loaded successfully for project:', project.name);
    //                                 }}
    //                             />
    //                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
    //                                 <div className="bg-white/90 rounded-full p-2">
    //                                     <Plus className="w-5 h-5 text-slate-700" />
    //                                 </div>
    //                             </div>
    //                         </>
    //                     ) : (
    //                         <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
    //                             <div className="text-center">
    //                                 <Building className="w-16 h-16 text-slate-400 mx-auto mb-2" />
    //                                 <p className="text-slate-500 text-sm">بدون تصویر</p>
    //                                 {/* Debug info */}
    //                                 <p className="text-xs text-slate-400 mt-1">
    //                                     Debug: {project.image ? `Has: ${project.image.substring(0, 20)}...` : 'No image data'}
    //                                 </p>
    //                             </div>
    //                         </div>
    //                     )}
    //                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    //                 </div>
                    
    //                 <CardHeader className="pb-4">
    //                     <CardTitle className="flex items-center justify-between">
    //                         <div className="flex items-center gap-3">
    //                             <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
    //                                 <Building className="w-5 h-5 text-blue-600" />
    //                             </div>
    //                             <span className="text-slate-900 group-hover:text-blue-700 transition-colors">
    //                                 {project.name}
    //                             </span>
    //                         </div>
                            
    //                         {/* Action Buttons */}
    //                         <TooltipProvider>
    //                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
    //                                 <Tooltip>
    //                                     <TooltipTrigger asChild>
    //                                         <Button
    //                                             size="sm"
    //                                             variant="ghost"
    //                                             onClick={(e) => {
    //                                                 e.stopPropagation();
    //                                                 handleEdit(project);
    //                                             }}
    //                                             className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
    //                                         >
    //                                             <Edit className="w-4 h-4" />
    //                                         </Button>
    //                                     </TooltipTrigger>
    //                                     <TooltipContent>
    //                                         <p>ویرایش پروژه</p>
    //                                     </TooltipContent>
    //                                 </Tooltip>
                                    
    //                                 <Tooltip>
    //                                     <TooltipTrigger asChild>
    //                                         <Button
    //                                             size="sm"
    //                                             variant="ghost"
    //                                             onClick={(e) => {
    //                                                 e.stopPropagation();
    //                                                 setDeletingProject(project);
    //                                             }}
    //                                             className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
    //                                         >
    //                                             <Trash2 className="w-4 h-4" />
    //                                         </Button>
    //                                     </TooltipTrigger>
    //                                     <TooltipContent>
    //                                         <p>حذف پروژه</p>
    //                                     </TooltipContent>
    //                                 </Tooltip>
    //                             </div>
    //                         </TooltipProvider>
    //                     </CardTitle>
    //                 </CardHeader>
                    
    //                 <CardContent className="space-y-4">
    //                     {/* Address */}
    //                     <div className="flex items-start gap-3">
    //                         <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
    //                         <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
    //                             {project.address || "آدرس مشخص نشده"}
    //                         </p>
    //                     </div>
                        
    //                     {/* Stats Grid */}
    //                     <div className="grid grid-cols-3 gap-3">
    //                         {project.startDate && <div className="bg-slate-50 rounded-lg p-3 group-hover:bg-blue-50 transition-colors">
    //                             <div className="flex items-center gap-2 mb-1">
    //                                 <Calendar className="w-4 h-4 text-slate-500" />
    //                                 <span className="text-xs text-slate-500 font-medium">تاریخ شروع</span>
    //                             </div>
    //                             <p className="text-sm font-semibold text-slate-700">{formatDate(project.startDate)}</p>
    //                         </div>}
                            
    //                         <div className="bg-slate-50 rounded-lg p-3 group-hover:bg-emerald-50 transition-colors">
    //                             <div className="flex items-center gap-2 mb-1">
    //                                 <Users className="w-4 h-4 text-slate-500" />
    //                                 <span className="text-xs text-slate-500 font-medium">واحدها</span>
    //                             </div>
    //                             <p className="text-sm font-semibold text-slate-700">{(project.unitCount || 0).toLocaleString()} واحد</p>
    //                         </div>
                            
    //                         <div className="bg-slate-50 rounded-lg p-3 group-hover:bg-purple-50 transition-colors">
    //                             <div className="flex items-center gap-2 mb-1">
    //                                 <Home className="w-4 h-4 text-slate-500" />
    //                                 <span className="text-xs text-slate-500 font-medium">بلوک‌ها</span>
    //                             </div>
    //                             <p className="text-sm font-semibold text-slate-700">{project.blockNumber || 1} بلوک</p>
    //                         </div>
                            
    //                     </div>

    //                     {/* Description */}
    //                     {project.options && (
    //                         <div className="pt-3 border-t border-slate-100">
    //                             <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
    //                                 {project.options}
    //                             </p>
    //                         </div>
    //                     )}
    //                 </CardContent>
    //             </Card>
    //         ))
    //     )}
    // </div>
}

export default CardView;