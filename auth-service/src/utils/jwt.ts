import jwt from "jsonwebtoken";

const ACCESS_EXPIRES_IN = "6h";

export function signAccessToken(payload: { id: string; role?: string }) {
  return jwt.sign(
    { id: payload.id, role: payload.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

export function signRefreshToken(payload: { id: string; role?: string }) {
  return jwt.sign(
    { id: payload.id, role: payload.role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
}
