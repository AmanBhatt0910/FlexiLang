import { NodeTypes } from "../services/compiler/ast.js";
import { TokenTypes } from "../services/compiler/tokenTypes.js";

const REQUIRED_NODE_TYPES = ['PROGRAM', 'VARIABLE_DECLARATION', 'CALL_EXPRESSION'];
const REQUIRED_TOKEN_TYPES = ['IDENTIFIER', 'NUMBER', 'STRING', 'SEMICOLON', 'LPAREN', 'RPAREN'];

export const typeCheck = (req, res, next) => {
  const missingNodeTypes = REQUIRED_NODE_TYPES.filter(t => !NodeTypes[t]);
  const missingTokenTypes = REQUIRED_TOKEN_TYPES.filter(t => !TokenTypes[t]);

  if (missingNodeTypes.length > 0 || missingTokenTypes.length > 0) {
    return res.status(500).json({
      error: 'COMPILER_TYPE_ERROR',
      message: 'Missing critical type definitions',
      details: {
        missingNodeTypes,
        missingTokenTypes,
        loadedNodeTypes: Object.keys(NodeTypes),
        loadedTokenTypes: Object.keys(TokenTypes)
      }
    });
  }
  
  next();
};