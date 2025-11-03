import Material from "./material";
import Organization from "./organization";
import Project from "./project";

export default interface Product {
  id: number;
  quantity: string;
  organization: Organization;
  purity: string;
  material: Material;
  project?: Project;
  karat: number;
  is_composite: boolean;
  pure_gold: string;
  source_description: string | null;
  created_at: string;
  updated_at: string;
}
