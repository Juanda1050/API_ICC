export interface Student {
  id: string;
  name: string;
  middle_name?: string;
  paternal_surname: string;
  maternal_surname?: string;
  list_number: number;
  group: string;
  grade: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface CSVStudent {
  name: string;
  middle_name?: string;
  paternal_surname: string;
  maternal_surname: string;
  list_number: number;
  group: string;
  grade: string;
}

export interface StudentFilter {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  list_number?: number;
  group?: string;
  grade?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
