import bcrypt from "bcrypt";
import { supabase } from "../db";
import jwt from "jsonwebtoken";
import { IUser, IUserRegisterRequest } from "../types/account.types";
import { email } from "zod";

const JWT_SECRET = process.env.JWT_SECRET!;
const ICC_ID = process.env.ICC_SCHOOL_ID;

export async function registerService(
  userRegistration: IUserRegisterRequest
): Promise<IUser> {
  const { data: existingUser } = await supabase
    .from("users")
    .select("email, telephone")
    .or(
      `email.eq.${userRegistration.email}${
        userRegistration.telephone
          ? `,telephone.eq.${userRegistration.telephone}`
          : ""
      }`
    );

  if (existingUser && existingUser.length > 0) {
    const emailExists = existingUser.some(
      (u) => u.email === userRegistration.email
    );
    const phoneExists = existingUser.some(
      (u) => u.telephone === userRegistration.telephone
    );

    if (emailExists) throw new Error("A user with this email already exists");
    if (phoneExists)
      throw new Error("A user with this telephone already exists");
  }

  const hashedPassword = await bcrypt.hash(userRegistration.password, 10);

  const { data: defaultRole } = await supabase
    .from("roles")
    .select("id")
    .eq("role_name", "user")
    .single();

  if (!defaultRole) throw new Error("Default role not found");

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: userRegistration.name,
        lastName: userRegistration.lastName,
        email: userRegistration.email,
        password_hash: hashedPassword,
        telephone: userRegistration.telephone,
        school_id: ICC_ID,
        schoolGroup_id: userRegistration.schoolGroup_id,
        role_id: defaultRole.id,
        active: true,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as IUser;
}

export async function loginService(email: string, password: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("active", true)
    .is("deleted_at", null)
    .single();

  if (error || !user) throw new Error("Invalid email or password");

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) throw new Error("Invalid email or password");

  const accessToken = jwt.sign(
    { userId: user.id, roleId: user.role_id },
    JWT_SECRET,
    { expiresIn: "6h" }
  );

  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  await supabase
    .from("users")
    .update({ token: accessToken, refresh_token: refreshToken })
    .eq("id", user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      lastName: user.last_name,
      email: user.email,
      telephone: user.telephone,
      role_id: user.role_id,
    },
  };
}

export async function refreshTokenService(oldRefreshToken: string) {
  try {
    const decoded = jwt.verify(oldRefreshToken, JWT_SECRET) as {
      userId: string;
    };
    const userId = decoded.userId;

    if (!userId) throw new Error("Invalid token payload");

    const { data: user, error } = await supabase
      .from("users")
      .select(`*, role:roles(*)`)
      .eq("id", userId)
      .eq("active", true)
      .is("deleted_at", null)
      .single();

    if (error || !user) throw new Error("User not found");

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, roleId: user.role_id },
      JWT_SECRET,
      { expiresIn: "6h" }
    );

    const newRefreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    await supabase
      .from("users")
      .update({ token: newAccessToken })
      .eq("id", user.id);

    const currentUser: IUser = {
      id: user.id,
      name: user.name,
      lastName: user.last_name,
      email: user.email,
      role_id: user.role_id,
    };

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      currentUser,
    };
  } catch (err) {
    throw new Error("Invalid refresh token");
  }
}

export async function logoutService(userId: string) {
  const { error } = await supabase
    .from("users")
    .update({ token: null, refresh_token: null })
    .eq("id", userId);

  if (error) throw new Error("Logout failed");
  return true;
}
