export interface Coordinator {
  id: string;
  name: string;
  email?: string;
  roleId?: string;
  roleName: string;
  roles?: Role;
}

export interface Role {
  id: string;
  name: string;
}

