export interface BaseStrategyResponse {
  [key: string]: any;
}

export abstract class BaseStrategy {
  abstract execute(data: any): BaseStrategyResponse;
}
