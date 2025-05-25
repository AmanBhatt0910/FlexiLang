export class ASTNode {
  constructor(type, value = null) {
    this.type = type;
    this.value = value;
    this.children = [];
    this.attributes = {};
  }
  
  addChild(child) {
    this.children.push(child);
  }
  
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
}


export const NodeTypes = {
  PROGRAM: 'PROGRAM',
  FUNCTION_DECLARATION: 'FUNCTION_DECLARATION',
  VARIABLE_DECLARATION: 'VARIABLE_DECLARATION',
  ASSIGNMENT: 'ASSIGNMENT',
  BINARY_EXPRESSION: 'BINARY_EXPRESSION',
  UNARY_EXPRESSION: 'UNARY_EXPRESSION',
  CALL_EXPRESSION: 'CALL_EXPRESSION',
  MEMBER_EXPRESSION: 'MEMBER_EXPRESSION',
  IDENTIFIER: 'IDENTIFIER',
  LITERAL: 'LITERAL',
  BLOCK_STATEMENT: 'BLOCK_STATEMENT',
  IF_STATEMENT: 'IF_STATEMENT',
  WHILE_STATEMENT: 'WHILE_STATEMENT',
  FOR_STATEMENT: 'FOR_STATEMENT',
  RETURN_STATEMENT: 'RETURN_STATEMENT',
  EXPRESSION_STATEMENT: 'EXPRESSION_STATEMENT'
};
