
interface StatsItem { 
    count: number
    total?: number
}


export interface DashboardStats {
    inventory: StatsItem
    organization: StatsItem
    transaction: StatsItem
}

