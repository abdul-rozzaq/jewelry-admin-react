import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
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
import { Badge } from "@/src/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Loader2, Package2, Building2 } from "lucide-react";
import { toast } from "@/src/hooks/use-toast";
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  ProductsApi,
} from "@/src/lib/service/productsApi";
import { useGetMaterialsQuery } from "@/src/lib/service/materialsApi";
import { useGetOrganizationsQuery } from "@/src/lib/service/organizationsApi";
import { useDispatch } from "react-redux";
import { unitColors, unitLabels } from "@/src/constants/units";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

import type Material from "@/src/types/material";
import type Product from "@/src/types/inventory";
import type Organization from "@/src/types/organization";

import { getCurrentUser } from "@/src/lib/auth";
import { useTranslation } from "react-i18next";

export default function ProductsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user = getCurrentUser();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");

  const { data: products = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery(undefined);
  const { data: materials = [], isLoading: materialsLoading } = useGetMaterialsQuery(undefined);
  const { data: organizations = [], isLoading: organizationsLoading } = useGetOrganizationsQuery(undefined);

  const [addProduct] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({ quantity: "", organization_id: "", material_id: "" });

  const resetForm = () => setFormData({ quantity: "", organization_id: "", material_id: "" });

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
    const search = searchTerm?.toLowerCase() ?? "";

    if (!parseFloat(item.quantity)) return false;

    if (!search && organizationFilter == "all") return true;

    if (organizationFilter != "all" && !search) {
      return item.organization.id === +organizationFilter;
    }

    if (search && organizationFilter === "all") {
      return (
        item.material.name.toLowerCase().includes(search) ||
        item.organization.name.toLowerCase().includes(search) ||
        item.id.toString().includes(search)
      );
    }

    return (
      (item.material.name.toLowerCase().includes(search) ||
        item.organization.name.toLowerCase().includes(search) ||
        item.id.toString().includes(search)) &&
      item.organization.id === +organizationFilter
    );
  });

  const handleCreateProducts = async () => {
    if (!formData.quantity || !formData.organization_id || !formData.material_id) {
      toast({
        title: t("products.common.error"),
        description: t("products.validation.allFieldsRequired"),
        variant: "destructive",
      });
      return;
    }

    const apiData = {
      quantity: formData.quantity,
      organization_id: Number.parseInt(formData.organization_id),
      material_id: Number.parseInt(formData.material_id),
    };

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
      organization_id: product.organization.id.toString(),
      material_id: product.material.id.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    if (!formData.quantity || !formData.organization_id || !formData.material_id) {
      toast({
        title: t("products.common.error"),
        description: t("products.validation.allFieldsRequired"),
        variant: "destructive",
      });
      return;
    }

    const apiData = {
      quantity: formData.quantity,
      organization_id: Number.parseInt(formData.organization_id),
      material_id: Number.parseInt(formData.material_id),
    };

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

  if (productsLoading || materialsLoading || organizationsLoading) {
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-0.5" />
                {t("products.actions.create")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>{t("products.dialogs.create.title")}</DialogTitle>
                <DialogDescription>{t("products.dialogs.create.description")}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="material">{t("products.form.material")} *</Label>
                  <Select value={formData.material_id} onValueChange={(value) => setFormData({ ...formData, material_id: value, quantity: "" })}>
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
                  <Label htmlFor="organization">{t("products.form.organization")} *</Label>
                  <Select value={formData.organization_id} onValueChange={(value) => setFormData({ ...formData, organization_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("products.form.selectOrganization")} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.length === 0 ? (
                        <SelectItem value="no-organizations" disabled>
                          {t("products.form.noOrganizations")}
                        </SelectItem>
                      ) : (
                        organizations.map((org: Organization) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))
                      )}
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
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder={`${t("products.form.example")}: ${getSelectedMaterial()?.unit === "g" ? "100.5" : "10"}`}
                    disabled={!formData.material_id}
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
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("products.search.placeholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
        </div>

        {isBank && (
          <div className="flex items-center space-x-2">
            <Select value={organizationFilter?.toString() ?? ""} onValueChange={(value) => setOrganizationFilter(value)}>
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
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("products.table.title")}</CardTitle>
          <CardDescription>{t("products.table.description", { count: products.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("products.empty.title")}</h3>
              <p className="text-muted-foreground mb-4">{searchTerm ? t("products.empty.noResults") : t("products.empty.noData")}</p>
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
                  <TableHead>{t("products.table.columns.organization")}</TableHead>
                  <TableHead>{t("products.table.columns.createdAt")}</TableHead>
                  <TableHead className="text-right">{t("products.table.columns.actions")}</TableHead>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("products.dialogs.edit.title")}</DialogTitle>
            <DialogDescription>{t("products.dialogs.edit.description")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-material">{t("products.form.material")} *</Label>
              <Select value={formData.material_id} onValueChange={(value) => setFormData({ ...formData, material_id: value })}>
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
              <Label htmlFor="edit-organization">{t("products.form.organization")} *</Label>
              <Select value={formData.organization_id} onValueChange={(value) => setFormData({ ...formData, organization_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("products.form.selectOrganization")} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org: Organization) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
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
                placeholder={`${t("products.form.example")}: ${getSelectedMaterial()?.unit === "g" ? "100.5" : "10"}`}
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
            <AlertDialogDescription>{t("products.dialogs.delete.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("products.common.no")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedProduct && handleDeleteProducts(selectedProduct.id)} className="bg-red-600 hover:bg-red-700">
              {t("products.dialogs.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
