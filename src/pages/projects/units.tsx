import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTable } from "@/general";
import { DataTable } from "@/components/ui/data-table";
import { PageLoader } from "@/components/ui/loader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Home } from "lucide-react";
import type { Project, SubProject } from "./columns";
import { subProjectColumns } from "./columns";

export default function ProjectUnits() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            setIsLoading(true);
            getTable(`projects/${projectId}`, (data: Project | {error: {error: string, status: number}}) => {
                if('error' in data){
                    setError(data.error.error);
                    setIsLoading(false);
                } else {
                    setProject(data as Project);
                    setIsLoading(false);
                }
            }, false);
        }
    }, [projectId]);

    // Flatten all subprojects from all blocks
    const allUnits = useMemo(() => {
        if (!project?.blocks) return [];
        const units: SubProject[] = [];
        project.blocks.forEach(block => {
            if (block.subProjects) {
                block.subProjects.forEach(subProject => {
                    // Ensure block reference is set for proper display
                    units.push({
                        ...subProject,
                        block: {
                            ...block,
                            project: project
                        }
                    });
                });
            }
        });
        return units;
    }, [project]);

    const handleRowClick = (row: SubProject) => {
        if (row.id) {
            navigate(`/unit/${row.id}`);
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-red-500">{error}</p>
                        <Button 
                            variant="outline" 
                            className="mt-4 gap-2"
                            onClick={() => navigate('/projects/list')}
                        >
                            <ArrowRight className="h-4 w-4" />
                            بازگشت به لیست پروژه‌ها
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-500">پروژه یافت نشد</p>
                        <Button 
                            variant="outline" 
                            className="mt-4 gap-2"
                            onClick={() => navigate('/projects/list')}
                        >
                            <ArrowRight className="h-4 w-4" />
                            بازگشت به لیست پروژه‌ها
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Building className="h-8 w-8 text-blue-600" />
                            واحدهای پروژه {project.name}
                        </h1>
                        <p className="text-gray-600">
                            لیست تمام واحدهای این پروژه
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => navigate('/projects/list')}
                    >
                        <ArrowRight className="h-4 w-4" />
                        بازگشت به لیست پروژه‌ها
                    </Button>
                </div>
                
                {/* Project Info Card */}
                <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-blue-600" />
                                <span className="font-semibold">نام پروژه:</span>
                                <span>{project.name}</span>
                            </div>
                            {project.address && (
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">نشانی:</span>
                                    <span>{project.address}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Home className="h-5 w-5 text-purple-600" />
                                <span className="font-semibold">تعداد واحدها:</span>
                                <span className="text-lg font-bold text-blue-600">{allUnits.length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {allUnits.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">هیچ واحدی برای این پروژه ثبت نشده است.</p>
                    </CardContent>
                </Card>
            ) : (
                <DataTable 
                    columns={subProjectColumns} 
                    data={allUnits} 
                    tableName="subprojects"
                    _showDeleteButton={false}
                    onClickRow={handleRowClick}
                />
            )}
        </div>
    );
}

