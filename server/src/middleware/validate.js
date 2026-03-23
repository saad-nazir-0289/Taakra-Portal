import { ZodError } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const msg = result.error.errors.map(e => e.message).join('; ');
        return res.status(400).json({ error: msg });
      }
      req.body = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}
