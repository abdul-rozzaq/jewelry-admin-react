
interface StatsItem { 
    count: number
    total?: number
}


export interface DashboardStats {
    products: StatsItem
    organization: StatsItem
    transaction: StatsItem
}

