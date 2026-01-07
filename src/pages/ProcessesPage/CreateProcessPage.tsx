import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/src/lib/auth";
import { toast } from "@/src/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type Material from "@/src/types/material";
import { useCreateProcessMutation, useGetProcessTypesQuery } from "@/src/lib/service/processesApi";
import { useGetProductsQuery } from "@/src/lib/service/productsApi";
import { useGetMaterialsQuery } from "@/src/lib/service/materialsApi";
import { useGetProjectsQuery } from "@/src/lib/service/projectsApi";
import type Product from "@/src/types/product";
import type Project from "@/src/types/project";

interface ProcessInputCreate {
  material: number | null;
  product: number | null;
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
  const { data: projects = [] as Project[] } = useGetProjectsQuery({});
 
  const productsMap = useMemo(() => {
    const map: Record<number, Product> = {};
    products.forEach((p: Product) => {
      map[p.id] = p;
    });
    return map;
  }, [products]);

  const materialsMap = useMemo(() => {
    const map: Record<number, Material> = {};
    materials.forEach((m: Material) => {
      map[m.id] = m;
    });
    return map;
  }, [materials]);

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [inputs, setInputs] = useState<ProcessInputCreate[]>([{ material: null, quantity: null, product: null }]);
  const [outputs, setOutputs] = useState<ProcessOutputCreate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedType) return;

    const selected = processTypes.find((t: any) => t.id === selectedType);

    if (selected?.template) {
      const productsMap = products.reduce((acc, curVal) => ({ [curVal.material.id]: curVal, ...acc }), {});

      const template = selected.template;

      const mappedInputs = (template.inputs || []).map((inp: Material) => {
        const product = productsMap[inp.id];

        return {
          product: product?.id ?? null,
          material: product ? null : inp.id,
          quantity: 0,
        };
      });

      const mappedOutputs = (template.outputs || []).map((out: Material) => ({ material: out.id ?? null, quantity: 0 }));

      setInputs(mappedInputs.length ? mappedInputs : [{ material: null, quantity: null, prooduct: null }]);
      setOutputs(mappedOutputs.length ? mappedOutputs : []);
    }
  }, [selectedType, processTypes, products]);

  const addInput = () => setInputs([...inputs, { material: null, quantity: null, product: null }]);
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
    return inputs.every((i) => i.material || i.product) && outputs.every((o) => o.material) && inputs.length && outputs.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) return toast({ title: t("createProcess.validation.fillAllFields") });

    setIsSubmitting(true);

    try {
      const payload = {
        process_type: selectedType,
        project: selectedProject,
        inputs: inputs.map((i) => ({ product: i.product, material: i.material, quantity: i.quantity })),
        outputs: outputs.map((o) => ({ material: o.material, quantity: o.quantity })),
      };

      await createProcess(payload).unwrap();

      toast({ title: t("createProcess.success.created") });
      navigate("/processes");
    } catch {
      toast({ title: t("createProcess.errors.createFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputGoldQuantity = useMemo(() => {
    return inputs.reduce((acc, input) => {
      const product = input.product ? productsMap[input.product] : null;
      const material: Material | null = product ? product.material : input.material ? materialsMap[input.material] : null;

      if (material?.mixes_with_gold) {
        const purityValue = material.purity ? parseFloat(material.purity) / 100 : 0;
        return acc + (input.quantity ?? 0) * purityValue;
      }

      return acc;
    }, 0);
  }, [inputs, productsMap, materialsMap]);

  const outputGoldQuantity = useMemo(() => {
    return outputs.reduce((acc, val) => {
      const material = val.material ? materialsMap[val.material] : null;

      if (material?.mixes_with_gold) {
        const purityValue = material.purity ? parseFloat(material.purity) / 100 : 0;
        return acc + (val.quantity ?? 0) * purityValue;
      }

      return acc;
    }, 0);
  }, [outputs, materialsMap]);

  const goldDifference = useMemo(() => {
    return inputGoldQuantity - outputGoldQuantity;
  }, [inputGoldQuantity, outputGoldQuantity]);

  const efficiency = useMemo(() => {
    if (inputGoldQuantity === 0) return 0;
    return (outputGoldQuantity / inputGoldQuantity) * 100;
  }, [inputGoldQuantity, outputGoldQuantity]);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
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
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/processes">{t("createProcess.actions.cancel")}</Link>
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={!isFormValid() || isSubmitting}>
            {isSubmitting ? t("createProcess.submit.creating") : t("createProcess.submit.create")}
          </Button>
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
                        {pt.name[i18n.resolvedLanguage ?? "uz"] ?? pt.type}
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
                        onChange={(e) => updateInput(i, "quantity", parseFloat(e.target.value) ?? null)}
                      />
                      <Button variant="outline" size="sm" onClick={() => removeInput(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {selectedType === null && (
                <Button type="button" variant="outline" onClick={addInput} className="w-full border-dashed">
                  <Plus className="h-4 w-4 mr-1" /> {t("createProcess.inputs.addInput")}
                </Button>
              )}
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
                    <Select
                      value={output.material?.toString() || ""}
                      onValueChange={(v) => updateOutput(i, "material", Number(v))}
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
                      onChange={(e) => updateOutput(i, "quantity", parseFloat(e.target.value) ?? null)}
                    />
                    <Button variant="outline" size="sm" onClick={() => removeOutput(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {selectedType === null && (
                <Button type="button" variant="outline" onClick={addOutput} className="w-full border-dashed">
                  <Plus className="h-4 w-4 mr-1" /> {t("createProcess.outputs.addOutput")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              {t("createProcess.goldCalculation.title")}
            </CardTitle>
            <CardDescription>{t("createProcess.goldCalculation.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium mb-1">{t("createProcess.goldCalculation.input")}</div>
                <div className="text-2xl font-bold text-blue-700">
                  {inputGoldQuantity.toFixed(3)} <span className="text-sm font-normal">g</span>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 font-medium mb-1">{t("createProcess.goldCalculation.output")}</div>
                <div className="text-2xl font-bold text-green-700">
                  {outputGoldQuantity.toFixed(3)} <span className="text-sm font-normal">g</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${goldDifference >= 0 ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}>
                <div className={`text-sm font-medium mb-1 ${goldDifference >= 0 ? "text-red-600" : "text-orange-600"}`}>
                  {goldDifference >= 0 ? t("createProcess.goldCalculation.loss") : t("createProcess.goldCalculation.excess")}
                </div>
                <div className={`text-2xl font-bold ${goldDifference >= 0 ? "text-red-700" : "text-orange-700"}`}>
                  {Math.abs(goldDifference).toFixed(3)} <span className="text-sm font-normal">g</span>
                </div>
              </div>
            </div>

            {inputGoldQuantity > 0 && outputGoldQuantity > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t("createProcess.goldCalculation.efficiency")}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, efficiency)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{efficiency.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
