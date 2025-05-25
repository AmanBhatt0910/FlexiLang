export const TokenTypes = {
  // Literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',
  UNDEFINED: 'UNDEFINED',
  
  // Identifiers and Keywords
  IDENTIFIER: 'IDENTIFIER',
  KEYWORD: 'KEYWORD',
  
  // Operators
  ASSIGNMENT: 'ASSIGNMENT',
  ARITHMETIC: 'ARITHMETIC',
  COMPARISON: 'COMPARISON',
  LOGICAL: 'LOGICAL',
  UNARY: 'UNARY',
  
  // Delimiters
  SEMICOLON: 'SEMICOLON',
  COMMA: 'COMMA',
  DOT: 'DOT',
  
  // Brackets
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  
  // Comments
  COMMENT: 'COMMENT',
  
  // Special
  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
  WHITESPACE: 'WHITESPACE'
};

// Also export as default for better compatibility
export default TokenTypes;