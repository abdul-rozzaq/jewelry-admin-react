import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/src/lib/auth";
import { toast } from "@/src/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type Material from "@/src/types/material";
import { useCreateProcessMutation, useGetProcessTypesQuery } from "@/src/lib/service/processesApi";
import { useGetProductsQuery } from "@/src/lib/service/productsApi";
import { useGetMaterialsQuery } from "@/src/lib/service/materialsApi";
import type Product from "@/src/types/product";

interface ProcessInputCreate {
  inventory: number | null;
  quantity: number | null;
}

interface ProcessOutputCreate {
  material: number | null;
  quantity: number | null;
}

export default function CreateProcessPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [createProcess] = useCreateProcessMutation();

  const { data: processTypes = [] } = useGetProcessTypesQuery({});
  const { data: products = [] as Product[] } = useGetProductsQuery({ organization: currentUser?.organization?.id });
  const { data: materials = [] } = useGetMaterialsQuery({});

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [inputs, setInputs] = useState<ProcessInputCreate[]>([{ inventory: null, quantity: null }]);
  const [outputs, setOutputs] = useState<ProcessOutputCreate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (typeId: number) => {
    setSelectedType(typeId);
  };

  useEffect(() => {
    if (!selectedType) return;

    const selected = processTypes.find((t: any) => t.id === selectedType);

    if (selected?.template) {
      const productsMap = products.reduce((acc, curVal) => ({ [curVal.material.id]: curVal, ...acc }), {});

      const template = selected.template;

      const mappedInputs = (template.inputs || []).map((inp: Material) => ({ inventory: productsMap[inp.id]?.id ?? null, quantity: 0 }));
      const mappedOutputs = (template.outputs || []).map((out: Material) => ({ material: out.id ?? null, quantity: 0 }));

      setInputs(mappedInputs.length ? mappedInputs : [{ inventory: null, quantity: null }]);
      setOutputs(mappedOutputs.length ? mappedOutputs : []);
    }
  }, [selectedType, processTypes]);

  const addInput = () => setInputs([...inputs, { inventory: null, quantity: null }]);
  const removeInput = (i: number) => setInputs(inputs.filter((_, idx) => idx !== i));
  const updateInput = (i: number, key: keyof ProcessInputCreate, val: any) => {
    setInputs((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));
  };

  const addOutput = () => setOutputs([...outputs, { material: null, quantity: null }]);
  const removeOutput = (i: number) => setOutputs(outputs.filter((_, idx) => idx !== i));
  const updateOutput = (i: number, key: keyof ProcessOutputCreate, val: any) => {
    setOutputs((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));
  };

  const isFormValid = () => {
    return (
      inputs.every((i) => i.inventory && i.quantity && i.quantity > 0) &&
      outputs.every((o) => o.material && o.quantity && o.quantity > 0) &&
      inputs.length &&
      outputs.length
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) return toast({ title: t("createProcess.validation.fillAllFields") });

    setIsSubmitting(true);

    try {
      const payload = {
        type: selectedType,
        inputs: inputs.map((i) => ({ inventory: i.inventory!, quantity: i.quantity! })),
        outputs: outputs.map((o) => ({ material: o.material!, quantity: o.quantity! })),
      };
      await createProcess(payload);
      toast({ title: t("createProcess.success.created") });
      navigate("/processes");
    } catch {
      toast({ title: t("createProcess.errors.createFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/processes">
            <ArrowLeft className="h-4 w-4 mr-0.5" />
            {t("createProcess.actions.back")}
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t("createProcess.title")}</h1>
          <p className="text-muted-foreground">{t("createProcess.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("createProcess.type.title")}</CardTitle>
            <CardDescription>{t("createProcess.type.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Label>{t("createProcess.type.select")}</Label>
            <Select onValueChange={(v) => handleTypeChange(Number(v))} value={selectedType?.toString() || ""}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t("createProcess.type.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {processTypes.map((pt: any) => (
                  <SelectItem key={pt.id} value={pt.id.toString()}>
                    {pt.name[i18n.resolvedLanguage ?? "uz"] ?? pt.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("createProcess.inputs.title")}</CardTitle>
              <CardDescription>{t("createProcess.inputs.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inputs.map((input, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                  <div>
                    <Label>{t("createProcess.inputs.material")}</Label>
                    <Select value={input.inventory?.toString() || ""} onValueChange={(v) => updateInput(i, "inventory", Number(v))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("createProcess.inputs.selectMaterial")} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.material.name} ({p.quantity} {p.material.unit})
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
                      value={input.quantity || ""}
                      onChange={(e) => updateInput(i, "quantity", parseFloat(e.target.value) || null)}
                    />
                    <Button variant="outline" size="sm" onClick={() => removeInput(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addInput} className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-1" /> {t("createProcess.inputs.addInput")}
              </Button>
            </CardContent>
          </Card>

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
                    <Select value={output.material?.toString() || ""} onValueChange={(v) => updateOutput(i, "material", Number(v))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("createProcess.outputs.selectProduct")} />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>
                            {m.name} ({m.unit})
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
                      value={output.quantity || ""}
                      onChange={(e) => updateOutput(i, "quantity", parseFloat(e.target.value) || null)}
                    />
                    <Button variant="outline" size="sm" onClick={() => removeOutput(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOutput} className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-1" /> {t("createProcess.outputs.addOutput")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to="/processes">{t("createProcess.actions.cancel")}</Link>
            </Button>
            <Button type="submit" disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? t("createProcess.submit.creating") : t("createProcess.submit.create")}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
