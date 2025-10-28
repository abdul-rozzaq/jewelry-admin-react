import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Plus, Trash2, Loader2, Magnet } from "lucide-react";
import { useGetOrganizationsQuery } from "@/src/lib/service/organizationsApi";
import { useGetProductsQuery } from "@/src/lib/service/productsApi";
import { useAddTransactionMutation } from "@/src/lib/service/transactionsApi";
import { toast } from "@/src/hooks/use-toast";
import type Organization from "@/src/types/organization";
import type Product from "@/src/types/product";
import { getCurrentUser } from "@/src/lib/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetProjectsQuery } from "@/src/lib/service/projectsApi";
import Project from "@/src/types/project";

const parseQuantity = (quantity: any): number => {
  if (typeof quantity === "number") return quantity;
  if (typeof quantity === "string") {
    const parsed = Number.parseFloat(quantity);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const isValidQuantity = (quantity: string): boolean => {
  const num = Number.parseFloat(quantity);
  return !Number.isNaN(num) && num > 0;
};

export default function CreateTransactionPage() {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const currentUser = getCurrentUser();

  const { data: receivers = [] as Organization[], isLoading: receiversLoading } = useGetOrganizationsQuery({});
  const { data: projects } = useGetProjectsQuery({});
  const { data: products = [] as Product[], isLoading: inventoriesLoading } = useGetProductsQuery({
    organization: currentUser?.organization?.id,
  });

  const [addTransaction, { isLoading: isSubmitting }] = useAddTransactionMutation();

  const [receiver, setReceiver] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [items, setItems] = useState<{ product: string; quantity: string }[]>([]);
  const [currentItem, setCurrentItem] = useState({ product: "", quantity: "" });
  const [error, setError] = useState("");

  const availableProducts = products.filter((inv: Product) => parseQuantity(inv.quantity) > 0);

  const handleAddItem = () => {
    if (!currentItem.product || !isValidQuantity(currentItem.quantity)) {
      setError(t("createTransfer.errors.invalidInventoryOrQuantity"));
      return;
    }

    const selectedInv: Product = products.find((inv: Product) => String(inv.id) === currentItem.product);

    if (!selectedInv) {
      setError(t("createTransfer.errors.inventoryNotFound"));
      return;
    }

    const availableQty = parseQuantity(selectedInv.quantity);
    const addQty = Number.parseFloat(currentItem.quantity);

    if (availableQty <= 0) {
      setError(
        `${t("createTransfer.errors.quantityExceedsAvailable", {
          name: selectedInv.material.name,
          available: 0,
          unit: selectedInv.material.unit || "dona",
        })}`
      );
      return;
    }

    const existingItemIndex = items.findIndex((item) => item.product === currentItem.product);

    let newTotalQty = addQty;

    if (existingItemIndex !== -1) {
      newTotalQty += Number.parseFloat(items[existingItemIndex].quantity);
    }

    if (newTotalQty > availableQty) {
      setError(
        t("createTransfer.errors.quantityExceedsAvailable", {
          name: selectedInv.material.name,
          available: availableQty.toFixed(3),
          unit: selectedInv.material.unit || "dona",
        })
      );
      return;
    }

    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity = newTotalQty.toFixed(3);
      setItems(updatedItems);
    } else {
      setItems([...items, { product: currentItem.product, quantity: addQty.toFixed(3) }]);
    }

    setCurrentItem({ product: "", quantity: "" });
    setError("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddAllItems = () => setItems(products.map((e: Product) => ({ product: e.id.toString(), quantity: e.quantity.toString() })));

  const handleSubmit = async () => {
    if (!receiver || items.length === 0) {
      setError(t("createTransfer.errors.receiverOrItemsRequired"));
      return;
    }

    const payload = {
      receiver: Number(receiver),
      project: selectedProject ? Number(selectedProject) : null,
      items: items.map((item) => ({
        product: Number(item.product),
        quantity: item.quantity,
      })),
    };

    try {
      await addTransaction(payload).unwrap();

      toast({
        title: t("createTransfer.success.title"),
        description: t("createTransfer.success.description"),
        duration: 3000,
      });

      setReceiver("");
      setItems([]);

      setCurrentItem({ product: "", quantity: "" });
      setError("");

      setTimeout(() => navigate("/transactions"), 1000);
    } catch (error: any) {
      const errorMessage = error?.data?.message || t("createTransfer.errors.transactionFailed");

      setError(errorMessage);

      toast({
        title: "Xatolik!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, it) => sum + Number.parseFloat(it.quantity || "0"), 0);

  if (receiversLoading || inventoriesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-gray-600">{t("createTransfer.loading")}</span>
      </div>
    );
  }

  if (receivers.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-md border border-red-200">{t("createTransfer.noReceivers")}</p>
      </div>
    );
  }

  if (availableProducts.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <Card className="max-w-md w-full shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-center text-lg font-semibold text-gray-800">{t("createTransfer.noInventoriesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-center text-gray-600">{t("createTransfer.noInventoriesMessage")}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("createTransfer.pageTitle")}</h1>
        <Button onClick={handleSubmit} disabled={!receiver || items.length === 0 || isSubmitting} className="text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("createTransfer.creatingButton")}
            </>
          ) : (
            t("createTransfer.createButton")
          )}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm  px-4 py-2 rounded-md border border-destructive">{error}</p>}

      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-medium">{t("createTransfer.receiverAndProject")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={receiver} onValueChange={setReceiver}>
              <SelectTrigger className="w-full border">
                <SelectValue placeholder={t("createTransfer.receiverPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {receivers.map((r: Organization) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name} ({r.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProject} onValueChange={(e) => setSelectedProject(e != "none" ? e : "")}>
              <SelectTrigger className="w-full border">
                <SelectValue placeholder={t("createTransfer.projectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"none"}>Belgilanmagan</SelectItem>

                {projects.map((p: Project) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3 flex justify-between items-center">
          <CardTitle className="text-base font-medium ">{t("createTransfer.inventoryLabel")}</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm ">
              Jami: {totalItems} ta, {totalQuantity.toFixed(3)} birlik
            </span>
            <Button onClick={handleAddAllItems} size="icon">
              <Magnet className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div>
              <Label className="text-sm  mb-1 block">{t("createTransfer.inventoryLabel")}</Label>
              <Select value={currentItem.product} onValueChange={(val) => setCurrentItem({ ...currentItem, product: val })}>
                <SelectTrigger className="w-full ">
                  <SelectValue placeholder={t("createTransfer.inventoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts
                    .filter((inv: Product) => items.every((e) => e.product !== inv.id.toString()))
                    .map((inv: Product) => {
                      const availableQty = parseQuantity(inv.quantity);
                      const materialName = inv.material.name;
                      const unit = inv.material?.unit || "g";

                      return (
                        <SelectItem key={inv.id} value={String(inv.id)}>
                          {materialName} ({availableQty.toFixed(3)} {unit})
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1 block">{t("createTransfer.quantityLabel")}</Label>
              <Input
                type="number"
                value={currentItem.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                    setCurrentItem({ ...currentItem, quantity: value });
                  }
                }}
                placeholder={t("createTransfer.quantityPlaceholder")}
                min="0.01"
                step="0.01"
              />
            </div>
            <Button onClick={handleAddItem} className="w-full md:w-auto">
              <Plus className="h-4 w-4" />
              {t("createTransfer.addButton")}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3 text-left">{t("createTransfer.table.headers.inventory")}</th>
                  <th className="p-3 text-left">{t("createTransfer.table.headers.quantity")}</th>
                  <th className="p-3 text-left">{t("createTransfer.table.headers.unit")}</th>
                  <th className="p-3 text-left">{t("createTransfer.table.headers.available")}</th>
                  <th className="p-3 text-left">{t("createTransfer.table.headers.remaining")}</th>
                  <th className="p-3 text-left">{t("createTransfer.table.headers.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const inv = products.find((x) => String(x.id) === it.product);
                  const availableQty = parseQuantity(inv?.quantity);
                  const transferQty = Number.parseFloat(it.quantity);
                  const remaining = availableQty - transferQty;

                  return (
                    <tr key={i} className="border-t  hover:bg-muted">
                      <td className="p-3">{inv?.material.name ?? "Noma'lum"}</td>
                      <td className="p-3 font-medium">{it.quantity}</td>
                      <td className="p-3">{inv?.material.unit ?? "-"}</td>
                      <td className="p-3">{availableQty.toFixed(3)}</td>
                      <td className="p-3">
                        <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>{remaining.toFixed(3)}</span>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(i)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-3 text-center text-gray-500">
                      {t("createTransfer.table.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
