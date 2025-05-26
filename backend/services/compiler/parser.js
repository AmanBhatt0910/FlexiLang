import { TokenTypes } from './tokenTypes.js';
import { ASTNode, NodeTypes } from './ast.js';

export class SyntaxAnalyzer {
  constructor(tokens) {
    if (!NodeTypes) {
      throw new Error('NodeTypes dependency not loaded');
    }
     this.tokens = tokens.filter(t => t.type !== TokenTypes.WHITESPACE && t.type !== TokenTypes.COMMENT);
    this.position = 0;
    this.currentToken = this.tokens[0];
    this.NodeTypes = NodeTypes;
  }
  
  getCurrentToken() {
    return this.currentToken;
  }
  
  peekToken(offset = 1) {
    const pos = this.position + offset;
    return pos < this.tokens.length ? this.tokens[pos] : null;
  }
  
  advance() {
    this.position++;
    this.currentToken = this.position < this.tokens.length ? this.tokens[this.position] : null;
  }
  
  expect(tokenType) {
    if (!this.currentToken || this.currentToken.type !== tokenType) {
      throw new Error(`Expected ${tokenType}, got ${this.currentToken?.type} at line ${this.currentToken?.line}`);
    }
    const token = this.currentToken;
    this.advance();
    return token;
  }
  
  match(tokenType) {
    return this.currentToken && this.currentToken.type === tokenType;
  }
  
  matchValue(value) {
    return this.currentToken && this.currentToken.value === value;
  }
  
  parse() {
    const program = new ASTNode(this.NodeTypes.PROGRAM);
    
    while (this.currentToken && this.currentToken.type !== TokenTypes.EOF) {
      if (this.match(TokenTypes.NEWLINE)) {
        this.advance();
        continue;
      }
      
      const statement = this.parseStatement();
      if (statement) {
        program.addChild(statement);
      }
    }
    
    return program;
  }
  
  parseStatement() {
    if (this.matchValue('function')) {
      return this.parseFunctionDeclaration();
    }
    
    if (this.matchValue('var') || this.matchValue('let') || this.matchValue('const')) {
      return this.parseVariableDeclaration();
    }
    
    if (this.matchValue('if')) {
      return this.parseIfStatement();
    }
    
    if (this.matchValue('while')) {
      return this.parseWhileStatement();
    }
    
    if (this.matchValue('for')) {
      return this.parseForStatement();
    }
    
    if (this.matchValue('return')) {
      return this.parseReturnStatement();
    }
    
    if (this.match(TokenTypes.LBRACE)) {
      return this.parseBlockStatement();
    }
    
    // Expression statement
    const expr = this.parseExpression();
    if (this.match(TokenTypes.SEMICOLON)) {
      this.advance();
    }
    
    const exprStmt = new ASTNode(NodeTypes.EXPRESSION_STATEMENT);
    exprStmt.addChild(expr);
    return exprStmt;
  }
  
  parseFunctionDeclaration() {
    this.expect(TokenTypes.KEYWORD); // 'function'
    const name = this.expect(TokenTypes.IDENTIFIER);
    
    this.expect(TokenTypes.LPAREN);
    const params = [];
    
    while (!this.match(TokenTypes.RPAREN)) {
      params.push(this.expect(TokenTypes.IDENTIFIER).value);
      if (this.match(TokenTypes.COMMA)) {
        this.advance();
      }
    }
    
    this.expect(TokenTypes.RPAREN);
    const body = this.parseBlockStatement();
    
    const funcNode = new ASTNode(NodeTypes.FUNCTION_DECLARATION, name.value);
    funcNode.setAttribute('parameters', params);
    funcNode.addChild(body);
    
    return funcNode;
  }
  
  parseVariableDeclaration() {
    const declType = this.expect(TokenTypes.KEYWORD).value;
    const name = this.expect(TokenTypes.IDENTIFIER);
    
    let initializer = null;
    if (this.match(TokenTypes.ASSIGNMENT)) {
      this.advance();
      initializer = this.parseExpression();
    }
    
    if (this.match(TokenTypes.SEMICOLON)) {
      this.advance();
    }
    
    const varNode = new ASTNode(NodeTypes.VARIABLE_DECLARATION, name.value);
    varNode.setAttribute('declarationType', declType);
    if (initializer) {
      varNode.addChild(initializer);
    }
    
    return varNode;
  }
  
