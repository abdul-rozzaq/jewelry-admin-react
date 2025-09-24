export default interface Organization {
  id: number
  created_at: string
  updated_at: string
  name: string
  type: "bank" | "atolye" | "gold_processing"
}
