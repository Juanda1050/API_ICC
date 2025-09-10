export interface Teacher {
  id: string;
  name: string;
  last_name: string;
  grade: string;
  group: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface Coordinator {
  id: string;
  name: string;
  email?: string;
  roleId?: string;
  roleName: string;
}
