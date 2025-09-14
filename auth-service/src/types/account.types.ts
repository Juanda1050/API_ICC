export interface User {
  id: string;
  email: string;
  telephone?: string;
  password_hash: string;
  token?: string;
  refresh_token?: string;
  active: boolean;
  role_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Role {
  id: string;
  role_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface UserWithRole extends Omit<User, "password_hash"> {
  role: Role;
}
