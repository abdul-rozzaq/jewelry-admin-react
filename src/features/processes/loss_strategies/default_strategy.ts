import { BaseStrategy } from "./base_strategy";

export class DefaultStrategy extends BaseStrategy {
  execute(data: any) {
    const { inputs = [], outputs = [] } = data;
    let totalLoss = 0;
    const n = inputs.length;

    return { lossValue: totalLoss / n };
  }
}
