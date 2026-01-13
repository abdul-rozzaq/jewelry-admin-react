import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type Product from "@/src/types/product";
import type Material from "@/src/types/material";
import { ProcessInputCreate } from "@/src/pages/ProcessesPage/CreateProcessPage";
import { ProcessType } from "@/src/types/process";

interface ProcessInputsProps {
  inputs: ProcessInputCreate[];
  selectedType: ProcessType | null;
  products: Product[];
  materials: Material[];
  onAddInput: () => void;
  onRemoveInput: (index: number) => void;
  onUpdateInput: (index: number, key: keyof ProcessInputCreate, value: any) => void;
}

export function ProcessInputs({ inputs, selectedType, products, materials, onAddInput, onRemoveInput, onUpdateInput }: ProcessInputsProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("createProcess.inputs.title")}</CardTitle>
        <CardDescription>{t("createProcess.inputs.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {inputs.map((input, i) => {
          const title =
            !input.product && !input.material
              ? t("createProcess.inputs.materialOrProduct")
              : input.product
              ? t("createProcess.inputs.product")
              : t("createProcess.inputs.material");

          return (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div>
                <Label>{title}</Label>
                <Select
                  disabled={selectedType !== null}
                  value={input.product ? `product:${input.product}` : input.material ? `material:${input.material}` : ""}
                  onValueChange={(value) => {
                    const [optionType, rawId] = value.split(":");
                    const numericId = Number(rawId);

                    if (optionType === "product") {
                      onUpdateInput(i, "product", numericId);
                      onUpdateInput(i, "material", products.find((p) => p.id === numericId)?.material.id ?? null);
                    } else {
                      onUpdateInput(i, "product", null);
                      onUpdateInput(i, "material", numericId);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t("createProcess.inputs.selectMaterial")} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p: Product) => (
                      <SelectItem value={`product:${p.id}`} key={`product-${p.id}`}>
                        {p.material.name} ({(+p.quantity).toFixed(3)} {p.material.unit}) - {parseFloat(p.purity) * 10}
                      </SelectItem>
                    ))}

                    <SelectSeparator />

                    {materials
                      .filter((e: Material) => !e.mixes_with_gold)
                      .map((m: Material) => (
                        <SelectItem value={`material:${m.id}`} key={`material-${m.id}`}>
                          {m.name} ({m.unit}) - {m.purity}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 items-end">
                <Input
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder={t("createProcess.inputs.quantity")}
                  value={input.quantity ?? ""}
                  onChange={(e) => onUpdateInput(i, "quantity", parseFloat(e.target.value) ?? null)}
                />
                <Button variant="outline" size="sm" onClick={() => onRemoveInput(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
        {selectedType === null && (
          <Button type="button" variant="outline" onClick={onAddInput} className="w-full border-dashed">
            <Plus className="h-4 w-4 mr-1" /> {t("createProcess.inputs.addInput")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
