import { useMemo } from "react";
import { EfficiencyStrategy } from "../loss_strategies/efficiency_strategy";
import { ProcessTypes } from "../processes.constants";
import { STRATEGIES } from "../loss_strategies/registry";

interface UseEfficiencyCalculationProps {
  inputGoldQuantity: number;
  outputGoldQuantity: number;
  processType: keyof typeof ProcessTypes | null;
}

export const useEfficiencyCalculation = ({ inputGoldQuantity, outputGoldQuantity, processType }: UseEfficiencyCalculationProps) => {
  console.log({ processType });

  const strategy = useMemo(() => {
    const strategy = processType && STRATEGIES[processType] ? STRATEGIES[processType] : STRATEGIES["DEFAULT"];

    console.log("Using strategy for process type:", processType, strategy);
    return strategy;
  }, [processType]);

  const { efficiency, goldDifference } = useMemo(() => {
    return strategy.execute({
      inputGoldQuantity,
      outputGoldQuantity,
    });
  }, [strategy, inputGoldQuantity, outputGoldQuantity]);

  return {
    efficiency,
    goldDifference,
  };
};
