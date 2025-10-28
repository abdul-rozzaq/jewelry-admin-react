import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Search, Plus, Edit, Trash2, Loader2, FolderKanban } from "lucide-react";
import { toast } from "@/src/hooks/use-toast";
import {
  useGetProjectsQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  ProjectsApi,
} from "@/src/lib/service/projectsApi";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import type Project from "@/src/types/project";

export default function ProjectsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");

  const { data: projects = [], isLoading, error } = useGetProjectsQuery(undefined);
  const [addProject] = useAddProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({ name: "", description: "", is_active: true });

  const resetForm = () => setFormData({ name: "", description: "", is_active: true });

  const filteredProjects = projects.filter((project: Project) => {
    const search = searchTerm?.toLowerCase() ?? "";
    return project.name.toLowerCase().includes(search) || project.description?.toLowerCase().includes(search);
  });

  const handleCreateProject = async () => {
    if (!formData.name) {
      toast({
        title: t("projects.common.error"),
        description: t("projects.validation.nameRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      await addProject(formData).unwrap();
      resetForm();
      setIsCreateDialogOpen(false);

      toast({ title: t("projects.common.success"), description: t("projects.messages.created") });
      dispatch(ProjectsApi.util.resetApiState());
    } catch (error) {
      toast({ title: t("projects.common.error"), description: t("projects.messages.createError"), variant: "destructive" });
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setFormData({ name: project.name, description: project.description ?? "", is_active: project.is_active });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;
    if (!formData.name) {
      toast({ title: t("projects.common.error"), description: t("projects.validation.nameRequired"), variant: "destructive" });
      return;
    }

    try {
      await updateProject({ id: selectedProject.id, ...formData }).unwrap();
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedProject(null);

      toast({ title: t("projects.common.success"), description: t("projects.messages.updated") });
      dispatch(ProjectsApi.util.resetApiState());
    } catch (error) {
      toast({ title: t("projects.common.error"), description: t("projects.messages.updateError"), variant: "destructive" });
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await deleteProject(id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      toast({ title: t("projects.common.success"), description: t("projects.messages.deleted") });
      dispatch(ProjectsApi.util.resetApiState());
    } catch (error) {
      toast({ title: t("projects.common.error"), description: t("projects.messages.deleteError"), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t("projects.common.loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{t("projects.errors.loadError")}</p>
            <Button onClick={() => window.location.reload()}>{t("projects.common.retry")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("projects.title")}</h1>
          <p className="text-muted-foreground">{t("projects.subtitle")}</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-0.5" />
              {t("projects.actions.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t("projects.dialogs.create.title")}</DialogTitle>
              <DialogDescription>{t("projects.dialogs.create.description")}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("projects.form.name")} *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">{t("projects.form.description")}</Label>
                <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t("projects.common.cancel")}
              </Button>
              <Button onClick={handleCreateProject}>{t("projects.common.create")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("projects.search.placeholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("projects.table.title")}</CardTitle>
          <CardDescription>{t("projects.table.description", { count: projects.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("projects.empty.title")}</h3>
              <p className="text-muted-foreground mb-4">{searchTerm ? t("projects.empty.noResults") : t("projects.empty.noData")}</p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  {t("projects.empty.clearSearch")}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("projects.table.columns.name")}</TableHead>
                  <TableHead>{t("projects.table.columns.description")}</TableHead>
                  <TableHead>{t("projects.table.columns.isActive")}</TableHead>
                  <TableHead>{t("projects.table.columns.createdAt")}</TableHead>
                  <TableHead className="text-right">{t("projects.table.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project: Project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono text-sm">PRJ-{project.id}</TableCell>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.description || "-"}</TableCell>
                    <TableCell>
                      {project.is_active ? (
                        <span className="text-green-600 font-semibold">{t("projects.status.active")}</span>
                      ) : (
                        <span className="text-red-600 font-semibold">{t("projects.status.inactive")}</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(project.created_at).toLocaleDateString("uz-UZ")}</TableCell>
                    <TableCell className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                        <Edit className="h-4 w-4 mr-1" /> {t("projects.actions.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> {t("projects.actions.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("projects.dialogs.edit.title")}</DialogTitle>
            <DialogDescription>{t("projects.dialogs.edit.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t("projects.form.name")} *</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">{t("projects.form.description")}</Label>
              <Input id="edit-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedProject(null);
              }}
            >
              {t("projects.common.cancel")}
            </Button>
            <Button onClick={handleUpdateProject}>{t("projects.common.update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("projects.dialogs.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("projects.dialogs.delete.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("projects.common.no")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedProject && handleDeleteProject(selectedProject.id)} className="bg-red-600 hover:bg-red-700">
              {t("projects.dialogs.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
