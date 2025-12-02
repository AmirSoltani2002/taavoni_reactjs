import { columns, type Score } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable } from "@/general"
import { useEffect, useState, useMemo } from "react"
import type { User } from "../users/columns"
import type { Project } from "../projects/columns"
import { Award } from "lucide-react"
import { PageLoader } from "@/components/ui/loader"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { UserSelect } from "@/components/user-select"

export default function ScoresList() {
    const [data, setData] = useState<Score[]>([])
    const [userInfo, setUserInfo] = useState<User>()
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
    const [minArea, setMinArea] = useState<number | ''>('')
    const [maxArea, setMaxArea] = useState<number | ''>('')
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [projects, setProjects] = useState<Project[]>([])

    useEffect(() => {
        getTable('users/profile', (user) => {
            setUserInfo(user);
            const isAdmin = ['admin', 'system'].includes(user?.type || '');
            
            if (isAdmin) {
                // Fetch all users first, then load scores
                getTable('users', (usersData: User[] | {error?: any}) => {
                    if (usersData && !('error' in usersData)) {
                        const users = Array.isArray(usersData) ? usersData : [];
                        setAllUsers(users);
                        // After users are loaded, fetch scores
                        fetchScoresForUsers(users);
                    } else {
                        setAllUsers([]);
                        setIsLoading(false);
                    }
                }, false);
                
                // Fetch all projects
                getTable('projects/all/name', (projectsData) => {
                    setProjects(projectsData || []);
                }, false);
            } else {
                setIsLoading(false);
            }
        });
    }, [])

    const refreshData = () => {
        setIsLoading(true);
        // If we don't have users yet, fetch them first
        if (allUsers.length === 0) {
            getTable('users', (usersData: User[] | {error?: any}) => {
                if (usersData && !('error' in usersData) && Array.isArray(usersData)) {
                    setAllUsers(usersData);
                    fetchScoresForUsers(usersData);
                } else {
                    setIsLoading(false);
                }
            }, false);
        } else {
            fetchScoresForUsers(allUsers);
        }
    }

    const fetchScoresForUsers = (users: User[]) => {
        setIsLoading(true);
        const allScores: Score[] = [];
        let completedRequests = 0;
        
        if (users.length === 0) {
            setIsLoading(false);
            setData([]);
            return;
        }
        
        users.forEach((user) => {
            if (!user.id) return;
            
            getTable(`transaction/score?userId=${user.id}`, (scoreData: any) => {
                try {
                    if (!scoreData || typeof scoreData !== "object") {
                        completedRequests++;
                        if (completedRequests === users.length) {
                            setData(allScores);
                            setIsLoading(false);
                        }
                        return;
                    }
                    
                    const entries = Object.entries(scoreData) as [string, any][];
                    entries
                        .filter(([key]) => key !== "userInfo")
                        .forEach(([key, value]) => {
                            const v = value as any;
                            const projectName = v?.presellingInfo?.project?.name || "پروژه";
                            const area = v?.presellingInfo?.area as number | undefined;
                            const score = typeof v?.score === "string" ? v.score : String(v?.score ?? "");
                            
                            if (score) {
                                // Generate a unique numeric id from userId, projectId, area, and index
                                const projectId = v?.presellingInfo?.project?.id || 0;
                                // Use a hash of the key string to ensure uniqueness
                                const keyHash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                const uniqueId = ((user.id || 0) * 1000000) + (projectId * 1000) + (area || 0) + (keyHash % 1000);
                                allScores.push({
                                    id: uniqueId,
                                    userId: user.id,
                                    userName: `${user.name || ''} ${user.lastName || ''}`.trim(),
                                    projectName,
                                    area,
                                    score,
                                    user,
                                    projectId,
                                });
                            }
                        });
                    
                    completedRequests++;
                    if (completedRequests === users.length) {
                        setData(allScores);
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error(`Error processing scores for user ${user.id}:`, error);
                    completedRequests++;
                    if (completedRequests === users.length) {
                        setData(allScores);
                        setIsLoading(false);
                    }
                }
            }, false);
        });
    }


    // Get unique projects from scores
    const uniqueProjects = useMemo(() => {
        const projectMap = new Map<number, Project>();
        data.forEach(score => {
            if (score.projectId && score.projectName) {
                projectMap.set(score.projectId, {
                    id: score.projectId,
                    name: score.projectName,
                } as Project);
            }
        });
        return Array.from(projectMap.values());
    }, [data]);

    // Filter scores by selected filters
    const filteredData = useMemo(() => {
        let filtered = data;

        // Filter by user
        if (selectedUserId) {
            filtered = filtered.filter(score => {
                return score.userId === selectedUserId;
            });
        }

        // Filter by project
        if (selectedProjectId) {
            filtered = filtered.filter(score => {
                return score.projectId === selectedProjectId;
            });
        }

        // Filter by area range
        if (minArea || maxArea) {
            filtered = filtered.filter(score => {
                if (!score.area) return false;
                const area = score.area;
                const min = minArea ? Number(minArea) : 0;
                const max = maxArea ? Number(maxArea) : Infinity;
                return area >= min && area <= max;
            });
        }

        return filtered;
    }, [data, selectedUserId, selectedProjectId, minArea, maxArea]);

    // Get projects list (use uniqueProjects if admin hasn't loaded projects yet, otherwise use projects)
    const availableProjects = useMemo(() => {
        if (projects.length > 0) {
            return projects;
        }
        return uniqueProjects;
    }, [projects, uniqueProjects]);

    // Get users list
    const availableUsers = useMemo(() => {
        return allUsers;
    }, [allUsers]);

    // Check if user is admin
    const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">دسترسی محدود</h1>
                    <p className="text-slate-600">شما دسترسی به این صفحه را ندارید.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto py-8 px-4">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                                <Award className="w-10 h-10 text-yellow-600" />
                                امتیازات
                            </h1>
                            <p className="text-slate-600 text-lg">
                                مشاهده و مدیریت امتیازات کاربران برای پروژه‌ها
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* User Filter */}
                            {availableUsers.length > 0 && (
                                <UserSelect
                                    users={availableUsers}
                                    selectedUserId={selectedUserId}
                                    onUserSelect={(userId) => setSelectedUserId(userId)}
                                    placeholder="همه کاربران"
                                    label="فیلتر بر اساس کاربر"
                                    showAllOption={true}
                                />
                            )}

                            {/* Project Filter */}
                            {availableProjects.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="projectFilter">فیلتر بر اساس پروژه</Label>
                                    <select
                                        id="projectFilter"
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : '')}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">همه پروژه‌ها</option>
                                        {availableProjects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Area Filter */}
                            <div className="space-y-2">
                                <Label>فیلتر بر اساس مساحت (متر مربع)</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="minArea" className="text-xs text-muted-foreground">حداقل</Label>
                                        <Input
                                            id="minArea"
                                            type="number"
                                            value={minArea}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setMinArea(value === '' ? '' : Number(value));
                                            }}
                                            placeholder="حداقل مساحت"
                                            inputMode="numeric"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="maxArea" className="text-xs text-muted-foreground">حداکثر</Label>
                                        <Input
                                            id="maxArea"
                                            type="number"
                                            value={maxArea}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setMaxArea(value === '' ? '' : Number(value));
                                            }}
                                            placeholder="حداکثر مساحت"
                                            inputMode="numeric"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border">
                        <DataTable 
                            columns={columns} 
                            data={filteredData} 
                            onRefresh={refreshData}
                            _showDeleteButton={false}
                        />
                    </div>
                </div>
                {isLoading && <PageLoader />}
            </div>
        </div>
    )
}