  parseIfStatement() {
    this.expect(TokenTypes.KEYWORD); // 'if'
    this.expect(TokenTypes.LPAREN);
    const condition = this.parseExpression();
    this.expect(TokenTypes.RPAREN);
    const consequent = this.parseStatement();
    
    let alternate = null;
    if (this.matchValue('else')) {
      this.advance();
      alternate = this.parseStatement();
    }
    
    const ifNode = new ASTNode(NodeTypes.IF_STATEMENT);
    ifNode.addChild(condition);
    ifNode.addChild(consequent);
    if (alternate) {
      ifNode.addChild(alternate);
    }
    
    return ifNode;
  }
  
  parseWhileStatement() {
    this.expect(TokenTypes.KEYWORD); // 'while'
    this.expect(TokenTypes.LPAREN);
    const condition = this.parseExpression();
    this.expect(TokenTypes.RPAREN);
    const body = this.parseStatement();
    
    const whileNode = new ASTNode(NodeTypes.WHILE_STATEMENT);
    whileNode.addChild(condition);
    whileNode.addChild(body);
    
    return whileNode;
  }
  
  parseForStatement() {
    this.expect(TokenTypes.KEYWORD); // 'for'
    this.expect(TokenTypes.LPAREN);
    
    const init = this.parseStatement();
    const condition = this.parseExpression();
    this.expect(TokenTypes.SEMICOLON);
    const update = this.parseExpression();
    
    this.expect(TokenTypes.RPAREN);
    const body = this.parseStatement();
    
    const forNode = new ASTNode(NodeTypes.FOR_STATEMENT);
    forNode.addChild(init);
    forNode.addChild(condition);
    forNode.addChild(update);
    forNode.addChild(body);
    
    return forNode;
  }
  
  parseReturnStatement() {
    this.expect(TokenTypes.KEYWORD); // 'return'
    
    let argument = null;
    if (!this.match(TokenTypes.SEMICOLON) && !this.match(TokenTypes.NEWLINE)) {
      argument = this.parseExpression();
    }
    
    if (this.match(TokenTypes.SEMICOLON)) {
      this.advance();
    }
    
    const returnNode = new ASTNode(NodeTypes.RETURN_STATEMENT);
    if (argument) {
      returnNode.addChild(argument);
    }
    
    return returnNode;
  }
  
  parseBlockStatement() {
    this.expect(TokenTypes.LBRACE);
    const block = new ASTNode(NodeTypes.BLOCK_STATEMENT);
    
    while (!this.match(TokenTypes.RBRACE) && this.currentToken) {
      if (this.match(TokenTypes.NEWLINE)) {
        this.advance();
        continue;
      }
      
      const stmt = this.parseStatement();
      if (stmt) {
        block.addChild(stmt);
      }
    }
    
    this.expect(TokenTypes.RBRACE);
    return block;
  }
  
  parseExpression() {
    return this.parseAssignmentExpression();
  }
  
  parseAssignmentExpression() {
    let left = this.parseLogicalOrExpression();
    
    if (this.match(TokenTypes.ASSIGNMENT)) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseAssignmentExpression();
      
      const assignNode = new ASTNode(NodeTypes.ASSIGNMENT);
      assignNode.setAttribute('operator', operator);
      assignNode.addChild(left);
      assignNode.addChild(right);
      
      return assignNode;
    }
    
