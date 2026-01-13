import { useMemo } from "react";
import type Material from "@/src/types/material";
import type Product from "@/src/types/product";
import { ProcessInputCreate, ProcessOutputCreate } from "@/src/pages/ProcessesPage/CreateProcessPage";

interface UseProcessCalculationsProps {
  inputs: ProcessInputCreate[];
  outputs: ProcessOutputCreate[];
  productsMap: Record<number, Product>;
  materialsMap: Record<number, Material>;
}

export const useProcessCalculations = ({ inputs, outputs, productsMap, materialsMap }: UseProcessCalculationsProps) => {
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

  return {
    inputGoldQuantity,
    outputGoldQuantity,
  };
};
