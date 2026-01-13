import { ProcessTypes } from "../processes.constants";
import { BaseStrategy } from "./base_strategy";
import { EfficiencyStrategy } from "./efficiency_strategy";

export const STRATEGIES: Record<string, BaseStrategy> = {
  coat: new EfficiencyStrategy(),
  DEFAULT: new EfficiencyStrategy(),
};
