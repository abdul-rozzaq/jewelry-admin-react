import { useState } from "react";
import { useDispatch } from "react-redux";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "@/src/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
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
import {
  useGetMaterialsQuery,
  useAddMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  MaterialsApi,
} from "@/src/lib/service/materialsApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import type Material from "@/src/types/material";
import { unitColors, unitLabels } from "@/src/constants/units";
import { useTranslation } from "react-i18next";

export default function MaterialsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: materials = [],
    isLoading: materialsLoading,
    error: materialsError,
  } = useGetMaterialsQuery({
    search: searchTerm,
  });
  const [addMaterial] = useAddMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "" as "g" | "pcs" | "ct" | "",
  });

  const resetForm = () => {
    setFormData({ name: "", unit: "" });
  };

  const handleCreateMaterial = async () => {
    if (!formData.name || !formData.unit) {
      toast({
        title: t("materials.errors.title"),
        description: t("materials.errors.fillRequired"),
        variant: "destructive",
      });
      return;
    }

    if (materials.some((material: Material) => material.name.toLowerCase() === formData.name.toLowerCase())) {
      toast({
        title: t("materials.errors.title"),
        description: t("materials.errors.nameExists"),
        variant: "destructive",
      });
      return;
    }

    const apiData = {
      name: formData.name,
      unit: formData.unit,
    };

    try {
      await addMaterial(apiData).unwrap();
      resetForm();
      setIsCreateDialogOpen(false);

      toast({
        title: t("materials.success.title"),
        description: t("materials.success.created"),
      });
      dispatch(MaterialsApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("materials.errors.title"),
        description: t("materials.errors.createFailed"),
        variant: "destructive",
      });
    }
  };

  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      unit: material.unit as "g" | "pcs" | "ct" | "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMaterial = async () => {
    if (!selectedMaterial) return;

    if (!formData.name || !formData.unit) {
      toast({
        title: t("materials.errors.title"),
        description: t("materials.errors.fillRequired"),
        variant: "destructive",
      });
      return;
    }

    if (materials.some((material: Material) => material.id !== selectedMaterial.id && material.name.toLowerCase() === formData.name.toLowerCase())) {
      toast({
        title: t("materials.errors.title"),
        description: t("materials.errors.nameExists"),
        variant: "destructive",
      });
      return;
    }

    const apiData = {
      name: formData.name,
      unit: formData.unit,
    };

    try {
      await updateMaterial({ id: selectedMaterial.id, ...apiData }).unwrap();
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedMaterial(null);

      toast({
        title: t("materials.success.title"),
        description: t("materials.success.updated"),
      });
      dispatch(MaterialsApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("materials.errors.title"),
        description: t("materials.errors.updateFailed"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await deleteMaterial(materialId).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedMaterial(null);

      toast({
        title: t("materials.success.title"),
        description: t("materials.success.deleted"),
      });
      dispatch(MaterialsApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("materials.errors.title"),
        description: t("materials.errors.deleteFailed"),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  if (materialsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t("materials.loading")}</span>
        </div>
      </div>
    );
  }

  if (materialsError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{t("materials.errors.loadFailed")}</p>
            <Button onClick={() => window.location.reload()}>{t("materials.actions.retry")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("materials.title")}</h1>
          <p className="text-muted-foreground">{t("materials.subtitle")}</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-0.5" />
              {t("materials.actions.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t("materials.dialogs.create.title")}</DialogTitle>
              <DialogDescription>{t("materials.dialogs.create.description")}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("materials.form.name")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("materials.form.namePlaceholder")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">{t("materials.form.unit")} *</Label>
                <Select value={formData.unit} onValueChange={(value: "g" | "pcs" | "ct") => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("materials.form.unitPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">{t("materials.units.gram")}</SelectItem>
                    <SelectItem value="pcs">{t("materials.units.pieces")}</SelectItem>
                    <SelectItem value="ct">{t("materials.units.carat")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                {t("materials.actions.cancel")}
              </Button>
              <Button onClick={handleCreateMaterial}>{t("materials.actions.create")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("materials.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("materials.table.title")}</CardTitle>
          <CardDescription>{t("materials.table.description", { count: materials.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t("materials.table.columns.name")}</TableHead>
                <TableHead>{t("materials.table.columns.unit")}</TableHead>
                <TableHead>{t("materials.table.columns.createdAt")}</TableHead>
                <TableHead className="text-right">{t("materials.table.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material, index) => (
                <TableRow key={material.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>
                    <Badge className={unitColors[material.unit]}>
                      {unitLabels[material.unit]} ({material.unit})
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(material.created_at).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditMaterial(material)}>
                      <Edit className="h-4 w-4 mr-1" /> {t("materials.actions.edit")}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => confirmDelete(material)}>
                      <Trash2 className="h-4 w-4 mr-1" /> {t("materials.actions.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("materials.dialogs.edit.title")}</DialogTitle>
            <DialogDescription>{t("materials.dialogs.edit.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t("materials.form.name")} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("materials.form.namePlaceholder")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-unit">{t("materials.form.unit")} *</Label>
              <Select value={formData.unit} onValueChange={(value: "g" | "pcs" | "ct") => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("materials.form.unitPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">{t("materials.units.gram")}</SelectItem>
                  <SelectItem value="pcs">{t("materials.units.pieces")}</SelectItem>
                  <SelectItem value="ct">{t("materials.units.carat")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedMaterial(null);
              }}
            >
              {t("materials.actions.cancel")}
            </Button>
            <Button onClick={handleUpdateMaterial}>{t("materials.actions.update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("materials.dialogs.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("materials.dialogs.delete.description", { name: selectedMaterial?.name || "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("materials.dialogs.delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedMaterial && handleDeleteMaterial(selectedMaterial.id)} className="bg-red-600 hover:bg-red-700">
              {t("materials.dialogs.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
