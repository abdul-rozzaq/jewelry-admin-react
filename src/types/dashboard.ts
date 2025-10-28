
interface StatsItem { 
    count: number
    total?: number
}


export interface DashboardStats {
    products: StatsItem
    organizations: StatsItem
    transactions: StatsItem
    gold: StatsItem
}

