import { useState, useEffect } from "react";
import { getTable } from "@/general";
import type { Project } from "../projects/columns";
import { useNavigate, useParams } from "react-router-dom";
import { columns } from "../tickets/columns";
import { DataTable } from "@/components/ui/data-table";
import { PageLoader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";

const UserProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { userId } = useParams();
    useEffect(() => {
        setIsLoading(true);
        getTable(`projects/user/${userId}`, (data: Project[] | {error: {error: string, status: number}}) => {
            console.log({userProjects: data});
            if('error' in data){
                setError(data.error.error);
                setIsLoading(false);
            } else {
                setProjects(data as Project[]);
                setIsLoading(false);
            }
        }, false);
        setIsLoading(false);
    }, [userId]);
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">پروژه های کاربر</h1>
            <div>
                <Button variant="outline" className="gap-2 shadow-md" onClick={() => navigate(`/users/${userId}/assign-project`)}>
                    اعطای پروژه جدید به کاربر
                </Button>
            </div>
            {error ? <div className="text-red-500">{error}</div> : projects.length === 0 ? (
                <div>هیچ پروژه ای ثبت نشده است.</div>
            ) : (
                <DataTable columns={columns} data={projects} />
            )}
            {isLoading && <PageLoader />}
        </div>
    )
}

export default UserProjects;