import { NodeTypes } from "../services/compiler/ast";

export const typeCheck = (req, res, next) => {
  if (!NodeTypes?.PROGRAM) {
    return res.status(500).json({
      error: 'COMPILER_TYPES_MISSING',
      message: 'Node type definitions not loaded'
    });
  }
  next();
};