import { TokenTypes } from "./tokenTypes.js";
import { NodeTypes } from "./ast.js";

export class SemanticAnalyzer {
  constructor(ast) {
    this.ast = ast;
    this.symbolTable = new Map();
    this.scopeStack = [];
    this.errors = [];
    this.warnings = [];
    this.currentScope = 0;
    this.addPredefinedGlobals();
  }

  addPredefinedGlobals() {
    const jsGlobals = {
      console: {
        type: 'object',
        members: ['log', 'warn', 'error', 'info', 'debug'],
        builtin: true
      },
      Math: { 
        type: 'object', 
        builtin: true,
        members: ['abs', 'floor', 'ceil', 'round', 'max', 'min', 'pow', 'sqrt', 'random']
      },
      Date: { type: 'constructor', builtin: true },
      JSON: { 
        type: 'object', 
        builtin: true,
        members: ['stringify', 'parse']
      },
      setTimeout: { type: 'function', builtin: true },
      clearTimeout: { type: 'function', builtin: true },
      setInterval: { type: 'function', builtin: true },
      clearInterval: { type: 'function', builtin: true },
      parseInt: { type: 'function', builtin: true },
      parseFloat: { type: 'function', builtin: true },
      isNaN: { type: 'function', builtin: true },
      isFinite: { type: 'function', builtin: true }
    };

    Object.entries(jsGlobals).forEach(([name, meta]) => {
      this.symbolTable.set(name, {
        ...meta,
        scope: 0,
        used: false,
        declared: true
      });
    });
  }
  
  enterScope() {
    this.currentScope++;
    this.scopeStack.push(new Map());
  }
  
  exitScope() {
    // Check for unused variables in current scope before exiting
    if (this.scopeStack.length > 0) {
      const currentScopeSymbols = this.scopeStack[this.scopeStack.length - 1];
      currentScopeSymbols.forEach((symbol, name) => {
        if (!symbol.used && !symbol.builtin && symbol.type !== 'function') {
          this.warnings.push(`Variable '${name}' declared but never used`);
        }
      });
    }
    
    this.scopeStack.pop();
    this.currentScope--;
  }
  
  declare(name, type, value = null, attributes = {}) {
    const currentScopeSymbols = this.scopeStack[this.scopeStack.length - 1];
    
    // Check if variable already declared in current scope
    if (currentScopeSymbols && currentScopeSymbols.has(name)) {
      this.errors.push(`Variable '${name}' already declared in current scope`);
      return false;
    }
    
    // Check if it's a global scope redeclaration
    if (this.currentScope === 0 && this.symbolTable.has(name)) {
      this.errors.push(`Cannot redeclare global variable '${name}'`);
      return false;
    }
    
    const symbol = {
      type,
      value,
      scope: this.currentScope,
      used: false,
      declared: true,
      ...attributes
    };
    
    if (currentScopeSymbols) {
      currentScopeSymbols.set(name, symbol);
    } else {
      this.symbolTable.set(name, symbol);
    }
    
    return true;
  }
  
  lookup(name) {
    // Search from innermost to outermost scope
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      if (this.scopeStack[i].has(name)) {
        return this.scopeStack[i].get(name);
      }
    }
    
    // Check global symbol table
    if (this.symbolTable.has(name)) {
      return this.symbolTable.get(name);
    }
    
