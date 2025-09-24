import Material from "./material"


export interface ProcessInput {
  id: number
  quantity: string
  process: number
  inventory: number
}

export interface ProcessOutput {
  id: number
  quantity: string
  process: number
  material: number
}

export interface Process {
  id: number
  organization: {
    id: number
    created_at: string
    updated_at: string
    name: string
    type: string
  }
  inputs: ProcessInput[]
  outputs: ProcessOutput[]
  created_at: string
  updated_at: string
  process_type: string | null
  status: string
  started_at: string
  finished_at: string | null
}

