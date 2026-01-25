import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { ArrowLeft } from "lucide-react";
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
import { GoldCalculationCard } from "@/src/features/processes/components/GoldCalculationCard";
import { ProcessTemplateItem, ProcessType } from "@/src/types/process";
import { ProcessInputs } from "@/src/features/processes/components/ProcessInputs";
import { ProcessOutputs } from "@/src/features/processes/components/ProcessOutputs";
import { useProcessCalculations } from "@/src/features/processes/hooks/useProcessCalculations";
import { useEfficiencyCalculation } from "@/src/features/processes/hooks/useEfficiencyCalculation";

export default function CreateProcessPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [createProcess] = useCreateProcessMutation();

  const { data: processTypes = [] as ProcessType[] } = useGetProcessTypesQuery({});
  const { data: products = [] as Product[] } = useGetProductsQuery({
    organization: currentUser?.organization?.id,
  });
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

  const [selectedType, setSelectedType] = useState<ProcessType | null>(null);
  const [inputs, setInputs] = useState<ProcessInputCreate[]>([{ material: null, quantity: null, product: null, use_all_material: false }]);
  const [outputs, setOutputs] = useState<ProcessOutputCreate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedType) return;

    if (selectedType.template) {
      const productsMap = products.reduce((acc, curVal) => ({ [curVal.material.id]: curVal, ...acc }), {});

      const template = selectedType.template;

      const mappedInputs = (template.inputs || [] as ProcessTemplateItem[]).map((inp: ProcessTemplateItem) => {
        const product = productsMap[inp.material.id];

        return {
          product: product?.id ?? null,
          material: product ? null : inp.material.id,
          quantity: inp.use_all_material && product ? product.quantity : null,
          use_all_material: inp.use_all_material,
        };
      });

      const mappedOutputs = (template.outputs || []  as ProcessTemplateItem[]).map((out: ProcessTemplateItem) => ({
        material: out.material.id ?? null,
        quantity: 0,
        use_all_material: out.use_all_material,
      }));

      setInputs(mappedInputs.length ? mappedInputs : [{ material: null, quantity: null, product: null, use_all_material: false }]);
      setOutputs(mappedOutputs.length ? mappedOutputs : []);
    }
  }, [selectedType, processTypes, products]);

  const addInput = () => setInputs([...inputs, { material: null, quantity: null, product: null, use_all_material: false }]);
  const removeInput = (i: number) => setInputs(inputs.filter((_, idx) => idx !== i));

  const updateInput = (i: number, key: keyof ProcessInputCreate, val: any) => {
    setInputs((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));
  };
  
  const addOutput = () => setOutputs([...outputs, { material: null, quantity: null, use_all_material: false }]);
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
        process_type: selectedType?.id,
        project: selectedProject,
        inputs: inputs.map((i) => ({
          product: i.product,
          material: i.material,
          quantity: i.quantity,
        })),
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

  const { inputGoldQuantity, outputGoldQuantity } = useProcessCalculations({
    inputs,
    outputs,
    productsMap,
    materialsMap,
  });

  const { efficiency, goldDifference } = useEfficiencyCalculation({
    inputGoldQuantity,
    outputGoldQuantity,
    processType: selectedType?.type ?? null,
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/processes">
              <ArrowLeft className="h-4 w-4 mr-0.5" />
              <span className="hidden sm:inline">{t("createProcess.actions.back")}</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("createProcess.title")}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{t("createProcess.subtitle")}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button type="button" variant="outline" asChild className="flex-1 md:flex-none">
            <Link to="/processes">{t("createProcess.actions.cancel")}</Link>
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={!isFormValid() || isSubmitting} className="flex-1 md:flex-none">
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
                <Select
                  onValueChange={(v) => setSelectedType(v !== "none" ? processTypes.find((pt) => pt.id === Number(v)) : null)}
                  value={selectedType?.id.toString() || "none"}
                >
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
          <ProcessInputs
            inputs={inputs}
            materials={materials}
            onAddInput={addInput}
            onRemoveInput={removeInput}
            onUpdateInput={updateInput}
            selectedType={selectedType}
            products={products}
          />
          <ProcessOutputs
            outputs={outputs}
            materials={materials}
            onAddOutput={addOutput}
            onRemoveOutput={removeOutput}
            onUpdateOutput={updateOutput}
            selectedType={selectedType}
          />
        </div>

        {selectedType?.can_cause_loss && (
          <GoldCalculationCard
            efficiency={efficiency}
            inputGoldQuantity={inputGoldQuantity}
            outputGoldQuantity={outputGoldQuantity}
            goldDifference={goldDifference}
          />
        )}
      </form>
    </div>
  );
}

export interface ProcessInputCreate {
  material: number | null;
  product: number | null;
  quantity: number | null;
  use_all_material: boolean;
}

export interface ProcessOutputCreate {
  material: number | null;
  quantity: number | null;
  use_all_material: boolean;
}
