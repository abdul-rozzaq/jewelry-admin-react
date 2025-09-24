export default interface Inventory {
  id: number
  quantity: string
  organization: {
    id: number
    name: string
    type: string
    created_at: string
    updated_at: string
  }
  material: {
    id: number
    name: string
    unit: "g" | "pcs" | "ct"
    created_at: string
    updated_at: string
  }
  created_at: string
  updated_at: string
}
