import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import {
  deleteUserAccount,
  toggleUser,
  updateUserProfile,
  userProfile,
} from "../controllers/user.controller";
import { validate } from "../middleware/validate";
import { updatedUserSchema, toggleUserSchema } from "../schemas/user.schema";

const userRouter = Router();

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
