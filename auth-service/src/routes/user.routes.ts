import { Router } from "express";
import z from "zod/v3";
import { authenticateMiddleware } from "../middleware/authenticate";
import {
  deleteUserAccount,
  toggleUser,
  updateUserProfile,
  userProfile,
} from "../controllers/user.controller";
import { validate } from "../middleware/validate";

const userRouter = Router();

const updatedUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  telephone: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

const toggleUserSchema = z.object({
  active: z.boolean(),
});

userRouter.get("/profile", authenticateMiddleware, userProfile);
userRouter.put(
  "/profile",
  authenticateMiddleware,
  validate(updatedUserSchema),
  updateUserProfile
);
userRouter.put(
  "/toggle",
  authenticateMiddleware,
  validate(toggleUserSchema),
  toggleUser
);
userRouter.post("/delete", authenticateMiddleware, deleteUserAccount);

export default userRouter;
