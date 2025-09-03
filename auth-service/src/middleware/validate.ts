import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod/v3";

export function validate(
  schema: ZodSchema,
  target: "body" | "params" | "query" = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Usar safeParse para mejor control de errores
      const dataToValidate = req[target];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join(".") || target,
          message: issue.message,
          code: issue.code,
          expected: (issue as any).expected ?? null,
          received: (issue as any).received ?? null
        }));

        res.status(400).json({
          ok: false,
          message: `Validation failed for ${target}`,
          errors: details,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      (req as any).validated = {
        ...((req as any).validated || {}),
        [target]: result.data,
      };

      next();
    } catch (error) {
      console.error("Unexpected validation error:", error);

      res.status(500).json({
        ok: false,
        message: "Internal validation error",
        timestamp: new Date().toISOString(),
      });
    }
  };
}

export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');