import { BaseStrategy } from "./base_strategy";

export interface EfficiencyInput {
  inputGoldQuantity: number;
  outputGoldQuantity: number;
}

export interface EfficiencyResponse {
  efficiency: number;
  goldDifference: number;
}

export class EfficiencyStrategy extends BaseStrategy {
  execute(input: EfficiencyInput): EfficiencyResponse {
    const { inputGoldQuantity, outputGoldQuantity } = input;

    const efficiency = inputGoldQuantity === 0 ? 0 : (outputGoldQuantity / inputGoldQuantity) * 100;
    const goldDifference = inputGoldQuantity - outputGoldQuantity;

    return {
      efficiency,
      goldDifference,
    };
  }
}
