import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Trash2, ArrowLeft, Plus } from "lucide-react";
import { toast } from "@/src/hooks/use-toast";

import { useGetProductsQuery } from "@/src/lib/service/productsApi";
import { useGetMaterialsQuery } from "@/src/lib/service/materialsApi";
import { useGetProjectsQuery } from "@/src/lib/service/projectsApi";
import { useGetProcessByIdQuery, useGetProcessTypesQuery, useUpdateProcessMutation } from "@/src/lib/service/processesApi";

import type Material from "@/src/types/material";
import type Product from "@/src/types/product";
import type Project from "@/src/types/project";
import type { Process } from "@/src/types/process";
import { getCurrentUser } from "@/src/lib/auth";

interface ProcessInputEdit {
  material: number | null;
  product: number | null;
  quantity: number | null;
}

interface ProcessOutputEdit {
  material: number | null;
  quantity: number | null;
}

export default function EditProcessPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);

  const currentUser = getCurrentUser();

  const { data: processTypes = [] } = useGetProcessTypesQuery({});
  const { data: products = [] as Product[] } = useGetProductsQuery({ organization: currentUser?.organization?.id });
  const { data: materials = [] } = useGetMaterialsQuery({});
  const { data: projects = [] as Project[] } = useGetProjectsQuery({});
  const { data: process, isLoading, error } = useGetProcessByIdQuery(id, { skip: !id });
  const [updateProcess, { isLoading: isUpdating }] = useUpdateProcessMutation();

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [inputs, setInputs] = useState<ProcessInputEdit[]>([]);
  const [outputs, setOutputs] = useState<ProcessOutputEdit[]>([]);

  useEffect(() => {
    if (!process) return;
    setSelectedType(process.process_type?.id ?? null);
    setSelectedProject(process.project?.id ?? null);

    const mappedInputs: ProcessInputEdit[] = (process.inputs || []).map((inp) => ({
      product: inp.product?.id ?? null,
      material: inp.material?.id ?? null,
      quantity: Number(inp.quantity) ?? 0,
    }));

    const mappedOutputs: ProcessOutputEdit[] = (process.outputs || []).map((out) => ({
      material: out.material?.id ?? null,
      quantity: Number(out.quantity) ?? 0,
    }));

    setInputs(mappedInputs);
    setOutputs(mappedOutputs);
  }, [process]);

  const addInput = () => setInputs((prev) => [...prev, { material: null, product: null, quantity: null }]);
  const removeInput = (i: number) => setInputs((prev) => prev.filter((_, idx) => idx !== i));
  const updateInput = (i: number, key: keyof ProcessInputEdit, val: any) => {
    setInputs((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));
  };

  const addOutput = () => setOutputs((prev) => [...prev, { material: null, quantity: null }]);
  const removeOutput = (i: number) => setOutputs((prev) => prev.filter((_, idx) => idx !== i));
  const updateOutput = (i: number, key: keyof ProcessOutputEdit, val: any) => {
    setOutputs((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));
  };

  const isFormValid = () => {
    return (
      // selectedType != null &&
      inputs.length > 0 &&
      outputs.length > 0 &&
      inputs.every((i) => (i.product || i.material) && i.quantity && i.quantity > 0) &&
      outputs.every((o) => o.material && o.quantity && o.quantity > 0)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      return toast({ title: t("createProcess.validation.fillAllFields") });
    }

    try {
      const payload: any = {
        id,
        type: selectedType,
        project: selectedProject,
        inputs: inputs.map((i) => ({ product: i.product, material: i.material, quantity: i.quantity })),
        outputs: outputs.map((o) => ({ material: o.material, quantity: o.quantity })),
      };

      await updateProcess(payload).unwrap();
      toast({ title: t("editProcess.success.updated") });
      navigate("/processes");
    } catch (err: any) {
      toast({ title: t("editProcess.errors.updateFailed"), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">{t("Common.loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="flex-1 p-6">
        <p className="text-red-500">{t("processes.errors.loadFailed")}</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">{t("editProcess.title")}</h1>
          <p className="text-muted-foreground">{t("editProcess.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("createProcess.typeAndProject.title")}</CardTitle>
            <CardDescription>{t("createProcess.typeAndProject.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("createProcess.type.select")}</Label>
                <Select onValueChange={(v) => setSelectedType(v !== "none" ? Number(v) : null)} value={selectedType?.toString() || "none"}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t("createProcess.type.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("createProcess.type.none")}</SelectItem>
                    {processTypes.map((pt: any) => (
                      <SelectItem key={pt.id} value={pt.id.toString()}>
                        {(pt.name as any)[i18n.resolvedLanguage ?? "uz"] ?? pt.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Project</Label>
                <Select value={selectedProject?.toString() ?? "none"} onValueChange={(e) => setSelectedProject(e != "none" ? Number(e) : null)}>
                  <SelectTrigger className="w-full border mt-2">
                    <SelectValue placeholder={t("createProcess.projectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"none"}>{t("createProcess.project.none")}</SelectItem>
                    {projects.map((p: Project) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                    <Select
                      value={input.product ? `product:${input.product}` : input.material ? `material:${input.material}` : ""}
                      onValueChange={(value) => {
                        const [optionType, rawId] = value.split(":");
                        const numericId = Number(rawId);

                        if (optionType === "product") {
                          updateInput(i, "product", numericId);
                          updateInput(i, "material", products.find((p) => p.id === numericId)?.material.id ?? null);
                        } else {
                          updateInput(i, "product", null);
                          updateInput(i, "material", numericId);
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("createProcess.inputs.selectMaterial")} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p: Product) => (
                          <SelectItem value={`product:${p.id}`} key={`product-${p.id}`}>
                            {p.material.name} ({(+p.quantity).toFixed(3)} {p.material.unit})
                          </SelectItem>
                        ))}

                        <SelectSeparator />

                        {materials.map((m: Material) => (
                          <SelectItem value={`material:${m.id}`} key={`material-${m.id}`}>
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
                      placeholder={t("createProcess.inputs.quantity")}
                      value={input.quantity ?? ""}
                      onChange={(e) => updateInput(i, "quantity", parseFloat(e.target.value) ?? null)}
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
                      value={output.quantity ?? ""}
                      onChange={(e) => updateOutput(i, "quantity", parseFloat(e.target.value) ?? null)}
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
            <Button type="submit" disabled={!isFormValid() || isUpdating}>
              {isUpdating ? t("editProcess.submit.updating") : t("editProcess.submit.update")}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
