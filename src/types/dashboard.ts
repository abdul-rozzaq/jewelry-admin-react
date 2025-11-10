interface StatsItem {
  count: number;
  total?: number;
}

export interface DashboardStats {
  products: StatsItem;
  organizations: StatsItem;
  transactions: StatsItem & { last_week: { day: string; count: number; weekday: string }[] };
  gold: StatsItem;
  loses: StatsItem;
}