    return null;
  }
  
  markUsed(name) {
    const symbol = this.lookup(name);
    if (symbol) {
      symbol.used = true;
      return true;
    }
    return false;
  }
  
  analyze() {
    try {
      this.enterScope();
      this.visitNode(this.ast);
      this.exitScope();
      
      // Collect all symbols from all scopes
      const allSymbols = new Map(this.symbolTable);
      
      return {
        symbolTable: allSymbols,
        errors: this.errors,
        warnings: this.warnings,
        success: this.errors.length === 0
      };
    } catch (error) {
      this.errors.push(`Semantic analysis failed: ${error.message}`);
      return {
        symbolTable: this.symbolTable,
        errors: this.errors,
        warnings: this.warnings,
        success: false
      };
    }
  }
  
  visitNode(node) {
    if (!node) {
      return;
    }
    
    // Ensure node has required properties
    if (!node.type) {
      console.warn('Node missing type property:', node);
      return;
    }

    // Ensure children array exists
    if (!Array.isArray(node.children)) {
      node.children = [];
    }
    
    try {
      switch (node.type) {
        case NodeTypes.PROGRAM:
          node.children.forEach(child => this.visitNode(child));
          break;
          
        case NodeTypes.FUNCTION_DECLARATION:
          if (node.value) {
            this.declare(node.value, 'function', null, {
              parameters: node.attributes?.parameters || [],
              returnType: 'unknown'
            });
          }
          this.enterScope();
          // Declare parameters in function scope
          if (node.attributes && node.attributes.parameters) {
            node.attributes.parameters.forEach(param => {
              this.declare(param, 'parameter');
            });
          }
          node.children.forEach(child => this.visitNode(child));
          this.exitScope();
          break;
          
        case NodeTypes.VARIABLE_DECLARATION:
          if (node.value) {
            const varType = node.children.length > 0 ? this.inferType(node.children[0]) : 'undefined';
            this.declare(node.value, varType, node.children[0]?.value);
          }
          node.children.forEach(child => this.visitNode(child));
          break;
          
        case NodeTypes.IDENTIFIER:
          if (node.value) {
            const symbol = this.lookup(node.value);
            if (!symbol) {
              this.errors.push(`Undefined variable '${node.value}'`);
            } else {
              this.markUsed(node.value);
            }
          }
          break;
          
        case NodeTypes.ASSIGNMENT:
          if (node.children.length >= 2) {
            // Visit right side first to check for undefined variables
            this.visitNode(node.children[1]);
            // Then visit left side
            this.visitNode(node.children[0]);
            
            // Check if left side is a valid lvalue
            const leftNode = node.children[0];
            if (leftNode.type === NodeTypes.IDENTIFIER) {
              const symbol = this.lookup(leftNode.value);
              if (!symbol) {
                this.errors.push(`Cannot assign to undefined variable '${leftNode.value}'`);
              }
            }
          }
          break;
          
        case NodeTypes.BINARY_EXPRESSION:
          node.children.forEach(child => this.visitNode(child));
          // Type checking for binary operations
          if (node.children.length >= 2 && node.attributes?.operator) {
            const leftType = this.inferType(node.children[0]);
            const rightType = this.inferType(node.children[1]);
            this.checkBinaryOperation(node.attributes.operator, leftType, rightType);
          }
          break;
          
        case NodeTypes.UNARY_EXPRESSION:
          node.children.forEach(child => this.visitNode(child));
          break;
          
        case NodeTypes.CALL_EXPRESSION:
          if (node.children.length > 0) {
            const funcNode = node.children[0];
            this.visitNode(funcNode);
            
            // Check if function exists
            if (funcNode.type === NodeTypes.IDENTIFIER) {
              const symbol = this.lookup(funcNode.value);
              if (!symbol) {
                this.errors.push(`Undefined function '${funcNode.value}'`);
              } else if (symbol.type !== 'function' && !symbol.builtin) {
                this.errors.push(`'${funcNode.value}' is not a function`);
              }
            }
            
            // Visit arguments
            for (let i = 1; i < node.children.length; i++) {
              this.visitNode(node.children[i]);
            }
          }
          break;
          
        case NodeTypes.MEMBER_EXPRESSION:
          if (node.children.length >= 1) {
            const objectNode = node.children[0];
            this.visitNode(objectNode);
            
            if (objectNode.type === NodeTypes.IDENTIFIER && objectNode.value) {
              const objectSymbol = this.lookup(objectNode.value);
              
              if (!objectSymbol) {
                this.errors.push(`Undefined object '${objectNode.value}'`);
              } else if (objectSymbol.builtin && objectSymbol.members) {
                // Check if computed access
                if (node.attributes?.computed && node.children.length >= 2) {
                  this.visitNode(node.children[1]);
                } else if (node.attributes?.property) {
                  if (!objectSymbol.members.includes(node.attributes.property)) {
                    this.errors.push(`${objectNode.value} has no member '${node.attributes.property}'`);
                  }
                } else if (node.children.length >= 2) {
                  const propertyNode = node.children[1];
                  if (propertyNode.type === NodeTypes.IDENTIFIER && propertyNode.value) {
                    if (!objectSymbol.members.includes(propertyNode.value)) {
                      this.errors.push(`${objectNode.value} has no member '${propertyNode.value}'`);
                    }
                  }
                }
              }
            }
            
            // Visit remaining children
            for (let i = 1; i < node.children.length; i++) {
              this.visitNode(node.children[i]);
            }
          }
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
          
        case NodeTypes.LITERAL:
          // Literals don't need special handling, just visit children if any
          node.children.forEach(child => this.visitNode(child));
          break;
          
        default:
          console.warn(`Unknown node type: ${node.type}`);
          // Visit all children by default
          node.children.forEach(child => this.visitNode(child));
      }
    } catch (error) {
      this.errors.push(`Error analyzing node ${node.type}: ${error.message}`);
    }
  }
  
  checkBinaryOperation(operator, leftType, rightType) {
    const numericOperators = ['+', '-', '*', '/', '%', '**'];
    const comparisonOperators = ['<', '>', '<=', '>='];
    const equalityOperators = ['==', '!=', '===', '!=='];
    const logicalOperators = ['&&', '||'];
    
    if (numericOperators.includes(operator)) {
      if (operator === '+' && (leftType === 'string' || rightType === 'string')) {
        // String concatenation is valid
        return;
      }
      if (leftType !== 'number' && leftType !== 'unknown') {
        this.warnings.push(`Left operand of '${operator}' should be number, got ${leftType}`);
      }
      if (rightType !== 'number' && rightType !== 'unknown') {
        this.warnings.push(`Right operand of '${operator}' should be number, got ${rightType}`);
      }
    }
  }
  
  inferType(node) {
    if (!node) return 'undefined';
    
    switch (node.type) {
      case NodeTypes.LITERAL:
        if (node.attributes && node.attributes.dataType === TokenTypes.NUMBER) return 'number';
        if (node.attributes && node.attributes.dataType === TokenTypes.STRING) return 'string';
        if (node.value === true || node.value === false) return 'boolean';
        if (node.value === null) return 'null';
        if (typeof node.value === 'number') return 'number';
        if (typeof node.value === 'string') return 'string';
        if (typeof node.value === 'boolean') return 'boolean';
        return 'undefined';
        
      case NodeTypes.BINARY_EXPRESSION:
        const leftType = this.inferType(node.children[0]);
        const rightType = this.inferType(node.children[1]);
        const operator = node.attributes && node.attributes.operator;
        
        if (['+', '-', '*', '/', '%', '**'].includes(operator)) {
          if (operator === '+' && (leftType === 'string' || rightType === 'string')) {
            return 'string';
          }
          return 'number';
        }
        
        if (['==', '!=', '<', '>', '<=', '>=', '===', '!==', '&&', '||'].includes(operator)) {
          return 'boolean';
        }
        
        return 'unknown';
        
      case NodeTypes.UNARY_EXPRESSION:
        const operator2 = node.attributes && node.attributes.operator;
        if (operator2 === '!') return 'boolean';
        if (['+', '-', '++', '--'].includes(operator2)) return 'number';
        return 'unknown';
        
      case NodeTypes.IDENTIFIER:
        if (node.value) {
          const symbol = this.lookup(node.value);
          return symbol ? symbol.type : 'unknown';
        }
        return 'unknown';
        
      case NodeTypes.CALL_EXPRESSION:
        // Try to infer return type based on function
        if (node.children.length > 0 && node.children[0].type === NodeTypes.IDENTIFIER) {
          const funcName = node.children[0].value;
          const symbol = this.lookup(funcName);
          if (symbol && symbol.returnType) {
            return symbol.returnType;
          }
          // Known built-in functions
          if (funcName === 'parseInt' || funcName === 'parseFloat') return 'number';
          if (funcName === 'isNaN' || funcName === 'isFinite') return 'boolean';
        }
        return 'unknown';
        
      case NodeTypes.MEMBER_EXPRESSION:
        // Try to infer based on known object methods
        if (node.children.length >= 1 && node.children[0].type === NodeTypes.IDENTIFIER) {
          const objName = node.children[0].value;
          if (objName === 'Math') return 'number';
          if (objName === 'Date') return 'object';
          if (objName === 'JSON') return 'string';
        }
        return 'unknown';
        
      default:
        return 'unknown';
    }
  }
}