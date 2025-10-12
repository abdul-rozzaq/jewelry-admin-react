import Organization from "./organization";
import Material from "./material";
import Product from "./product";
import { Project } from "./project";

export interface ProcessTemplate {
  id: number;
  name: {
    uz: string;
    en: string;
    tr: string;
  };
  inputs: Material[];
  outputs: Material[];
}

export interface ProcessType {
  id: number;
  name: {
    uz: string;
    en: string;
    tr: string;
  };
  type: string;
  template: ProcessTemplate | null;
}

export interface ProcessInput {
  id: number;
  quantity: number;
  process: number;
  product: Product;
}

export interface ProcessOutput {
  id: number;
  quantity: number;
  process: number;
  material: Material;
}

export interface Process {
  id: number;
  organization: Organization;
  project: Project;
  process_type: ProcessType;
  inputs: ProcessInput[];
  outputs: ProcessOutput[];
  status: string;
  started_at: string;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}
