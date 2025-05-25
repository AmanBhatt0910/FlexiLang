export class SemanticAnalyzer {
  constructor(ast) {
    this.ast = ast;
    this.symbolTable = new Map();
    this.scopeStack = [];
    this.errors = [];
    this.currentScope = 0;
  }
  
  enterScope() {
    this.currentScope++;
    this.scopeStack.push(new Map());
  }
  
  exitScope() {
    this.scopeStack.pop();
    this.currentScope--;
  }
  
  declare(name, type, value = null) {
    const currentScopeSymbols = this.scopeStack[this.scopeStack.length - 1] || this.symbolTable;
    
    if (currentScopeSymbols.has(name)) {
      this.errors.push(`Variable '${name}' already declared in current scope`);
      return false;
    }
    
    currentScopeSymbols.set(name, {
      type,
      value,
      scope: this.currentScope,
      used: false
    });
    
    return true;
  }
  
  lookup(name) {
    // Search from innermost to outermost scope
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      if (this.scopeStack[i].has(name)) {
        return this.scopeStack[i].get(name);
      }
    }
    
    if (this.symbolTable.has(name)) {
      return this.symbolTable.get(name);
    }
    
    return null;
  }
  
  analyze() {
    this.enterScope();
    this.visitNode(this.ast);
    this.exitScope();
    
    return {
      symbolTable: this.symbolTable,
      errors: this.errors
    };
  }
  
  visitNode(node) {
    if (!node) return;
    
    switch (node.type) {
      case NodeTypes.PROGRAM:
        node.children.forEach(child => this.visitNode(child));
        break;
        
      case NodeTypes.FUNCTION_DECLARATION:
        this.declare(node.value, 'function');
        this.enterScope();
        // Declare parameters
        if (node.attributes.parameters) {
          node.attributes.parameters.forEach(param => {
            this.declare(param, 'parameter');
          });
        }
        node.children.forEach(child => this.visitNode(child));
        this.exitScope();
        break;
        
      case NodeTypes.VARIABLE_DECLARATION:
        const varType = this.inferType(node.children[0]);
        this.declare(node.value, varType);
        node.children.forEach(child => this.visitNode(child));
        break;
        
      case NodeTypes.IDENTIFIER:
        const symbol = this.lookup(node.value);
        if (!symbol) {
          this.errors.push(`Undefined variable '${node.value}'`);
        } else {
          symbol.used = true;
        }
        break;
        
      case NodeTypes.ASSIGNMENT:
        this.visitNode(node.children[0]); // left side
        this.visitNode(node.children[1]); // right side
        break;
        
      case NodeTypes.BINARY_EXPRESSION:
        this.visitNode(node.children[0]);
        this.visitNode(node.children[1]);
        break;
        
      case NodeTypes.UNARY_EXPRESSION:
        this.visitNode(node.children[0]);
        break;
        
      case NodeTypes.CALL_EXPRESSION:
        node.children.forEach(child => this.visitNode(child));
        break;
        
      case NodeTypes.MEMBER_EXPRESSION:
        node.children.forEach(child => this.visitNode(child));
        break;
        
      case NodeTypes.BLOCK_STATEMENT:
        this.enterScope();
        node.children.forEach(child => this.visitNode(child));
        this.exitScope();
        break;
        
      case NodeTypes.IF_STATEMENT:
      case NodeTypes.WHILE_STATEMENT:
      case NodeTypes.FOR_STATEMENT:
      case NodeTypes.RETURN_STATEMENT:
      case NodeTypes.EXPRESSION_STATEMENT:
        node.children.forEach(child => this.visitNode(child));
        break;
        
      default:
        // Visit all children by default
        node.children.forEach(child => this.visitNode(child));
    }
  }
  
  inferType(node) {
    if (!node) return 'undefined';
    
    switch (node.type) {
      case NodeTypes.LITERAL:
        if (node.attributes.dataType === TokenTypes.NUMBER) return 'number';
        if (node.attributes.dataType === TokenTypes.STRING) return 'string';
        if (node.value === true || node.value === false) return 'boolean';
        return 'undefined';
        
      case NodeTypes.BINARY_EXPRESSION:
        const leftType = this.inferType(node.children[0]);
        const rightType = this.inferType(node.children[1]);
        const operator = node.attributes.operator;
        
        if (['+', '-', '*', '/', '%'].includes(operator)) {
          if (operator === '+' && (leftType === 'string' || rightType === 'string')) {
            return 'string';
          }
          return 'number';
        }
        
        if (['==', '!=', '<', '>', '<=', '>=', '===', '!==', '&&', '||'].includes(operator)) {
          return 'boolean';
        }
        
        return 'unknown';
        
      case NodeTypes.IDENTIFIER:
        const symbol = this.lookup(node.value);
        return symbol ? symbol.type : 'unknown';
        
      default:
        return 'unknown';
    }
  }
}