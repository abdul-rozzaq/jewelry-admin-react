import { ChangeEvent, useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
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
import { Badge } from "@/src/components/ui/badge";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Package2,
  Building2,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "@/src/hooks/use-toast";
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  ProductsApi,
} from "@/src/lib/service/productsApi";
import { useGetMaterialsQuery } from "@/src/lib/service/materialsApi";
import {
  useGetOrganizationsQuery,
  useDownloadOrganizationReportMutation,
  useDownloadProductsCountMatrixMutation,
} from "@/src/lib/service/organizationsApi";
import { useGetProjectsQuery } from "@/src/lib/service/projectsApi";
import { useDispatch } from "react-redux";
import { unitColors, unitLabels } from "@/src/constants/units";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import type Material from "@/src/types/material";
import type Product from "@/src/types/product";
import type Organization from "@/src/types/organization";

import { getCurrentUser } from "@/src/lib/auth";
import { useTranslation } from "react-i18next";

export default function ProductsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user = getCurrentUser();

  const organizationId = user?.organization?.id;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [organizationFilter, setOrganizationFilter] = useState<string>(
    organizationId?.toString() ?? "all"
  );
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useGetProductsQuery(undefined);
  const { data: materials = [], isLoading: materialsLoading } = useGetMaterialsQuery(undefined);
  const { data: organizations = [], isLoading: organizationsLoading } =
    useGetOrganizationsQuery(undefined);
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery(undefined);

  const [addProduct] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [downloadOrganizationReport] = useDownloadOrganizationReportMutation();
  const [downloadProductsCountMatrix] = useDownloadProductsCountMatrixMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDownloadingFullReport, setIsDownloadingFullReport] = useState(false);
  const [isDownloadingCountsReport, setIsDownloadingCountsReport] = useState(false);

  const materialsMap = useMemo(() => {
    const map: Record<number, Material> = {};

    materials.forEach((material: Material) => {
      map[material.id] = material;
    });

    return map;
  }, [materials]);

  const [formData, setFormData] = useState({
    quantity: "",
    material_id: "",
    project_id: "",
    is_composite: false,
    pure_gold: "",
    source_description: "",
  });

  const handleFormInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const resetForm = () =>
    setFormData({
      quantity: "",
      material_id: "",
      project_id: "",
      is_composite: false,
      pure_gold: "",
      source_description: "",
    });

  const isBank = user?.organization?.type === "bank";

  const getSelectedMaterial = (): Material | undefined => {
    return materials.find((m: Material) => m.id.toString() === formData.material_id);
  };

  const getQuantityLabel = () => {
    const material = getSelectedMaterial();

    if (!material) return t("products.form.quantity");

    return `${t("products.form.quantity")} (${unitLabels[material.unit]})`;
  };

  const filteredProducts = products.filter((item: Product) => {
    const qty = Number(item.quantity);
    if (!qty || Number.isNaN(qty)) return false;

    const search = (searchTerm || "").trim().toLowerCase();
    const orgFilterNum = organizationFilter === "all" ? null : Number(organizationFilter);
    const projectFilterNum = projectFilter === "all" ? null : Number(projectFilter);

    if (!search && orgFilterNum == null && projectFilterNum == null) return true;

    if (!search) {
      if (orgFilterNum != null && projectFilterNum != null) {
        return item.organization.id === orgFilterNum && item.project?.id === projectFilterNum;
      }
      if (orgFilterNum != null) return item.organization.id === orgFilterNum;
      if (projectFilterNum != null) return item.project?.id === projectFilterNum;
      return true;
    }

    const materialName = item.material?.name?.toLowerCase() ?? "";
    const organizationName = item.organization?.name?.toLowerCase() ?? "";
    const idStr = item.id?.toString() ?? "";

    const matchesSearch =
      materialName.includes(search) || organizationName.includes(search) || idStr.includes(search);
    if (!matchesSearch) return false;

    if (orgFilterNum != null && item.organization.id !== orgFilterNum) return false;
    if (projectFilterNum != null && item.project?.id !== projectFilterNum) return false;

    return true;
  });

  const handleCreateProducts = async () => {
    if (!formData.quantity || !formData.material_id || !formData.pure_gold) {
      toast({
        title: t("products.common.error"),
        description: t("products.validation.allFieldsRequired"),
        variant: "destructive",
      });
      return;
    }

    const apiData: any = {
      quantity: formData.quantity,
      material_id: Number.parseInt(formData.material_id),
      is_composite: formData.is_composite,
      pure_gold: formData.pure_gold,
      source_description: formData.source_description || null,
    };

    if (formData.project_id) apiData.project_id = Number.parseInt(formData.project_id);

    try {
      await addProduct(apiData).unwrap();

      resetForm();
      setIsCreateDialogOpen(false);

      toast({
        title: t("products.common.success"),
        description: t("products.messages.created"),
      });

      dispatch(ProductsApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("products.common.error"),
        description: t("products.messages.createError"),
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);

    setFormData({
      quantity: product.quantity,
      material_id: product.material.id.toString(),
      project_id: product.project?.id?.toString() ?? "",
      is_composite: product.is_composite,
      pure_gold: product.pure_gold,
      source_description: product.source_description || "",
    });

    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    if (!formData.quantity || !formData.material_id || !formData.pure_gold) {
      toast({
        title: t("products.common.error"),
        description: t("products.validation.allFieldsRequired"),
        variant: "destructive",
      });
      return;
    }

    const apiData: any = {
      quantity: formData.quantity,
      material_id: Number.parseInt(formData.material_id),
      is_composite: formData.is_composite,
      pure_gold: formData.pure_gold,
      source_description: formData.source_description || null,
    };

    if (formData.project_id) apiData.project_id = Number.parseInt(formData.project_id);

    try {
      await updateProduct({ id: selectedProduct.id, ...apiData }).unwrap();
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedProduct(null);

      toast({
        title: t("products.common.success"),
        description: t("products.messages.updated"),
      });
      dispatch(ProductsApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("products.common.error"),
        description: t("products.messages.updateError"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteProducts = async (productId: number) => {
    try {
      await deleteProduct(productId).unwrap();

      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);

      toast({
        title: t("products.common.success"),
        description: t("products.messages.deleted"),
      });
      dispatch(ProductsApi.util.resetApiState());
    } catch (error) {
      toast({
        title: t("products.common.error"),
        description: t("products.messages.deleteError"),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDownloadFullReport = async () => {
    setIsDownloadingFullReport(true);
    try {
      const blob = await downloadOrganizationReport({}).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `organization-report-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: t("products.common.success"),
        description: t("products.reports.fullReportDownloaded"),
      });
    } catch (error) {
      toast({
        title: t("products.common.error"),
        description: t("products.reports.downloadError"),
        variant: "destructive",
      });
    } finally {
      setIsDownloadingFullReport(false);
    }
  };

  const handleDownloadCountsReport = async () => {
    setIsDownloadingCountsReport(true);
    try {
      const blob = await downloadProductsCountMatrix({}).unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `products-count-matrix-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: t("products.common.success"),
        description: t("products.reports.countsReportDownloaded"),
      });
    } catch (error) {
      toast({
        title: t("products.common.error"),
        description: t("products.reports.downloadError"),
        variant: "destructive",
      });
    } finally {
      setIsDownloadingCountsReport(false);
    }
  };

  if (productsLoading || materialsLoading || organizationsLoading || projectsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t("products.common.loading")}</span>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{t("products.errors.loadError")}</p>
            <Button onClick={() => window.location.reload()}>{t("products.common.retry")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("products.title")}</h1>
          <p className="text-muted-foreground">{t("products.subtitle")}</p>
        </div>

        {isBank && (
          <div className="flex items-center gap-2">
            {/* Download Reports */}
            <div className="flex items-center gap-2 mr-4">
              <Button
                variant="outline"
                onClick={handleDownloadFullReport}
                disabled={isDownloadingFullReport}
                className="flex items-center gap-2"
              >
                {isDownloadingFullReport ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {t("products.reports.downloadFullReport")}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCountsReport}
                disabled={isDownloadingCountsReport}
                className="flex items-center gap-2"
              >
                {isDownloadingCountsReport ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                {t("products.reports.downloadCountsReport")}
              </Button>
            </div>

            {/* Create Product Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-0.5" />
                  {t("products.actions.create")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{t("products.dialogs.create.title")}</DialogTitle>
                  <DialogDescription>{t("products.dialogs.create.description")}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="material">{t("products.form.material")} *</Label>
                    <Select
                      value={formData.material_id}
                      onValueChange={(value) => {
                        const material = materialsMap[Number(value)];

                        setFormData({
                          ...formData,
                          material_id: value,
                          quantity: "",
                          pure_gold: "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("products.form.selectMaterial")} />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.length === 0 ? (
                          <SelectItem value="no-materials" disabled>
                            {t("products.form.noMaterials")}
                          </SelectItem>
                        ) : (
                          materials.map((material: Material) => (
                            <SelectItem key={material.id} value={material.id.toString()}>
                              {material.name} ({unitLabels[material.unit]})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="project">{t("products.form.project")}</Label>
                    <Select
                      value={formData.project_id || "none"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, project_id: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("products.form.selectProject")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("products.form.noProject")}</SelectItem>
                        {projects.map((project: any) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="quantity">{getQuantityLabel()} *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={handleFormInputChange}
                      placeholder={`${t("products.form.example")}: ${
                        getSelectedMaterial()?.unit === "g" ? "100.5" : "10"
                      }`}
                      disabled={!formData.material_id}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="is_composite">{t("products.form.composite")}</Label>
                    <Select
                      value={formData.is_composite.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, is_composite: value === "true" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("products.form.selectComposite")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">{t("products.table.composite.no")}</SelectItem>
                        <SelectItem value="true">{t("products.table.composite.yes")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.is_composite && (
                    <div className="grid gap-2">
                      <Label htmlFor="pure_gold">{t("products.form.pureGold")} *</Label>
                      <Input
                        id="pure_gold"
                        type="number"
                        step="0.01"
                        value={formData.pure_gold}
                        onChange={handleFormInputChange}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="source_description">
                      {t("products.form.sourceDescription")}
                    </Label>
                    <Input
                      id="source_description"
                      type="text"
                      value={formData.source_description}
                      onChange={handleFormInputChange}
                      placeholder={t("products.form.sourceDescriptionPlaceholder")}
                    />
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
                    {t("products.common.cancel")}
                  </Button>
                  <Button onClick={handleCreateProducts}>{t("products.common.create")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("products.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {isBank && (
          <div className="flex items-center space-x-2">
            <Select
              value={organizationFilter?.toString() ?? ""}
              onValueChange={(value) => setOrganizationFilter(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("products.filters.byOrganization")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("products.filters.all")}</SelectItem>
                {organizations.map((organization: Organization) => (
                  <SelectItem key={organization.id} value={organization.id.toString()}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={projectFilter ?? "all"}
              onValueChange={(value) => setProjectFilter(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("products.filters.byProject")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("products.filters.allProjects")}</SelectItem>
                {projects.map((project: any) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("products.table.title")}</CardTitle>
          <CardDescription>
            {t("products.table.description", { count: products.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("products.empty.title")}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? t("products.empty.noResults") : t("products.empty.noData")}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  {t("products.empty.clearSearch")}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("products.table.columns.id")}</TableHead>
                  <TableHead>{t("products.table.columns.material")}</TableHead>
                  <TableHead>{t("products.table.columns.quantity")}</TableHead>
                  <TableHead>{t("products.table.columns.pureGold")}</TableHead>
                  <TableHead>{t("products.table.columns.purity")}</TableHead>
                  <TableHead>{t("products.table.columns.karat")}</TableHead>
                  {/* <TableHead>{t("products.table.columns.composite")}</TableHead> */}
                  <TableHead>{t("products.table.columns.project")}</TableHead>
                  <TableHead>{t("products.table.columns.organization")}</TableHead>
                  <TableHead>{t("products.table.columns.createdAt")}</TableHead>
                  <TableHead className="text-right">
                    {t("products.table.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((item: Product) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">INV-{item.id}</TableCell>
                    <TableCell className="font-medium">{item.material.name}</TableCell>
                    <TableCell>
                      <Badge className={unitColors[item.material.unit]}>
                        {item.quantity} {unitLabels[item.material.unit]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={unitColors[item.material.unit]}>
                        {item.pure_gold} {unitLabels[item.material.unit]}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.purity}%</TableCell>
                    <TableCell>{item.karat}K</TableCell>

                    {/* <TableCell>
                      <Badge variant={item.is_composite ? "default" : "secondary"}>
                        {item.is_composite ? t("products.table.composite.yes") : t("products.table.composite.no")}
                      </Badge>
                    </TableCell> */}
                    <TableCell>{item.project ? item.project.name : ""}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{item.organization.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.organization.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString("uz-UZ")}</TableCell>
                    <TableCell className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(item)}>
                        <Edit className="h-4 w-4 mr-1" /> {t("materials.actions.edit")}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDelete(item)}>
                        <Trash2 className="h-4 w-4 mr-1" /> {t("materials.actions.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("products.dialogs.edit.title")}</DialogTitle>
            <DialogDescription>{t("products.dialogs.edit.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-material">{t("products.form.material")} *</Label>
              <Select
                value={formData.material_id}
                onValueChange={(value) => setFormData({ ...formData, material_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("products.form.selectMaterial")} />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material: Material) => (
                    <SelectItem key={material.id} value={material.id.toString()}>
                      {material.name} ({unitLabels[material.unit]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-project">{t("products.form.project")}</Label>
              <Select
                value={formData.project_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, project_id: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("products.form.selectProject")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("products.form.noProject")}</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-quantity">{getQuantityLabel()} *</Label>
              <Input
                id="edit-quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder={`${t("products.form.example")}: ${
                  getSelectedMaterial()?.unit === "g" ? "100.5" : "10"
                }`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-pure_gold">{t("products.form.pureGold")} *</Label>
              <Input
                id="edit-pure_gold"
                type="number"
                step="0.01"
                value={formData.pure_gold}
                onChange={(e) => setFormData({ ...formData, pure_gold: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-is_composite">{t("products.form.composite")}</Label>
              <Select
                value={formData.is_composite.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_composite: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("products.form.selectComposite")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">{t("products.table.composite.no")}</SelectItem>
                  <SelectItem value="true">{t("products.table.composite.yes")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-source_description">
                {t("products.form.sourceDescription")}
              </Label>
              <Input
                id="edit-source_description"
                type="text"
                value={formData.source_description}
                onChange={(e) => setFormData({ ...formData, source_description: e.target.value })}
                placeholder={t("products.form.sourceDescriptionPlaceholder")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedProduct(null);
              }}
            >
              {t("products.common.cancel")}
            </Button>
            <Button onClick={handleUpdateProduct}>{t("products.common.update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("products.dialogs.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("products.dialogs.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("products.common.no")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProduct && handleDeleteProducts(selectedProduct.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("products.dialogs.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
