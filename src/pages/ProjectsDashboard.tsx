import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Search, Folder, Loader2, MoreVertical, Trash, Download, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, removeAuthToken, removeUserInfo, getUserInfo } from "@/lib/api";
import { ProjectSummaryResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateGradient, cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

export function ProjectsDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [projects, setProjects] = useState<ProjectSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Rename state
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [projectToRename, setProjectToRename] = useState<ProjectSummaryResponse | null>(null);
    const [renameName, setRenameName] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            toast({
                title: "Error",
                description: "Failed to load projects. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        setIsCreating(true);
        try {
            const newProject = await api.createProject(newProjectName);
            setProjects([newProject, ...projects]);
            setNewProjectName("");
            setIsDialogOpen(false);
            toast({
                title: "Success",
                description: "Project created successfully",
            });
            // Optionally navigate to the new project immediately
            // navigate(`/projects/${newProject.id}`);
        } catch (error) {
            console.error("Failed to create project:", error);
            toast({
                title: "Error",
                description: "Failed to create project",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

        try {
            await api.deleteProject(projectId.toString());
            setProjects(projects.filter(p => p.id !== projectId));
            toast({ title: "Success", description: "Project deleted successfully" });
        } catch (error) {
            console.error("Failed to delete:", error);
            toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
        }
    };

    const handleDownloadProject = async (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        try {
            const blob = await api.downloadProjectZip(projectId.toString());
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project-${projectId}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "Success", description: "Download started" });
        } catch (error) {
            console.error("Failed to download:", error);
            toast({ title: "Error", description: "Failed to download project", variant: "destructive" });
        }
    };

    const handleRenameClick = (e: React.MouseEvent, project: ProjectSummaryResponse) => {
        e.stopPropagation();
        setProjectToRename(project);
        setRenameName(project.name);
        setIsRenameDialogOpen(true);
    };

    const handleRenameSubmit = async () => {
        if (!projectToRename || !renameName.trim()) return;

        try {
            await api.updateProject(projectToRename.id.toString(), renameName);
            setProjects(projects.map(p => p.id === projectToRename.id ? { ...p, name: renameName } : p));
            setIsRenameDialogOpen(false);
            setProjectToRename(null);
            toast({ title: "Success", description: "Project renamed successfully" });
        } catch (error) {
            console.error("Failed to rename:", error);
            toast({ title: "Error", description: "Failed to rename project", variant: "destructive" });
        }
    };

    const handleLogout = () => {
        removeAuthToken();
        removeUserInfo();
        navigate("/login");
    };

    const filteredProjects = projects.filter((project) => {
        const query = (searchQuery || "").toLowerCase().trim();
        if (!query) return true;
        const terms = query.split(/\s+/);
        const name = (project.name || "").toLowerCase();
        return terms.every((term) => name.includes(term));
    });

    return (
        <div className="min-h-screen bg-[#0a1020] relative overflow-x-hidden animate-fade-in flex flex-col">
            {/* Layer 3: Softer grid (25% opacity) */}
            <div className="absolute inset-0 dev-grid opacity-25 pointer-events-none" />

            {/* Layer 2: Stronger ambient lighting (indigo, violet, cyan) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[-10%] w-[900px] h-[900px] bg-indigo-500/[0.08] rounded-full blur-[140px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[900px] h-[900px] bg-violet-600/[0.08] rounded-full blur-[160px]" />
                <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-20 bg-[#070a13]/60 backdrop-blur-md border-b border-white/[0.06] select-none">
                <div className="max-w-[1600px] mx-auto flex h-14 items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-2 font-bold text-lg text-white">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Folder className="w-5 h-5 text-indigo-400" />
                        </div>
                        CodeForge
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-white/[0.06] hover:bg-white/[0.04] transition-all">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-indigo-500/10 text-indigo-400 font-semibold">
                                        {(() => {
                                            const userInfo = getUserInfo();
                                            if (userInfo?.name) {
                                                return userInfo.name.charAt(0).toUpperCase();
                                            }
                                            return "U";
                                        })()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#0b0f19] border border-white/[0.08] text-slate-200">
                            <div className="flex flex-col space-y-1 p-2">
                                <p className="text-sm font-medium leading-none text-white">
                                    {getUserInfo()?.name || "User"}
                                </p>
                                <p className="text-xs leading-none text-slate-400">
                                    {getUserInfo()?.username || ""}
                                </p>
                            </div>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-10 py-8 w-full flex-grow flex flex-col">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6 pb-4 border-b border-white/[0.04]">
                    <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-[0.3em] text-indigo-400 font-semibold block">
                            AI ENGINEERING WORKSPACE
                        </span>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">
                            Your Projects
                        </h1>
                        <p className="text-slate-400 text-sm max-w-xl">
                            Build, manage and organize your software projects from one intelligent workspace.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-gradient-to-r from-indigo-500 via-violet-600 to-pink-500 hover:shadow-[0_10px_35px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-300 rounded-xl font-semibold border-none px-5 h-11 text-white">
                                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                                New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0b0f19] border border-white/[0.08] text-white">
                            <DialogHeader>
                                <DialogTitle className="text-white">Create New Project</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Give your project a name to get started. You can change this later.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    placeholder="My Awesome Project"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                                    className="bg-[#05070c] border-white/[0.08] text-white focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 placeholder:text-muted-foreground/35"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/[0.08] hover:bg-white/[0.04] text-slate-200">
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()} className="bg-gradient-to-r from-indigo-500 via-violet-600 to-pink-500 border-none text-white">
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Project
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Rename Dialog */}
                    <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                        <DialogContent className="bg-[#0b0f19] border border-white/[0.08] text-white">
                            <DialogHeader>
                                <DialogTitle className="text-white">Rename Project</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    value={renameName}
                                    onChange={(e) => setRenameName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                                    className="bg-[#05070c] border-white/[0.08] text-white focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)} className="border-white/[0.08] hover:bg-white/[0.04] text-slate-200">Cancel</Button>
                                <Button onClick={handleRenameSubmit} disabled={!renameName.trim() || renameName === projectToRename?.name} className="bg-gradient-to-r from-indigo-500 via-violet-600 to-pink-500 border-none text-white">
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-12 h-12 bg-[#0b1020]/70 backdrop-blur-sm border-white/[0.08] text-white placeholder:text-muted-foreground/35 focus-visible:ring-1 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0 focus-visible:border-indigo-500/40 rounded-xl text-sm transition-all duration-300 focus:shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/[0.08] rounded-2xl bg-[#0b0f19]/35 max-w-xl mx-auto p-8 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {searchQuery ? "No Projects Found" : "No Projects Yet"}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6 font-medium">
                            {searchQuery ? "Try a different search query." : "Create your first project to get started."}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-indigo-500 via-violet-600 to-pink-500 hover:shadow-[0_10px_35px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-300 rounded-xl font-semibold border-none px-5 h-11 text-white">
                                Create Project
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProjects.map((project, index) => {
                            return (
                                <Card
                                    key={project.id}
                                    className="group cursor-pointer premium-card rounded-2xl overflow-hidden shadow-xl border border-white/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-indigo-500/35 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col h-full bg-[#0b0f19]/90 relative"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    <CardHeader className="p-0 flex-shrink-0">
                                        <div className="h-44 md:h-52 w-full relative overflow-hidden rounded-t-2xl flex items-center justify-center select-none">
                                            {/* Style 1: Indigo -> Violet mesh gradient, soft floating glow, subtle glass shapes */}
                                            {index % 4 === 0 && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                                                    <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-violet-400/30 blur-2xl animate-pulse" />
                                                    <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/[0.06] backdrop-blur-[2px] border border-white/[0.05]" />
                                                    <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/[0.04] backdrop-blur-[1px] border border-white/[0.03]" />
                                                </div>
                                            )}
                                            {/* Style 2: Cyan -> Blue aurora-style gradient, layered translucent circles */}
                                            {index % 4 === 1 && (
                                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700">
                                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent blur-xl" />
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cyan-400/10" />
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-cyan-400/15" />
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-cyan-400/20" />
                                                </div>
                                            )}
                                            {/* Style 3: Emerald -> Teal gradient, soft blurred abstract shapes */}
                                            {index % 4 === 2 && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
                                                    <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-emerald-400/20 blur-xl" />
                                                    <div className="absolute bottom-6 right-6 w-20 h-20 rounded-full bg-teal-300/15 blur-xl" />
                                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-2xl bg-emerald-800/40 rotate-45 blur-md border border-white/[0.05]" />
                                                </div>
                                            )}
                                            {/* Style 4: Pink -> Purple gradient, floating light particles */}
                                            {index % 4 === 3 && (
                                                <div className="absolute inset-0 bg-gradient-to-bl from-pink-600 via-fuchsia-600 to-purple-700">
                                                    <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-pink-200/40 shadow-[0_0_8px_rgba(255,182,193,0.8)]" />
                                                    <div className="absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-fuchsia-200/50 shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
                                                    <div className="absolute bottom-1/3 left-1/2 w-1 h-1 rounded-full bg-purple-200/40 shadow-[0_0_6px_rgba(230,190,255,0.8)]" />
                                                    <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-pink-300/30 blur-[1px]" />
                                                    <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-pink-400/10 blur-xl" />
                                                </div>
                                            )}

                                            {/* Centered glassmorphic initials badge */}
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <div className="px-5 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/[0.12] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center justify-center min-w-[70px] min-h-[70px]">
                                                    <span className="text-3xl md:text-4xl font-extrabold tracking-wider text-white drop-shadow-sm select-none">
                                                        {getInitials(project.name)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="p-5 flex-1 flex flex-col gap-3 justify-between">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                {project.name}
                                            </CardTitle>
                                            
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all active:scale-95">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#0b0f19] border border-white/[0.08] text-slate-200">
                                                    <DropdownMenuItem onClick={(e) => handleRenameClick(e, project)} className="hover:bg-white/[0.04] cursor-pointer">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => handleDownloadProject(e, project.id)} className="hover:bg-white/[0.04] cursor-pointer">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500 focus:text-red-500 hover:bg-red-500/10 cursor-pointer" onClick={(e) => handleDeleteProject(e, project.id)}>
                                                        <Trash className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.03]">
                                            {project.role && (
                                                <div className="flex">
                                                    <span className={cn(
                                                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                                                        project.role === 'OWNER' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                            project.role === 'EDITOR' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                                "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                    )}>
                                                        {project.role}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Preserving exact original date rendering logic, displayed value and format */}
                                            <span className="text-[11px] text-slate-500 font-medium font-mono">
                                                Updated {new Date(project.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
