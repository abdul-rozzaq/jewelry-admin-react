export default interface Project {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}
