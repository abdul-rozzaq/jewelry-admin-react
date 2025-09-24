import Inventory from "./inventory";
import Organization from "./organization"


type TransactionStatus = 'pending' | 'accepted';


interface TransactionItem {
    id: number
    quantity: string
    inventory: Inventory
    transaction: number
}

interface Transaction {
    id: number
    items: TransactionItem[]
    sender: Organization
    receiver: Organization
    created_at: string;
    updated_at: string;
    status: TransactionStatus
}




export type { TransactionStatus, Transaction, TransactionItem }