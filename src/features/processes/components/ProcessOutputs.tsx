import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type Material from "@/src/types/material";
import { ProcessOutputCreate } from "@/src/pages/ProcessesPage/CreateProcessPage";
import { ProcessType } from "@/src/types/process";

interface ProcessOutputsProps {
  outputs: ProcessOutputCreate[];
  selectedType: ProcessType | null;
  materials: Material[];
  onAddOutput: () => void;
  onRemoveOutput: (index: number) => void;
  onUpdateOutput: (index: number, key: keyof ProcessOutputCreate, value: any) => void;
}

export function ProcessOutputs({ outputs, selectedType, materials, onAddOutput, onRemoveOutput, onUpdateOutput }: ProcessOutputsProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("createProcess.outputs.title")}</CardTitle>
        <CardDescription>{t("createProcess.outputs.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {outputs.map((output, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div>
              <Label>{t("createProcess.outputs.product")}</Label>
              <Select
                value={output.material?.toString() || ""}
                onValueChange={(v) => onUpdateOutput(i, "material", Number(v))}
                disabled={selectedType !== null}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t("createProcess.outputs.selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m: Material) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name} {m.unit} ({Number(m.purity).toFixed(1)})
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
                placeholder={t("createProcess.outputs.quantity")}
                value={output.quantity ?? ""}
                onChange={(e) => onUpdateOutput(i, "quantity", parseFloat(e.target.value) ?? null)}
              />
              <Button variant="outline" size="sm" onClick={() => onRemoveOutput(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {selectedType === null && (
          <Button type="button" variant="outline" onClick={onAddOutput} className="w-full border-dashed">
            <Plus className="h-4 w-4 mr-1" /> {t("createProcess.outputs.addOutput")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
