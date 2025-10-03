export default interface Material {
  id: number;
  name: string;
  unit: string;
  parent: number | null;
  purity: string;
  created_at: string;
  updated_at: string;
}
