import { useState, useEffect } from "react";
import { getTable } from "@/general";
import type { SubProject } from "../projects/columns";
import { useNavigate, useParams } from "react-router-dom";
import { subProjectColumns } from "../projects/columns";
import { DataTable } from "@/components/ui/data-table";
import { PageLoader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import type { User } from "./columns";

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
    useEffect(() => {
        setIsLoading(true);
        getTable('subprojects' + (isSelf ? '/profile' : '/user/' + userId), (data: SubProject[] | {error: {error: string, status: number}}) => {
            console.log({userProjects: data});
            if('error' in data){
                setError(data.error.error);
                setIsLoading(false);
            } else {
                setProjects(data as SubProject[]);
                setIsLoading(false);
            }
        }, false);
        setIsLoading(false);
    }, [userId]);
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
                <DataTable columns={subProjectColumns} data={projects} />
            )}
            {isLoading && <PageLoader />}
        </div>
    )
}

export default UserProjects;