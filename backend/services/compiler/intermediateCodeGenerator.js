// Import NodeTypes properly
import { NodeTypes } from './ast.js';

export class IntermediateInstruction {
  constructor(operation, arg1 = null, arg2 = null, result = null, params = []) {
    this.operation = operation;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.result = result;
    this.params = params || [];
    this.label = null; // For labels
  }
  
  toString() {
    if (this.operation === 'LABEL') {
      return `${this.result}:`;
    }
    
    if (this.operation === 'GOTO') {
      return `GOTO ${this.result}`;
    }
    
    if (this.operation === 'IF_FALSE') {
      return `IF_FALSE ${this.arg1} GOTO ${this.result}`;
    }
    
    if (this.operation === 'CALL') {
      const paramsStr = this.params.length > 0 ? `(${this.params.join(', ')})` : '()';
      return `${this.result} = CALL ${this.arg1}${paramsStr}`;
    }
    
    if (this.operation === 'PRINT') {
      const args = [this.arg1, this.arg2, ...this.params].filter(arg => arg !== null && arg !== undefined);
      return `PRINT ${args.join(', ')}`;
    }
    
    if (this.operation === 'CONSOLE_LOG') {
      const args = [this.arg1, this.arg2, ...this.params].filter(arg => arg !== null && arg !== undefined);
      return `CONSOLE_LOG ${args.join(', ')}`;
    }
    
    if (this.operation === 'RETURN') {
      return this.arg1 ? `RETURN ${this.arg1}` : 'RETURN';
    }
    
    if (this.operation === 'FUNC_START') {
      return `FUNC_START ${this.arg1}`;
    }
    
    if (this.operation === 'FUNC_END') {
      return `FUNC_END ${this.arg1}`;
    }
    
    if (this.operation === 'LOAD_CONST') {
      return `${this.result} = ${this.arg1}`;
    }
    
    if (this.operation === 'LOAD_STRING') {
      return `${this.result} = "${this.arg1}"`;
    }
    
    if (this.operation === 'ASSIGN') {
      return `${this.result} = ${this.arg1}`;
    }
    
    if (this.operation === 'DECLARE') {
      return `DECLARE ${this.arg1}`;
    }
    
    if (this.arg2 !== null) {
      return `${this.result} = ${this.arg1} ${this.operation} ${this.arg2}`;
    } else if (this.arg1 !== null) {
      return `${this.result} = ${this.operation} ${this.arg1}`;
    } else {
      return `${this.operation} ${this.result || ''}`.trim();
    }
  }
}

export class IntermediateCodeGenerator {
  constructor(astResult, symbolTable = null) {
    console.log('=== IntermediateCodeGenerator Constructor ===');
    console.log('AST received:', astResult);
    
    if (!astResult) {
      throw new Error('AST result is required for IntermediateCodeGenerator');
    }
    
    // Handle the wrapped AST structure { ast: ..., errors: [] }
    if (astResult.ast) {
      this.ast = astResult.ast;
      this.errors = astResult.errors || [];
    } else {
      // Direct AST node
      this.ast = astResult;
      this.errors = [];
    }
    
    this.symbolTable = symbolTable || new Map();
    this.instructions = [];
    this.tempCounter = 0;
    this.labelCounter = 0;
    this.functionStack = [];
    this.loopStack = []; // For break/continue
    
    // Validate that NodeTypes is available
    if (typeof NodeTypes === 'undefined') {
      console.error('NodeTypes is not defined!');
      throw new Error('NodeTypes is not defined. Make sure to import NodeTypes properly.');
    }
    
    console.log('NodeTypes available:', Object.keys(NodeTypes));
  }
  
  newTemp() {
    return `t${this.tempCounter++}`;
  }
  
  newLabel() {
    return `L${this.labelCounter++}`;
  }
  
  emit(operation, arg1 = null, arg2 = null, result = null, params = []) {
    try {
      const instruction = new IntermediateInstruction(
        operation, 
        arg1, 
        arg2, 
        result, 
        params
      );
      
      console.log(`Emitted: ${instruction.toString()}`);
      this.instructions.push(instruction);
      return instruction;
    } catch (error) {
      throw new Error(`Failed to create intermediate instruction: ${error.message}`);
    }
  }
  
