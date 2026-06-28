import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Plus,
  LayoutGrid,
  Settings as SettingsIcon,
  LogOut,
  Keyboard,
  FolderGit2,
} from "lucide-react";
import { api } from "@/lib/api";
import { removeAuthToken, removeUserInfo } from "@/lib/api";
import type { ProjectSummaryResponse } from "@/lib/types";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummaryResponse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    api
      .getProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [open]);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 0);
  }, []);

  const signOut = () => {
    removeAuthToken();
    removeUserInfo();
    navigate("/login");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search projects or run a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => navigate("/projects?new=1"))}>
            <Plus className="mr-2 h-4 w-4" /> New project
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/projects"))}>
            <LayoutGrid className="mr-2 h-4 w-4" /> Go to projects
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/settings"))}>
            <SettingsIcon className="mr-2 h-4 w-4" /> Open settings
          </CommandItem>
          <CommandItem onSelect={() => run(() => window.dispatchEvent(new Event("open-shortcuts")))}>
            <Keyboard className="mr-2 h-4 w-4" /> Keyboard shortcuts
          </CommandItem>
        </CommandGroup>
        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {projects.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`project ${p.name}`}
                  onSelect={() => run(() => navigate(`/projects/${p.id}`))}
                >
                  <FolderGit2 className="mr-2 h-4 w-4" /> {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => run(signOut)}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
