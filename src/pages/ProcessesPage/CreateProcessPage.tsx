import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Trash2, Plus, ArrowLeft, Package, ArrowRight, Copy, ArrowRightSquare } from "lucide-react";
import { useGetInventoryQuery } from "@/src/lib/service/inventoryApi";
import { useGetMaterialsQuery } from "@/src/lib/service/materialsApi";
import { useCreateProcessMutation } from "@/src/lib/service/processApi";

import { getCurrentUser } from "@/src/lib/auth";

import type Inventory from "@/src/types/inventory";
import { toast } from "@/src/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type Material from "@/src/types/material";

interface ProcessInputCreate {
  inventory: number | null;
  quantity: number | null;
}

interface ProcessOutputCreate {
  material: number | null;
  quantity: number | null;
}

export default function CreateProcessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [createProcess, { isLoading }] = useCreateProcessMutation();

  const [inputs, setInputs] = useState<ProcessInputCreate[]>([{ inventory: null, quantity: null }]);
  const [outputs, setOutputs] = useState<ProcessOutputCreate[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: inventory = [] as Inventory[], isLoading: inventoriesLoading } = useGetInventoryQuery({
    organization: currentUser?.organization?.id,
  });

  const { data: materials = [] } = useGetMaterialsQuery({});

  // Add new input row
  const addInput = () => {
    setInputs([...inputs, { inventory: null, quantity: null }]);
  };

  // Remove input row
  const removeInput = (index: number) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  // Update input
  const updateInput = (index: number, field: keyof ProcessInputCreate, value: any) => {
    console.log({ update: value, field });

    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setInputs(newInputs);
  };

  // Add new output row
  const addOutput = (defaults = {}) => {
    setOutputs([...outputs, { material: null, quantity: null, ...defaults }]);
  };

  // Remove output row
  const removeOutput = (index: number) => {
    if (outputs.length > 1) {
      setOutputs(outputs.filter((_, i) => i !== index));
    }
  };

  // Update output
  const updateOutput = (index: number, field: keyof ProcessOutputCreate, value: any) => {
    const newOutputs = [...outputs];
    newOutputs[index] = { ...newOutputs[index], [field]: value };
    setOutputs(newOutputs);
  };

  // Validate form
  const isFormValid = () => {
    const validInputs = inputs.every((input) => input.inventory !== null && input.quantity !== null && input.quantity > 0);
    const validOutputs = outputs.every((output) => output.material !== null && output.quantity !== null && output.quantity > 0);

    return validInputs && validOutputs;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast({ title: t("createProcess.validation.fillAllFields") });
      return;
    }

    setIsSubmitting(true);

    try {
      const processData = {
        inputs: inputs.map((input) => ({
          inventory: input.inventory!,
          quantity: input.quantity!,
        })),
        outputs: outputs.map((output) => ({
          material: output.material!,
          quantity: output.quantity!,
        })),
      };

      console.log("Process data to submit:", processData);

      const result = await createProcess(processData);
      console.log("Process created successfully:", result);

      toast({ title: t("createProcess.success.created") });
      navigate("/processes");
    } catch (error) {
      console.error("Error creating process:", error);

      toast({ title: t("createProcess.errors.createFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/processes">
            <ArrowLeft className="h-4 w-4 mr-0.5" />
            {t("createProcess.actions.back")}
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-balance">{t("createProcess.title")}</h1>
          <p className="text-muted-foreground">{t("createProcess.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{t("createProcess.inputs.title")}</CardTitle>
                  <CardDescription>{t("createProcess.inputs.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {inputs.map((input, index) => {
                console.log(!input.inventory || !input.quantity);
                console.log(input.inventory, input.quantity);

                return (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`input-inventory-${index}`} className="text-sm font-medium">
                          {t("createProcess.inputs.material")}
                        </Label>
                        <Select
                          value={input.inventory?.toString() || ""}
                          onValueChange={(value) => {
                            console.log(index, input.inventory, value);

                            return updateInput(index, "inventory", Number.parseInt(value));
                          }}
                        >
                          <SelectTrigger id={`input-inventory-${index}`} className="mt-1">
                            <SelectValue placeholder={t("createProcess.inputs.selectMaterial")} />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory //! has bug
                              .filter((e: Inventory) => inputs.every((inp) => e.id != inp.inventory || e.id == input.inventory))
                              .map((item: Inventory) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                  {item.material.name} ({t("createProcess.inputs.available")}: {item.quantity} {item.material.unit})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`input-quantity-${index}`} className="text-sm font-medium">
                            {t("createProcess.inputs.quantity")}
                          </Label>
                          <Input
                            id={`input-quantity-${index}`}
                            type="number"
                            min="0"
                            step="0.001"
                            placeholder={t("createProcess.inputs.quantityPlaceholder")}
                            value={input.quantity || ""}
                            onChange={(e) => updateInput(index, "quantity", Number.parseFloat(e.target.value) || null)}
                            className="mt-1 placeholder:text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeInput(index)}
                          disabled={inputs.length === 1}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOutput({ quantity: input.quantity })}
                          disabled={!input.inventory || !input.quantity}
                          className="text-primary hover:text-primary-foreground hover:bg-primary"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="outline" onClick={addInput} className="w-full border-dashed bg-transparent">
                <Plus className="h-4 w-4 mr-0.5" />
                {t("createProcess.inputs.addInput")}
              </Button>
            </CardContent>
          </Card>

          {/* Right Column - Outputs */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{t("createProcess.outputs.title")}</CardTitle>
                  <CardDescription>{t("createProcess.outputs.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {outputs.map((output, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`output-material-${index}`} className="text-sm font-medium">
                        {t("createProcess.outputs.product")}
                      </Label>
                      <Select
                        value={output.material?.toString() || ""}
                        onValueChange={(value) => updateOutput(index, "material", Number.parseInt(value))}
                      >
                        <SelectTrigger id={`output-material-${index}`} className="mt-1">
                          <SelectValue placeholder={t("createProcess.outputs.selectProduct")} />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material: Material) => (
                            <SelectItem key={material.id} value={material.id.toString()}>
                              {material.name} ({material.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`output-quantity-${index}`} className="text-sm font-medium">
                          {t("createProcess.outputs.quantity")}
                        </Label>
                        <Input
                          id={`output-quantity-${index}`}
                          type="number"
                          min="0"
                          step="0.001"
                          placeholder={t("createProcess.outputs.quantityPlaceholder")}
                          value={output.quantity || ""}
                          onChange={(e) => updateOutput(index, "quantity", Number.parseFloat(e.target.value) || null)}
                          className="mt-1 placeholder:text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOutput(index)}
                        disabled={outputs.length === 1}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOutput} className="w-full border-dashed bg-transparent">
                <Plus className="h-4 w-4 mr-0.5" />
                {t("createProcess.outputs.addOutput")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("createProcess.submit.note")}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to="/processes">{t("createProcess.actions.cancel")}</Link>
                </Button>
                <Button type="submit" disabled={!isFormValid() || isSubmitting}>
                  {isSubmitting ? t("createProcess.submit.creating") : t("createProcess.submit.create")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
