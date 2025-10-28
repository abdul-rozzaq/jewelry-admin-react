import Product from "./product";
import Organization from "./organization";
import Project from "./project";

type TransactionStatus = "pending" | "accepted";

interface TransactionItem {
  id: number;
  quantity: string;
  product: Product;
  transaction: number;
}

interface Transaction {
  id: number;
  items: TransactionItem[];
  sender: Organization;
  receiver: Organization;
  created_at: string;
  updated_at: string;
  project?: Project;
  status: TransactionStatus;
}

export type { TransactionStatus, Transaction, TransactionItem };
