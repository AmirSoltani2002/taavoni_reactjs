import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Project, Block, SubProject } from "../projects/columns";
import type { User } from "./columns";
import { getTable, updateTableRow } from "@/general";
import { PageLoader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building, Home, Layers, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { getDirection } from "../projects/general";
import { toast } from "sonner";

const AssignProject = () => {
    const { userId, subProjectId } = useParams();
    const isEditMode = !!subProjectId;
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<SubProject | null>(null);
    const [units, setUnits] = useState<SubProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        setIsLoading(true);
        
        // Fetch user data
        if (userId) {
            getTable(`users/${userId}`, (data: User | {error: {error: string, status: number}}) => {
                if('error' in data){
                    console.error('Error loading user:', data.error);
                } else {
                    setUser(data as User);
                }
            }, false);
        }
        
        // Fetch projects
        getTable(`projects/all`, (data: Project[] | {error: {error: string, status: number}}) => {
            if('error' in data){
                setError(data.error.error);
            } else {
                setProjects(data as Project[]);
                setBlocks(data.find((project) => project.id === selectedProject?.id)?.blocks || []);
            }
            setIsLoading(false);
        }, false);
    }, [userId]);

    // Load subproject data in edit mode
    useEffect(() => {
        if (isEditMode && subProjectId) {
            // Fetch the subproject directly
            getTable(`subprojects/${subProjectId}`, (subProject: SubProject | {error: {error: string, status: number}}) => {
                if (!('error' in subProject)) {
                    const foundSubProject = subProject as SubProject;
                    const foundBlock = foundSubProject.block;
                    const foundProject = foundBlock?.project;
                    console.log({foundSubProject, foundBlock, foundProject});

                    if (foundSubProject && foundBlock && foundProject) {
                        setSelectedProject(foundProject);
                        setSelectedBlock(foundBlock);
                        setSelectedUnit(foundSubProject);
                        
                        // Set blocks and units from the loaded project
                        if (foundProject.blocks) {
                            setBlocks(foundProject.blocks);
                            const blockWithSubProjects = foundProject.blocks.find(b => b.id === foundBlock.id);
                            if (blockWithSubProjects?.subProjects) {
                                setUnits(blockWithSubProjects.subProjects);
                            }
                        }
                    }
                }
            }, false);
        }
    }, [isEditMode, subProjectId]);

    useEffect(() => {
        if(selectedProject && !isEditMode){
            setBlocks(selectedProject.blocks || []);
            setSelectedBlock(null);
            setSelectedUnit(null);
            setUnits([]);
        }
    }, [selectedProject]);
    
    useEffect(() => {
        if(selectedBlock && !isEditMode){
            setUnits(selectedBlock.subProjects || []);
            setSelectedUnit(null);
        }
    }, [selectedBlock]);

    const handleAssignUnit = async () => {
        if(!selectedUnit || !userId || !selectedUnit.id){
            return;
        }

        setIsAssigning(true);

        const unitId = selectedUnit.id;
        if (!unitId) {
            toast.error('خطا: شناسه واحد یافت نشد');
            setIsAssigning(false);
            return;
        }

        // In edit mode, we don't reassign the unit - just navigate back
        if (isEditMode) {
            navigate(`/users/${userId}`);
            return;
        }

        // In create mode, assign the unit
        updateTableRow(`subprojects`, unitId, {userId: userId}, async (data: SubProject) => {
            if(data && data.id){
                toast.success('واحد با موفقیت اعطا شد');
                navigate(`/users/${userId}`);
            } else {
                toast.error('خطایی رخ داده است' + JSON.stringify(data));
            }
            setIsAssigning(false);
        });
    }

    const isFormComplete = selectedProject && selectedBlock && selectedUnit;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 py-10">
            <div className="container mx-auto max-w-6xl px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {isEditMode ? 'مشاهده واحد' : `اعطای واحد جدید به ${user?.name && user?.lastName ? `${user.name} ${user.lastName}` : user?.name || user?.lastName || 'کاربر'}`}
                    </h1>
                    <p className="text-gray-600">
                        {isEditMode ? 'اطلاعات واحد اختصاص داده شده' : 'لطفاً پروژه، بلوک و واحد مورد نظر را انتخاب کنید'}
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {isLoading && <PageLoader />}

                {!isLoading && projects.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Selection Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Step 1: Project Selection */}
                            <Card className="shadow-md">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Building className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">انتخاب پروژه</CardTitle>
                                            <CardDescription>پروژه مورد نظر را انتخاب کنید</CardDescription>
                                        </div>
                                        {selectedProject && (
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle2 className="h-3 w-3" />
                                                انتخاب شده
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="project-select" className="text-base font-semibold">
                                            پروژه
                                        </Label>
                                        <Select 
                                            value={selectedProject?.id?.toString() || ''} 
                                            onValueChange={(value) => setSelectedProject(projects.find((project) => project.id?.toString() === value) || null)}
                                            disabled={isEditMode}
                                        >
                                            <SelectTrigger id="project-select" className="h-12" disabled={isEditMode}>
                                                <SelectValue placeholder="انتخاب پروژه" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.length > 0 ? projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id?.toString() || ''}>
                                                        <div className="flex items-center gap-2">
                                                            <Building className="h-4 w-4" />
                                                            <span>{project.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                )) : (
                                                    <SelectItem value="no-projects" disabled>
                                                        هیچ پروژه‌ای ثبت نشده است
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Step 2: Block Selection */}
                            <Card className={`shadow-md transition-opacity ${selectedProject ? 'opacity-100' : 'opacity-50'}`}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Layers className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">انتخاب بلوک</CardTitle>
                                            <CardDescription>بلوک مورد نظر را انتخاب کنید</CardDescription>
                                        </div>
                                        {selectedBlock && (
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle2 className="h-3 w-3" />
                                                انتخاب شده
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="block-select" className="text-base font-semibold">
                                            بلوک
                                        </Label>
                                        <Select 
                                            value={selectedBlock?.id?.toString() || ''} 
                                            onValueChange={(value) => setSelectedBlock(blocks.find((block) => block.id?.toString() === value) || null)}
                                            disabled={!selectedProject || isEditMode}
                                        >
                                            <SelectTrigger id="block-select" className="h-12" disabled={!selectedProject || isEditMode}>
                                                {selectedBlock ? (
                                                    <>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <Layers className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                                            <span className="font-semibold">{selectedBlock.name}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <SelectValue placeholder={selectedProject ? "انتخاب بلوک مورد نظر" : "ابتدا پروژه را انتخاب کنید"} />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {blocks.length > 0 ? blocks.map((block) => (
                                                    <SelectItem key={block.id} value={block.id?.toString() || ''}>
                                                        <div className="flex items-center gap-2">
                                                            <Layers className="h-4 w-4" />
                                                            <span>{block.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                )) : (
                                                    <SelectItem value="no-blocks" disabled>
                                                        {selectedProject ? "هیچ بلوکی ثبت نشده است" : "ابتدا پروژه را انتخاب کنید"}
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Step 3: Unit Selection */}
                            <Card className={`shadow-md transition-opacity ${selectedBlock ? 'opacity-100' : 'opacity-50'}`}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Home className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">انتخاب واحد</CardTitle>
                                            <CardDescription>واحد مورد نظر را انتخاب کنید</CardDescription>
                                        </div>
                                        {selectedUnit && (
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle2 className="h-3 w-3" />
                                                انتخاب شده
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="unit-select" className="text-base font-semibold">
                                            واحد
                                        </Label>
                                        <Select 
                                            value={selectedUnit?.id?.toString() || ''} 
                                            onValueChange={(value) => setSelectedUnit(units.find((subProject) => subProject.id?.toString() === value) || null)}
                                            disabled={!selectedBlock || isEditMode}
                                        >
                                            <SelectTrigger id="unit-select" className="h-12" disabled={!selectedBlock || isEditMode}>
                                                {selectedUnit ? (
                                                    <>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <Home className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                            <span className="font-semibold">واحد {selectedUnit.unitNumber}</span>
                                                            <span className="text-sm text-gray-500">•</span>
                                                            <span className="text-sm text-gray-600">طبقه {selectedUnit.floor}</span>
                                                            <span className="text-sm text-gray-500">•</span>
                                                            <span className="text-sm text-gray-600">{selectedUnit.area} متر مربع</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <SelectValue placeholder={selectedBlock ? "انتخاب واحد مورد نظر" : "ابتدا بلوک را انتخاب کنید"} />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.length > 0 ? units.map((subProject) => (
                                                    <SelectItem key={subProject.id} value={subProject.id?.toString() || ''}>
                                                        <div className="flex flex-col gap-1 py-1">
                                                            <div className="flex items-center gap-2 font-semibold">
                                                                <Home className="h-4 w-4" />
                                                                <span>واحد {subProject.unitNumber}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 pr-6">
                                                                طبقه {subProject.floor} • {subProject.area} متر مربع
                                                            </div>
                                                            <div className="text-xs text-gray-500 pr-6">
                                                                {getDirection(subProject.direction)} {subProject.options ? '•' : ''} {subProject.options || ''}
                                                            </div>
                                                            <div className="text-xs text-blue-600 pr-6">
                                                                امتیاز: {subProject.point} / 10
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                )) : (
                                                    <SelectItem value="no-units" disabled>
                                                        {selectedBlock ? "هیچ واحدی ثبت نشده است" : "ابتدا بلوک را انتخاب کنید"}
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Card */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-lg sticky top-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                        خلاصه انتخاب
                                    </CardTitle>
                                    <CardDescription>اطلاعات انتخاب شده را بررسی کنید</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Project Summary */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">پروژه</Label>
                                        <div className="p-3 bg-white rounded-lg border">
                                            {selectedProject ? (
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">{selectedProject.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">انتخاب نشده</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Block Summary */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">بلوک</Label>
                                        <div className="p-3 bg-white rounded-lg border">
                                            {selectedBlock ? (
                                                <div className="flex items-center gap-2">
                                                    <Layers className="h-4 w-4 text-purple-600" />
                                                    <span className="font-medium">{selectedBlock.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">انتخاب نشده</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Unit Summary */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">واحد</Label>
                                        <div className="p-3 bg-white rounded-lg border">
                                            {selectedUnit ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Home className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium">واحد {selectedUnit.unitNumber}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 pr-6">
                                                        طبقه {selectedUnit.floor} • {selectedUnit.area} متر مربع
                                                    </div>
                                                    <div className="text-xs text-gray-500 pr-6">
                                                        {getDirection(selectedUnit.direction)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">انتخاب نشده</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button 
                                        onClick={handleAssignUnit}
                                        disabled={!isFormComplete || isAssigning}
                                        className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                        size="lg"
                                    >
                                        {isAssigning ? (
                                            'در حال ثبت...'
                                        ) : isFormComplete ? (
                                            <>
                                                {isEditMode ? 'بازگشت' : 'اعطای واحد به کاربر'}
                                                <ArrowRight className="h-5 w-5 mr-2" />
                                            </>
                                        ) : (
                                            "لطفاً تمام فیلدها را پر کنید"
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {!isLoading && projects.length === 0 && !error && (
                    <Card className="shadow-md">
                        <CardContent className="py-12 text-center">
                            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">هیچ پروژه‌ای یافت نشد</h3>
                            <p className="text-gray-500">در حال حاضر هیچ پروژه‌ای برای انتخاب وجود ندارد</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
export default AssignProject;