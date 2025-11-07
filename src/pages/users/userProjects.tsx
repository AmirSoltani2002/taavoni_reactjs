import { useState, useEffect, useMemo, useCallback } from "react";
import { getTable, updateTableRow } from "@/general";
import type { SubProject } from "../projects/columns";
import { useNavigate, useParams } from "react-router-dom";
import { subProjectColumns } from "../projects/columns";
import { DataTable } from "@/components/ui/data-table";
import { PageLoader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import type { User } from "./columns";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface UserProjectsProps {
    user?: User | null;
    isSelf?: boolean;
    isAdmin?: boolean;
}
const UserProjects = ({ user, isSelf = false, isAdmin = false }: UserProjectsProps) => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<SubProject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { userId } = useParams();

    const loadProjects = useCallback(() => {
        setIsLoading(true);
        getTable('subprojects' + (isSelf ? '/profile' : '/user/' + userId), (data: SubProject[] | {error: {error: string, status: number}}) => {
            if('error' in data){
                setError(data.error.error);
                setIsLoading(false);
            } else {
                setProjects(data as SubProject[]);
                setIsLoading(false);
            }
        }, false);
    }, [userId, isSelf]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleUnassign = useCallback(async (subProject: SubProject) => {
        if(!subProject.id){
            toast.error('خطا: شناسه واحد یافت نشد');
            return;
        }
        
        updateTableRow('subprojects', subProject.id, {userId: null}, (data: SubProject | {error?: any}) => {
            if(data && 'id' in data && data.id && data.userId === null){
                toast.success('واحد با موفقیت واگذار شد');
                loadProjects();
            } else if(data && 'id' in data && data.id && data.userId !== null){
                toast.success('واحد قابل واگذاری نیست');
            } else {
                toast.error('خطایی رخ داده است ' + JSON.stringify(data));
            }
        });
    }, [loadProjects]);

    const handleRowClick = useCallback((row: SubProject) => {
        if (isAdmin && !isSelf && row.id && userId) {
            navigate(`/users/${userId}/assign-project/${row.id}`);
        }
    }, [isAdmin, isSelf, navigate, userId]);

    const tableOptions = useMemo(() => {
        if(!isAdmin || isSelf){
            return undefined;
        }
        
        return [
            {
                title: <div className="flex items-center gap-2 text-red-500">
                    <Trash2 />
                    <span>واگذاری واحد</span>
                </div>,
                onClick: handleUnassign,
            }
        ];
    }, [isAdmin, isSelf, handleUnassign]);
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">
                {isSelf ? 'پروژه های شما' : `پروژه های ${user?.name && user?.lastName ? `${user.name} ${user.lastName}` : user?.name || user?.lastName || 'کاربر'}`}
            </h1>
            {isAdmin && !isSelf && <div>
                <Button variant="outline" className="gap-2 shadow-md" onClick={() => navigate(isSelf ? `/users/${userId}/assign-project` : `/users/${user?.id}/assign-project`)}>
                    اعطای پروژه جدید به کاربر
                </Button>
            </div>}
            {error ? <div className="text-red-500">{error}</div> : projects.length === 0 ? (
                <div>هیچ پروژه ای ثبت نشده است.</div>
            ) : (
                <DataTable 
                    columns={subProjectColumns} 
                    data={projects} 
                    tableName="subprojects"
                    onRefresh={loadProjects}
                    options={tableOptions}
                    _showDeleteButton={false}
                    onClickRow={isAdmin && !isSelf ? handleRowClick : undefined}
                />
            )}
            {isLoading && <PageLoader />}
        </div>
    )
}

export default UserProjects;