  generate() {
    console.log('=== Starting Intermediate Code Generation ===');
    console.log('AST to process:', JSON.stringify(this.ast, null, 2));
    
    try {
      // Visit the actual AST node, not the wrapper
      this.visitNode(this.ast);
      
      const result = {
        instructions: this.instructions,
        code: this.instructions.map(i => i.toString()).join('\n'),
        stats: {
          instructionCount: this.instructions.length,
          tempVariableCount: this.tempCounter,
          labelCount: this.labelCounter
        }
      };
      
      console.log('Generated intermediate code:', result);
      return result;
    } catch (error) {
      console.error('Error in generate():', error);
      throw new Error(`Failed to generate intermediate code: ${error.message}`);
    }
  }
  
  visitNode(node) {
    if (!node) {
      console.log('visitNode: null node');
      return null;
    }

    console.log(`Visiting node: type=${node.type}, value=${node.value}, children=${node.children?.length || 0}`);

    try {
      switch (node.type) {
        case NodeTypes.PROGRAM: {
          console.log('Processing PROGRAM node');
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => this.visitNode(child));
          }
          break;
        }
          
        case NodeTypes.EXPRESSION_STATEMENT: {
          console.log('Processing EXPRESSION_STATEMENT');
          if (node.children && node.children.length > 0) {
            return this.visitNode(node.children[0]);
          }
          break;
        }
          
        case NodeTypes.CALL_EXPRESSION: {
          console.log('Processing CALL_EXPRESSION');
          if (!node.children || node.children.length < 1) {
            throw new Error('Call expression node must have at least 1 child');
          }

          // Check if this is console.log
          const callee = node.children[0];
          console.log('Call expression callee:', callee);
          
          if (this.isConsoleLog(callee)) {
            console.log('Detected console.log call');
            return this.handleConsoleLog(node);
          }

          // Handle regular function calls
          const funcTemp = this.visitNode(callee);
          const argTemps = [];
          
          // Collect parameters
          for (let i = 1; i < node.children.length; i++) {
            const argTemp = this.visitNode(node.children[i]);
            if (argTemp !== null) {
              argTemps.push(argTemp);
            }
          }

          const resultTemp = this.newTemp();
          this.emit('CALL', funcTemp, null, resultTemp, argTemps);
          return resultTemp;
        }
          
        case NodeTypes.MEMBER_EXPRESSION: {
          console.log('Processing MEMBER_EXPRESSION');
          if (!node.children || node.children.length < 1) {
            throw new Error('Member expression node must have at least 1 child');
          }

          const objectTemp = this.visitNode(node.children[0]);
          
          // Handle the property - it could be in attributes or as a child
          let propertyTemp;
          if (node.attributes && node.attributes.property) {
            propertyTemp = node.attributes.property;
          } else if (node.children.length > 1) {
            propertyTemp = this.visitNode(node.children[1]);
          } else {
            throw new Error('Member expression must have a property');
          }

          const resultTemp = this.newTemp();

          if (node.attributes && node.attributes.computed) {
            this.emit('ARRAY_GET', objectTemp, propertyTemp, resultTemp);
          } else {
            this.emit('MEMBER_GET', objectTemp, propertyTemp, resultTemp);
          }

          return resultTemp;
        }
          
        case NodeTypes.IDENTIFIER: {
          console.log(`Processing IDENTIFIER: ${node.value}`);
          return node.value;
        }
          
        case NodeTypes.LITERAL: {
          console.log(`Processing LITERAL: ${node.value} (type: ${typeof node.value})`);
          const temp = this.newTemp();
          let value = node.value;
          
          // Handle different literal types
          if (typeof value === 'string') {
            this.emit('LOAD_STRING', value, null, temp);
          } else if (typeof value === 'number') {
            this.emit('LOAD_CONST', value, null, temp);
          } else if (value === null) {
            this.emit('LOAD_CONST', 'null', null, temp);
          } else if (value === undefined) {
            this.emit('LOAD_CONST', 'undefined', null, temp);
          } else if (typeof value === 'boolean') {
            this.emit('LOAD_CONST', value.toString(), null, temp);
          } else {
            this.emit('LOAD_CONST', String(value), null, temp);
          }
          
          return temp;
        }

        case NodeTypes.FUNCTION_DECLARATION: {
          const funcName = node.value || 'anonymous';
          this.functionStack.push(funcName);
          
          this.emit('FUNC_START', funcName);
          
          // Handle parameters
          if (node.attributes && node.attributes.parameters) {
            node.attributes.parameters.forEach(param => {
              this.emit('DECLARE', param);
            });
          }
          
          // Process function body
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => this.visitNode(child));
          }
          
