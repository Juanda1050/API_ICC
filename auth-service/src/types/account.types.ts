interface IUserBase {
  name: string;
  lastName: string;
}

export interface IUser extends IUserBase {
  id: string;
  email: string;
  telephone?: string;
  password_hash?: string;
  token?: string;
  refresh_token?: string;
  active?: boolean;
  role_id: string;
  created_at?: string;
  updated_at?: string;
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

export interface IUserRegisterRequest extends IUserBase {
  email: string;
  password: string;
  telephone?: string;
  schoolGroup_id?: number;
}

export interface UserWithRole extends Omit<IUser, "password_hash"> {
  role: Role;
}
