export interface Coordinator {
  id: string;
  name: string;
  email?: string;
  telephone?: string;
  role_id?: string;
  roleName: string;
  roles?: Role;
}

export interface Role {
  id: string;
  name: string;
}
