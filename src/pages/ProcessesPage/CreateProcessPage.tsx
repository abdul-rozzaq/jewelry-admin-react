import type React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Trash2, Plus, ArrowLeft, Package, ArrowRight } from "lucide-react";
import { useGetProductsQuery } from "@/src/lib/service/productsApi";
import { useGetMaterialsQuery } from "@/src/lib/service/materialsApi";
import { useCreateProcessMutation } from "@/src/lib/service/processesApi";
import { getCurrentUser } from "@/src/lib/auth";
import type Product from "@/src/types/inventory";
import { toast } from "@/src/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type Material from "@/src/types/material";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";

/** --- Types --- **/
interface StepInput {
  // value is represented in UI as "inv:<inventoryId>" or "step:<stepIndex>:out:<outputIndex>"
  sourceValue: string; // keeps original select value for display/parsing
  inventory?: number | null; // organizationInventory id if source is inventory
  fromStep?: number | null; // if source is previous step output
  fromOutput?: number | null; // index of output in that step
  quantity: number | null;
}

interface StepOutput {
  material: number | null; // material id
  quantity: number | null;
}

interface ProcessStep {
  title: string;
  inputs: StepInput[];
  outputs: StepOutput[];
}

/** --- Component --- **/
export default function CreateProcessPageWithSteps() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [createProcess] = useCreateProcessMutation();

  // Inventory and materials load (mocked in your app)
  const { data: products = [] as Product[] } = useGetProductsQuery({
    organization: currentUser?.organization?.id,
  });
  const { data: materials = [] as Material[] } = useGetMaterialsQuery({});

  // Steps state: at least 1 step by default
  const [steps, setSteps] = useState<ProcessStep[]>([
    { title: "Step 1", inputs: [{ sourceValue: "", inventory: null, fromStep: null, fromOutput: null, quantity: null }], outputs: [] },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Helpers to update steps safely **/
  const updateStep = (index: number, newStep: ProcessStep) => {
    setSteps((s) => s.map((st, i) => (i === index ? newStep : st)));
  };

  const addStep = () => {
    setSteps((s) => [
      ...s,
      {
        title: `Step ${s.length + 1}`,
        inputs: [{ sourceValue: "", inventory: null, fromStep: null, fromOutput: null, quantity: null }],
        outputs: [],
      },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps((s) => {
      if (s.length === 1) return s; // keep at least 1
      // If removing step, need to also remove any references to its outputs in later steps
      const newSteps = s.filter((_, i) => i !== index);
      // Clean references: any input that referenced removed step should be cleared
      return newSteps.map((st) => ({
        ...st,
        inputs: st.inputs.map((inp) => {
          if (inp.fromStep !== null && inp.fromStep! > index) {
            // adjust step index downward by 1
            return { ...inp, fromStep: inp.fromStep! - 1, sourceValue: inp.sourceValue }; // keep sourceValue maybe stale
          }
          if (inp.fromStep === index) {
            // referenced removed step => clear
            return { sourceValue: "", inventory: null, fromStep: null, fromOutput: null, quantity: null };
          }
          return inp;
        }),
      }));
    });
  };

  /** Input management within a step **/
  const addInput = (stepIndex: number) => {
    setSteps((s) =>
      s.map((st, i) =>
        i === stepIndex
          ? { ...st, inputs: [...st.inputs, { sourceValue: "", inventory: null, fromStep: null, fromOutput: null, quantity: null }] }
          : st
      )
    );
  };

  const removeInput = (stepIndex: number, inputIndex: number) => {
    setSteps((s) => s.map((st, i) => (i === stepIndex ? { ...st, inputs: st.inputs.filter((_, idx) => idx !== inputIndex) } : st)));
  };

  const updateInput = (stepIndex: number, inputIndex: number, patch: Partial<StepInput>) => {
    setSteps((s) =>
      s.map((st, i) => (i === stepIndex ? { ...st, inputs: st.inputs.map((inp, idx) => (idx === inputIndex ? { ...inp, ...patch } : inp)) } : st))
    );
  };

  /** Output management **/
  const addOutput = (stepIndex: number, defaults: Partial<StepOutput> = {}) => {
    setSteps((s) => s.map((st, i) => (i === stepIndex ? { ...st, outputs: [...st.outputs, { material: null, quantity: null, ...defaults }] } : st)));
  };

  const removeOutput = (stepIndex: number, outputIndex: number) => {
    setSteps((s) => s.map((st, i) => (i === stepIndex ? { ...st, outputs: st.outputs.filter((_, idx) => idx !== outputIndex) } : st)));
  };

  const updateOutput = (stepIndex: number, outputIndex: number, patch: Partial<StepOutput>) => {
    setSteps((s) =>
      s.map((st, i) => (i === stepIndex ? { ...st, outputs: st.outputs.map((o, idx) => (idx === outputIndex ? { ...o, ...patch } : o)) } : st))
    );
  };

  /** Utility: gather previous outputs for select list **/
  const previousOutputsOptions = useMemo(() => {
    const opts: { label: string; value: string; step: number; outputIndex: number; materialId: number | null; qty: number | null }[] = [];
    steps.forEach((st, sIdx) => {
      st.outputs.forEach((out, oIdx) => {
        const mat = materials.find((m) => m.id === out.material);
        const label = `Step ${sIdx + 1} → ${mat ? mat.name : "N/A"} (${out.quantity ?? "—"})`;
        opts.push({
          label,
          value: `step:${sIdx}:out:${oIdx}`,
          step: sIdx,
          outputIndex: oIdx,
          materialId: out.material ?? null,
          qty: out.quantity ?? null,
        });
      });
    });
    return opts;
  }, [steps, materials]);

  /** When user selects a value in input select: parse inventory vs previous output **/
  const onSelectInputSource = (stepIndex: number, inputIndex: number, value: string) => {
    if (!value) {
      updateInput(stepIndex, inputIndex, { sourceValue: "", inventory: null, fromStep: null, fromOutput: null });
      return;
    }
    if (value.startsWith("inv:")) {
      const invId = Number(value.slice(4));
      updateInput(stepIndex, inputIndex, { sourceValue: value, inventory: invId, fromStep: null, fromOutput: null });
    } else if (value.startsWith("step:")) {
      // format: step:{sIdx}:out:{oIdx}
      const parts = value.split(":");
      const sIdx = Number(parts[1]);
      const oIdx = Number(parts[3]);
      updateInput(stepIndex, inputIndex, { sourceValue: value, inventory: null, fromStep: sIdx, fromOutput: oIdx });
    }
  };

  /** Convenience: make output from a given input (auto-create output in same step) **/
  const makeOutputFromInput = (stepIndex: number, inputIndex: number) => {
    const inp = steps[stepIndex].inputs[inputIndex];
    if (!inp) return;
    // if inventory-based input -> we can detect material id from inventory list
    if (inp.inventory) {
      const inv = products.find((it) => it.id === inp.inventory);
      const matId = inv?.material?.id ?? null;
      addOutput(stepIndex, { material: matId, quantity: inp.quantity });
    } else if (inp.fromStep !== null && inp.fromOutput !== null) {
      // if input comes from previous output, create an output that uses same material
      const srcOut = steps[inp.fromStep ?? 0].outputs[inp.fromOutput ?? 0];
      addOutput(stepIndex, { material: srcOut?.material ?? null, quantity: inp.quantity });
    } else {
      toast({ title: "Choose an input source first" });
    }
  };

  /** Validation: ensure each step inputs have qty and outputs have material+qty (basic) **/
  const isFormValid = () => {
    for (const st of steps) {
      for (const inp of st.inputs) {
        if (!inp.sourceValue || !inp.quantity || inp.quantity <= 0) return false;
      }
      for (const out of st.outputs) {
        if (!out.material || !out.quantity || out.quantity <= 0) return false;
      }
    }
    return steps.length > 0;
  };

  /** Submit: build processData (step-by-step) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast({ title: "Iltimos barcha bosqichlar uchun input va outputlarni to‘ldiring" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Build structured payload:
      const payload = {
        steps: steps.map((st) => ({
          title: st.title,
          inputs: st.inputs.map((inp) => {
            if (inp.inventory) {
              return { type: "inventory", inventory: inp.inventory, quantity: inp.quantity };
            } else if (inp.fromStep !== null && inp.fromOutput !== null) {
              return { type: "step_output", from_step: inp.fromStep, from_output: inp.fromOutput, quantity: inp.quantity };
            } else {
              return { type: "unknown", quantity: inp.quantity };
            }
          }),
          outputs: st.outputs.map((out) => ({ material: out.material, quantity: out.quantity })),
        })),
      };

      console.log("Process payload:", payload);

      // If your backend supports step structure, send it. Otherwise we log (mock).
      // Try call createProcess if exists (may expect different shape)
      try {
        // @ts-ignore - createProcess signature may differ; we try best-effort
        const res = await createProcess(payload);
        console.log("createProcess result:", res);
      } catch (err) {
        console.warn("createProcess call failed or unsupported format — payload is logged for now.", err);
      }

      toast({ title: "Jarayon saqlandi (mock)." });
      navigate("/processes");
    } catch (error) {
      console.error(error);
      toast({ title: "Xatolik — jarayon saqlanmadi" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Render UI **/
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <Tabs defaultValue="0" className="w-full">
        {/* Tab triggers */}
        <TabsList className="mb-4">
          {steps.map((step, sIdx) => (
            <TabsTrigger key={sIdx} value={String(sIdx)}>
              Step {sIdx + 1}
            </TabsTrigger>
          ))}
          <Button onClick={addStep} variant="outline" size="sm" className="ml-2">
            <Plus className="h-4 w-4 mr-1" /> Add Step
          </Button>
        </TabsList>

        {/* Tab contents */}
        {steps.map((step, sIdx) => (
          <TabsContent key={sIdx} value={String(sIdx)}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle>{`Step ${sIdx + 1} — ${step.title}`}</CardTitle>
                    <CardDescription>Har bir bosqich uchun input va outputlarni belgilang</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={step.title} onChange={(e) => updateStep(sIdx, { ...step, title: e.target.value })} className="w-48" />
                    <Button onClick={() => removeStep(sIdx)} variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Inputs column */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Inputs</h4>
                      <Button size="sm" variant="outline" onClick={() => addInput(sIdx)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Input
                      </Button>
                    </div>

                    {step.inputs.map((input, iIdx) => (
                      <div key={iIdx} className="p-3 border rounded-lg">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-6">
                            <Label className="text-sm">Source</Label>
                            <Select
                              value={input.sourceValue ?? undefined} // ✅ null/bo'sh bo'lsa undefined
                              onValueChange={(val) => onSelectInputSource(sIdx, iIdx, val)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Pick inventory or previous output" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Inventory options */}
                                {products.map((inv) => (
                                  <SelectItem key={`inv:${inv.id}`} value={`inv:${inv.id}`}>
                                    {inv.material.name} — Inventory: {inv.quantity} {inv.material.unit}
                                  </SelectItem>
                                ))}

                                {/* Divider */}
                                <div className="px-2 py-1 text-xs text-muted-foreground">--- Previous step outputs ---</div>

                                {/* previous outputs up to this step */}
                                {previousOutputsOptions
                                  .filter((opt) => opt.step < sIdx)
                                  .map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}

                                {previousOutputsOptions.filter((opt) => opt.step < sIdx).length === 0 && (
                                  <div className="px-2 py-1 text-xs text-muted-foreground">No previous outputs</div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-3">
                            <Label className="text-sm">Quantity</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.001"
                              placeholder="qty"
                              value={input.quantity ?? ""}
                              onChange={(e) => updateInput(sIdx, iIdx, { quantity: Number(e.target.value) || null })}
                            />
                          </div>

                          <div className="col-span-3 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => removeInput(sIdx, iIdx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => makeOutputFromInput(sIdx, iIdx)} variant="ghost">
                              <ArrowRight className="h-4 w-4" /> Make output
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Outputs column */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Outputs</h4>
                      <Button size="sm" variant="outline" onClick={() => addOutput(sIdx)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Output
                      </Button>
                    </div>

                    {step.outputs.map((output, oIdx) => (
                      <div key={oIdx} className="p-3 border rounded-lg">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-6">
                            <Label className="text-sm">Product</Label>
                            <Select
                              value={output.material ? String(output.material) : undefined} // ✅ undefined agar yo'q bo'lsa
                              onValueChange={(val) => updateOutput(sIdx, oIdx, { material: Number(val) || null })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Pick material" />
                              </SelectTrigger>
                              <SelectContent>
                                {materials.map((mat) => (
                                  <SelectItem key={mat.id} value={String(mat.id)}>
                                    {mat.name} ({mat.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-4">
                            <Label className="text-sm">Quantity</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.001"
                              placeholder="qty"
                              value={output.quantity ?? ""}
                              onChange={(e) => updateOutput(sIdx, oIdx, { quantity: Number(e.target.value) || null })}
                            />
                          </div>

                          <div className="col-span-2">
                            <Button size="sm" variant="outline" onClick={() => removeOutput(sIdx, oIdx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