          this.emit('FUNC_END', funcName);
          this.functionStack.pop();
          break;
        }
          
        case NodeTypes.VARIABLE_DECLARATION: {
          if (node.value) {
            if (node.children && node.children.length > 0) {
              const valueTemp = this.visitNode(node.children[0]);
              this.emit('ASSIGN', valueTemp, null, node.value);
            } else {
              this.emit('DECLARE', node.value);
            }
          }
          break;
        }
          
        case NodeTypes.ASSIGNMENT: {
          if (!node.children || node.children.length < 2) {
            throw new Error('Assignment node must have at least 2 children');
          }
          
          const rightTemp = this.visitNode(node.children[1]);
          const leftNode = node.children[0];
          
          if (leftNode.type === NodeTypes.IDENTIFIER) {
            this.emit('ASSIGN', rightTemp, null, leftNode.value);
          } else if (leftNode.type === NodeTypes.MEMBER_EXPRESSION) {
            const objTemp = this.visitNode(leftNode.children[0]);
            if (leftNode.attributes && leftNode.attributes.computed) {
              const indexTemp = this.visitNode(leftNode.children[1]);
              this.emit('ARRAY_SET', objTemp, indexTemp, rightTemp);
            } else {
              const property = leftNode.attributes?.property || 
                              (leftNode.children[1]?.value);
              this.emit('MEMBER_SET', objTemp, property, rightTemp);
            }
          }
          return rightTemp;
        }
          
        case NodeTypes.BINARY_EXPRESSION: {
          if (!node.children || node.children.length < 2) {
            throw new Error('Binary expression node must have at least 2 children');
          }
          
          const leftTemp = this.visitNode(node.children[0]);
          const rightTemp = this.visitNode(node.children[1]);
          const resultTemp = this.newTemp();
          
          const operator = node.attributes?.operator || '+';
          this.emit(operator, leftTemp, rightTemp, resultTemp);
          return resultTemp;
        }
          
        case NodeTypes.UNARY_EXPRESSION: {
          if (!node.children || node.children.length < 1) {
            throw new Error('Unary expression node must have at least 1 child');
          }
          
          const operandTemp = this.visitNode(node.children[0]);
          const resultTemp = this.newTemp();
          
          const operator = node.attributes?.operator || '-';
          this.emit(operator, operandTemp, null, resultTemp);
          return resultTemp;
        }
          
        case NodeTypes.IF_STATEMENT: {
          if (!node.children || node.children.length < 2) {
            throw new Error('If statement node must have at least 2 children');
          }
          
          const conditionTemp = this.visitNode(node.children[0]);
          const elseLabel = this.newLabel();
          const endLabel = this.newLabel();
          
          this.emit('IF_FALSE', conditionTemp, null, elseLabel);
          this.visitNode(node.children[1]); // consequent
          
          if (node.children.length > 2) { // has else
            this.emit('GOTO', null, null, endLabel);
            this.emit('LABEL', null, null, elseLabel);
            this.visitNode(node.children[2]); // alternate
            this.emit('LABEL', null, null, endLabel);
          } else {
            this.emit('LABEL', null, null, elseLabel);
          }
          break;
        }
          
        case NodeTypes.WHILE_STATEMENT: {
          if (!node.children || node.children.length < 2) {
            throw new Error('While statement node must have at least 2 children');
          }
          
          const loopStart = this.newLabel();
          const loopEnd = this.newLabel();
          
          this.loopStack.push({ start: loopStart, end: loopEnd });
          
          this.emit('LABEL', null, null, loopStart);
          const conditionTemp = this.visitNode(node.children[0]);
          this.emit('IF_FALSE', conditionTemp, null, loopEnd);
          this.visitNode(node.children[1]); // body
          this.emit('GOTO', null, null, loopStart);
          this.emit('LABEL', null, null, loopEnd);
          
          this.loopStack.pop();
          break;
        }
          
        case NodeTypes.FOR_STATEMENT: {
          if (!node.children || node.children.length < 4) {
            throw new Error('For statement node must have 4 children');
          }
          
          const loopStart = this.newLabel();
          const loopEnd = this.newLabel();
          const loopContinue = this.newLabel();
          
          this.loopStack.push({ start: loopContinue, end: loopEnd });
          
          this.visitNode(node.children[0]); // initialization
          this.emit('LABEL', null, null, loopStart);
          
          if (node.children[1]) { // condition
            const conditionTemp = this.visitNode(node.children[1]);
            this.emit('IF_FALSE', conditionTemp, null, loopEnd);
          }
          
          this.visitNode(node.children[3]); // body
          
          this.emit('LABEL', null, null, loopContinue);
          if (node.children[2]) { // update
            this.visitNode(node.children[2]);
          }
          this.emit('GOTO', null, null, loopStart);
          this.emit('LABEL', null, null, loopEnd);
          
          this.loopStack.pop();
          break;
        }
          
        case NodeTypes.RETURN_STATEMENT: {
          if (node.children && node.children.length > 0) {
            const returnTemp = this.visitNode(node.children[0]);
            this.emit('RETURN', returnTemp);
          } else {
            this.emit('RETURN');
          }
          break;
        }
          
        case NodeTypes.BLOCK_STATEMENT: {
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => this.visitNode(child));
          }
          break;
        }
          
        default: {
          console.warn(`Unknown node type: ${node.type}`);
          // Visit all children by default
          if (node.children && Array.isArray(node.children)) {
            const results = [];
            node.children.forEach(child => {
              const result = this.visitNode(child);
              if (result !== null) {
                results.push(result);
              }
            });
            return results.length === 1 ? results[0] : results.length > 0 ? results : null;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing node type ${node.type}:`, error);
      throw new Error(`Error processing node type ${node.type}: ${error.message}`);
    }
    
    return null;
  }
  
  isConsoleLog(node) {
    if (!node || node.type !== NodeTypes.MEMBER_EXPRESSION) return false;
    if (!node.children || node.children.length < 1) return false;
    
    // Check if object is 'console'
    const objectNode = node.children[0];
    if (objectNode.type !== NodeTypes.IDENTIFIER || objectNode.value !== 'console') {
      return false;
    }
    
    // Check if property is 'log'
    const property = node.attributes?.property;
    return property === 'log';
  }
  
  handleConsoleLog(callNode) {
    console.log('Handling console.log with', callNode.children.length - 1, 'arguments');
    
    // Process all arguments
    const argTemps = [];
    for (let i = 1; i < callNode.children.length; i++) {
      const argTemp = this.visitNode(callNode.children[i]);
      if (argTemp !== null) {
        argTemps.push(argTemp);
      }
    }
    
    console.log('console.log arguments:', argTemps);
    
    // Emit PRINT instruction for Python translation
    if (argTemps.length === 0) {
      this.emit('PRINT');
    } else if (argTemps.length === 1) {
      this.emit('PRINT', argTemps[0]);
    } else {
      this.emit('PRINT', argTemps[0], argTemps[1], null, argTemps.slice(2));
    }
    
    return null;
  }
  
  // Helper method to optimize generated code
  optimize() {
    // Simple optimizations
    const optimized = [];
    
    for (let i = 0; i < this.instructions.length; i++) {
      const inst = this.instructions[i];
      const nextInst = this.instructions[i + 1];
      
      // Remove redundant assignments like: t1 = t0; t2 = t1;
      if (inst.operation === 'ASSIGN' && 
          nextInst && 
          nextInst.operation === 'ASSIGN' && 
          nextInst.arg1 === inst.result) {
        optimized.push(new IntermediateInstruction(
          'ASSIGN', 
          inst.arg1, 
          null, 
          nextInst.result
        ));
        i++; // Skip next instruction
      } else {
        optimized.push(inst);
      }
    }
    
    this.instructions = optimized;
    return this;
  }
  
  // Helper method to get statistics
  getStatistics() {
    return {
      totalInstructions: this.instructions.length,
      tempVariables: this.tempCounter,
      labels: this.labelCounter,
      functions: this.functionStack.length,
      instructionTypes: this.instructions.reduce((acc, inst) => {
        acc[inst.operation] = (acc[inst.operation] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// For debugging purposes, log the exports
console.log('Exporting IntermediateInstruction:', typeof IntermediateInstruction);
console.log('Exporting IntermediateCodeGenerator:', typeof IntermediateCodeGenerator);