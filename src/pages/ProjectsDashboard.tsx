import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Search, Terminal, Loader2, MoreVertical, Trash, Download, Edit, GitBranch, FolderGit2, CreditCard, Sparkles, AlertTriangle, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, removeAuthToken, removeUserInfo, getUserInfo } from "@/lib/api";
import { ProjectSummaryResponse, SubscriptionResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateGradient, cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PRICING_PLANS } from "@/lib/plans";

// Plan tiers come from the shared hardcoded pricing source (no public
// "list plans" endpoint). planId maps to the backend Stripe configuration.
const PLAN_TIERS = PRICING_PLANS.map((p) => ({
    planId: p.id,
    name: p.name,
    price: p.price,
    period: `/${p.period}`,
    tagline: p.description,
    recommended: !!p.isPopular,
    features: p.features,
}));


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

    // Billing state
    const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [checkoutPlanId, setCheckoutPlanId] = useState<number | null>(null);
    const [isPortalLoading, setIsPortalLoading] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const data = await api.getCurrentSubscription();
            setSubscription(data);
        } catch (error) {
            console.error("Failed to fetch subscription:", error);
        }
    };

    const handleStartCheckout = async (planId: number) => {
        setCheckoutPlanId(planId);
        try {
            const { checkoutUrl } = await api.createCheckoutSession(planId);
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error("Failed to start checkout:", error);
            toast({
                title: "Error",
                description: "Could not start checkout. Please try again.",
                variant: "destructive",
            });
            setCheckoutPlanId(null);
        }
    };

    const handleManageBilling = async () => {
        setIsPortalLoading(true);
        try {
            const { portalUrl } = await api.createPortalSession();
            window.location.href = portalUrl;
        } catch (error) {
            console.error("Failed to open billing portal:", error);
            toast({
                title: "Error",
                description: "Could not open the billing portal. Please try again.",
                variant: "destructive",
            });
            setIsPortalLoading(false);
        }
    };


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

    const user = getUserInfo();

    const status = subscription?.status;
    const isDemoLocked = status === "DEMO_LOCKED";
    const isSubscribed =
        status === "ACTIVE" || status === "TRIALING" || status === "PAST_DUE";
    const showUpgrade = status === "NONE" || status === "INCOMPLETE";


    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden animate-fade-in flex flex-col">
            {/* Warm ambient background */}
            <div className="absolute inset-0 dev-grid pointer-events-none opacity-70" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-primary/[0.07] rounded-full blur-[160px]" />
                <div className="absolute bottom-[5%] right-[-10%] w-[600px] h-[600px] bg-secondary/[0.05] rounded-full blur-[160px]" />
            </div>

            {/* Header */}
            <header className="relative z-20 border-b border-border/60 bg-background/70 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
                            <img src="/favicon.png" alt="CodeForge" className="w-4.5 h-4.5 object-contain" />
                        </div>
                        <span className="font-display text-lg font-semibold tracking-tight text-foreground">CodeForge</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {subscription && (showUpgrade ? (
                            <Button
                                onClick={() => setIsPlanDialogOpen(true)}
                                className="h-9 gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 text-sm font-medium shadow-[var(--shadow-glow)]"
                            >
                                <Sparkles className="w-4 h-4" /> Upgrade
                            </Button>
                        ) : isSubscribed ? (
                            <Button
                                variant="outline"
                                onClick={handleManageBilling}
                                disabled={isPortalLoading}
                                className="h-9 gap-2 rounded-full px-4 text-sm font-medium border-border/70 hover:bg-muted/50"
                            >
                                {isPortalLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CreditCard className="w-4 h-4" />
                                )}
                                Manage billing
                            </Button>
                        ) : null)}
                    <DropdownMenu>

                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 gap-2 pl-1.5 pr-3 rounded-full hover:bg-muted/50">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">
                                        {(user?.name ? user.name.charAt(0).toUpperCase() : "U")}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name || "Account"}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="flex flex-col space-y-1 p-2">
                                <p className="text-sm font-medium leading-none text-foreground">{user?.name || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground mt-1">{user?.username || ""}</p>
                            </div>
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-12 w-full flex-grow flex flex-col">
                {/* Demo / locked subscription banner */}
                {isDemoLocked && (
                    <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-semibold text-foreground mb-0.5">
                                Demo mode — limited access
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {subscription?.message ||
                                    "Your workspace is running in demo mode. Upgrade to unlock full access."}
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsPlanDialogOpen(true)}
                            className="shrink-0 h-9 gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 text-sm font-medium"
                        >
                            <Sparkles className="w-4 h-4" /> Upgrade
                        </Button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-3">
                        <span className="text-xs font-medium tracking-[0.18em] uppercase text-primary/80">Your workspace</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.05]">
                            Projects
                        </h1>
                        <p className="text-muted-foreground text-base max-w-lg">
                            Build, manage and ship your software — all from one calm, focused workspace.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 h-11 text-sm font-medium shadow-[var(--shadow-glow)]">
                                <Plus className="w-4.5 h-4.5" />
                                New project
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-display text-xl">Create a new project</DialogTitle>
                                <DialogDescription>
                                    Give your project a name to get started. You can change it later.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <label className="text-sm font-medium text-foreground">Project name</label>
                                <Input
                                    placeholder="My awesome project"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                                    autoFocus
                                    className="mt-2 h-11"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">Cancel</Button>
                                <Button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create project
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Rename Dialog */}
                    <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-display text-xl">Rename project</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    value={renameName}
                                    onChange={(e) => setRenameName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                                    className="h-11"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)} className="rounded-full">Cancel</Button>
                                <Button onClick={handleRenameSubmit} disabled={!renameName.trim() || renameName === projectToRename?.name} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Plan Selection Dialog */}
                    <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl">Choose your plan</DialogTitle>
                                <DialogDescription>
                                    Upgrade to unlock more projects, AI usage and faster builds.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                                {PLAN_TIERS.map((tier) => {
                                    const isLoading = checkoutPlanId === tier.planId;
                                    return (
                                        <div
                                            key={tier.planId}
                                            className={cn(
                                                "relative rounded-2xl border bg-card/80 p-6 flex flex-col",
                                                tier.recommended
                                                    ? "border-primary/50 ring-1 ring-primary/30 shadow-[var(--shadow-glow)]"
                                                    : "border-border/70"
                                            )}
                                        >
                                            {tier.recommended && (
                                                <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                                                    <Zap className="w-3 h-3" /> Popular
                                                </span>
                                            )}
                                            <h3 className="font-display text-lg font-semibold text-foreground">{tier.name}</h3>
                                            <div className="mt-2 flex items-baseline gap-1">
                                                <span className="font-display text-3xl font-semibold text-foreground">{tier.price}</span>
                                                <span className="text-sm text-muted-foreground">{tier.period}</span>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">{tier.tagline}</p>
                                            <ul className="mt-5 space-y-2.5 flex-1">
                                                {tier.features.map((feature) => (
                                                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground/90">
                                                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                onClick={() => handleStartCheckout(tier.planId)}
                                                disabled={checkoutPlanId !== null}
                                                className={cn(
                                                    "mt-6 w-full rounded-full h-11 text-sm font-medium",
                                                    tier.recommended
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                        : "bg-foreground/90 text-background hover:bg-foreground"
                                                )}
                                            >
                                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Choose {tier.name}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>


                {/* Search */}
                <div className="relative mb-8 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-11 h-11 rounded-full bg-card/70 border-border/70"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading your projects…</span>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/40 max-w-lg mx-auto p-10">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mx-auto mb-5">
                            <FolderGit2 className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                            {searchQuery ? "No matching projects" : "No projects yet"}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            {searchQuery ? "Try a different search term." : "Create your first project to get started."}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setIsDialogOpen(true)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 h-11">
                                <Plus className="w-4 h-4 mr-2" /> Create project
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredProjects.map((project) => (
                            <Card
                                key={project.id}
                                className="group cursor-pointer rounded-2xl overflow-hidden border border-border/70 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_48px_-18px_hsl(156_50%_2%/0.7)] flex flex-col p-5"
                                onClick={() => navigate(`/projects/${project.id}`)}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md border border-white/10 overflow-hidden"
                                        style={generateGradient(project.name)}
                                    >
                                        <span className="text-sm font-bold tracking-wide text-white drop-shadow">
                                            {getInitials(project.name)}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-display text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                            {project.name}
                                        </h3>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <GitBranch className="w-3 h-3" /> main
                                        </span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1 -mt-1 text-muted-foreground hover:text-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => handleRenameClick(e, project)} className="cursor-pointer">
                                                <Edit className="w-4 h-4 mr-2" /> Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => handleDownloadProject(e, project.id)} className="cursor-pointer">
                                                <Download className="w-4 h-4 mr-2" /> Download
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={(e) => handleDeleteProject(e, project.id)}>
                                                <Trash className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/60">
                                    {project.role && (
                                        <span className={cn(
                                            "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                                            project.role === 'OWNER' ? "bg-primary/10 text-primary border-primary/20" :
                                                project.role === 'EDITOR' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                    "bg-muted text-muted-foreground border-border"
                                        )}>
                                            {project.role}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