    return left;
  }
  
  parseLogicalOrExpression() {
    let left = this.parseLogicalAndExpression();
    
    while (this.match(TokenTypes.LOGICAL) && this.currentToken.value === '||') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseLogicalAndExpression();
      
      const binaryNode = new ASTNode(NodeTypes.BINARY_EXPRESSION);
      binaryNode.setAttribute('operator', operator);
      binaryNode.addChild(left);
      binaryNode.addChild(right);
      
      left = binaryNode;
    }
    
    return left;
  }
  
  parseLogicalAndExpression() {
    let left = this.parseEqualityExpression();
    
    while (this.match(TokenTypes.LOGICAL) && this.currentToken.value === '&&') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseEqualityExpression();
      
      const binaryNode = new ASTNode(NodeTypes.BINARY_EXPRESSION);
      binaryNode.setAttribute('operator', operator);
      binaryNode.addChild(left);
      binaryNode.addChild(right);
      
      left = binaryNode;
    }
    
    return left;
  }
  
  parseEqualityExpression() {
    let left = this.parseRelationalExpression();
    
    while (this.match(TokenTypes.COMPARISON) && ['==', '!=', '===', '!=='].includes(this.currentToken.value)) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseRelationalExpression();
      
      const binaryNode = new ASTNode(NodeTypes.BINARY_EXPRESSION);
      binaryNode.setAttribute('operator', operator);
      binaryNode.addChild(left);
      binaryNode.addChild(right);
      
      left = binaryNode;
    }
    
    return left;
  }
  
  parseRelationalExpression() {
    let left = this.parseAdditiveExpression();
    
    while (this.match(TokenTypes.COMPARISON) && ['<', '>', '<=', '>='].includes(this.currentToken.value)) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseAdditiveExpression();
      
      const binaryNode = new ASTNode(NodeTypes.BINARY_EXPRESSION);
      binaryNode.setAttribute('operator', operator);
      binaryNode.addChild(left);
      binaryNode.addChild(right);
      
      left = binaryNode;
    }
    
    return left;
  }
  
  parseAdditiveExpression() {
    let left = this.parseMultiplicativeExpression();
    
    while (this.match(TokenTypes.ARITHMETIC) && ['+', '-'].includes(this.currentToken.value)) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseMultiplicativeExpression();
      
      const binaryNode = new ASTNode(NodeTypes.BINARY_EXPRESSION);
      binaryNode.setAttribute('operator', operator);
      binaryNode.addChild(left);
      binaryNode.addChild(right);
      
      left = binaryNode;
    }
    
    return left;
  }
  
  parseMultiplicativeExpression() {
    let left = this.parseUnaryExpression();
    
    while (this.match(TokenTypes.ARITHMETIC) && ['*', '/', '%'].includes(this.currentToken.value)) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseUnaryExpression();
      
      const binaryNode = new ASTNode(NodeTypes.BINARY_EXPRESSION);
      binaryNode.setAttribute('operator', operator);
      binaryNode.addChild(left);
      binaryNode.addChild(right);
      
      left = binaryNode;
    }
    
    return left;
  }
  
  parseUnaryExpression() {
    if (this.match(TokenTypes.UNARY)) {
      const operator = this.currentToken.value;
      this.advance();
      const operand = this.parseUnaryExpression();
      
      const unaryNode = new ASTNode(NodeTypes.UNARY_EXPRESSION);
      unaryNode.setAttribute('operator', operator);
      unaryNode.addChild(operand);
      
      return unaryNode;
    }
    
    return this.parsePostfixExpression();
  }
  
  parsePostfixExpression() {
    let left = this.parsePrimaryExpression();
    
    while (true) {
      if (this.match(TokenTypes.LPAREN)) {
        // Function call
        this.advance();
        const args = [];
        
        while (!this.match(TokenTypes.RPAREN)) {
          args.push(this.parseExpression());
          if (this.match(TokenTypes.COMMA)) {
            this.advance();
          }
        }
        
        this.expect(TokenTypes.RPAREN);
        
        const callNode = new ASTNode(NodeTypes.CALL_EXPRESSION);
        callNode.addChild(left);
        args.forEach(arg => callNode.addChild(arg));
        
        left = callNode;
      } else if (this.match(TokenTypes.DOT)) {
        // Member access
        this.advance();
        const property = this.expect(TokenTypes.IDENTIFIER);
        
        const memberNode = new ASTNode(NodeTypes.MEMBER_EXPRESSION);
        memberNode.setAttribute('property', property.value);
        memberNode.addChild(left);
        
        left = memberNode;
      } else if (this.match(TokenTypes.LBRACKET)) {
        // Array access
        this.advance();
        const index = this.parseExpression();
        this.expect(TokenTypes.RBRACKET);
        
        const memberNode = new ASTNode(NodeTypes.MEMBER_EXPRESSION);
        memberNode.setAttribute('computed', true);
        memberNode.addChild(left);
        memberNode.addChild(index);
        
        left = memberNode;
      } else {
        break;
      }
    }
    
    return left;
  }
  
  parsePrimaryExpression() {
    if (this.match(TokenTypes.NUMBER) || this.match(TokenTypes.STRING) || this.matchValue('true') || this.matchValue('false') || this.matchValue('null')) {
      const token = this.currentToken;
      this.advance();
      
      const literalNode = new ASTNode(NodeTypes.LITERAL, token.value);
      literalNode.setAttribute('dataType', token.type);
      
      return literalNode;
    }
    
    if (this.match(TokenTypes.IDENTIFIER)) {
      const token = this.currentToken;
      this.advance();
      
      return new ASTNode(NodeTypes.IDENTIFIER, token.value);
    }
    
    if (this.match(TokenTypes.LPAREN)) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenTypes.RPAREN);
      return expr;
    }
    
    throw new Error(`Unexpected token: ${this.currentToken?.value} at line ${this.currentToken?.line}`);
  }
}