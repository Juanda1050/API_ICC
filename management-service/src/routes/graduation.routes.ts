import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate";
import { authorizeMiddleware } from "../middleware/authorize";
import { validateBody, validateParams } from "../middleware/validate";
import {
  createGraduation,
  getGraduationById,
  updateGraduation,
  deleteGraduation,
  createGraduationPayment,
  getGraduationPayments,
  updateGraduationPayments,
  deleteGraduationPayment,
  createGraduationExpense,
  getGraduationExpenses,
  updateGraduationExpenses,
  deleteGraduationExpense,
  getGraduationFinancialSummary,
  getStudentsPaymentStatus,
  getGraduationExpenseSummary,
} from "../controllers/graduation.controller";
import { roles } from "../utils/dictionary";
import {
  graduationSchema,
  graduationPaymentSchema,
  graduationExpenseSchema,
  graduationPaymentFilterSchema,
  graduationExpenseFilterSchema,
  uuidParamSchema,
} from "../schemas/graduation.schemas";

const graduationRouter = Router();

const adminAuth = [
  authenticateMiddleware,
  authorizeMiddleware([
    roles.admin.id,
    roles.coordinator_general.id,
    roles.coordinator.id,
  ]),
];

graduationRouter.post(
  "/",
  ...adminAuth,
  validateBody(graduationSchema),
  createGraduation
);

graduationRouter.get(
  "/:id",
  ...adminAuth,
  validateParams(uuidParamSchema),
  getGraduationById
);

graduationRouter.put(
  "/:id",
  ...adminAuth,
  validateParams(uuidParamSchema),
  validateBody(graduationSchema.partial()),
  updateGraduation
);

graduationRouter.delete(
  "/:id",
  ...adminAuth,
  validateParams(uuidParamSchema),
  deleteGraduation
);

graduationRouter.post(
  "/payments",
  ...adminAuth,
  validateBody(graduationPaymentSchema),
  createGraduationPayment
);

graduationRouter.post(
  "/:graduationId/payments/list",
  ...adminAuth,
  validateParams(uuidParamSchema),
  validateBody(graduationPaymentFilterSchema),
  getGraduationPayments
);

graduationRouter.put(
  "/payments/:id",
  ...adminAuth,
  validateParams(uuidParamSchema),
  validateBody(graduationPaymentSchema.partial()),
  updateGraduationPayments
);

graduationRouter.delete(
  "/payments/:id",
  ...adminAuth,
  validateParams(uuidParamSchema),
  deleteGraduationPayment
);

graduationRouter.post(
  "/expenses",
  ...adminAuth,
  validateBody(graduationExpenseSchema),
  createGraduationExpense
);

graduationRouter.post(
  "/:graduationId/expenses/list",
  ...adminAuth,
  validateParams(uuidParamSchema),
  validateBody(graduationExpenseFilterSchema),
  getGraduationExpenses
);

graduationRouter.put(
  "/expenses/:id",
  ...adminAuth,
  validateParams(uuidParamSchema),
  validateBody(graduationExpenseSchema.partial()),
  updateGraduationExpenses
);

graduationRouter.delete(
  "/expenses/:id",
  ...adminAuth,
  validateParams(uuidParamSchema),
  deleteGraduationExpense
);

graduationRouter.get(
  "/:graduationId/financialSummary",
  ...adminAuth,
  validateParams(uuidParamSchema),
  getGraduationFinancialSummary
);

graduationRouter.get(
  "/:graduationId/students/paymentStatus",
  ...adminAuth,
  validateParams(uuidParamSchema),
  getStudentsPaymentStatus
);

graduationRouter.get(
  "/:graduationId/expenseSummary",
  ...adminAuth,
  validateParams(uuidParamSchema),
  getGraduationExpenseSummary
);

export default graduationRouter;
