// Import NodeTypes properly
import { NodeTypes } from './ast.js';

export class IntermediateInstruction {
  constructor(operation, arg1 = null, arg2 = null, result = null, params = []) {
    this.operation = operation;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.result = result;
    this.params = params;
  }
  
  toString() {
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
  constructor(ast) {
    if (!ast) {
      throw new Error('AST is required for IntermediateCodeGenerator');
    }
    
    this.ast = ast;
    this.instructions = [];
    this.tempCounter = 0;
    this.labelCounter = 0;
    
    // Validate that NodeTypes is available
    if (typeof NodeTypes === 'undefined') {
      throw new Error('NodeTypes is not defined. Make sure to import NodeTypes properly.');
    }
  }
  
  newTemp() {
    return `t${this.tempCounter++}`;
  }
  
  newLabel() {
    return `L${this.labelCounter++}`;
  }
  
  emit(operation, arg1 = null, arg2 = null, result = null) {
    try {
      const instruction = new IntermediateInstruction(operation, arg1, arg2, result);
      this.instructions.push(instruction);
      return instruction;
    } catch (error) {
      throw new Error(`Failed to create intermediate instruction: ${error.message}`);
    }
  }
  
  generate() {
    try {
      this.visitNode(this.ast);
      return this.instructions;
    } catch (error) {
      throw new Error(`Failed to generate intermediate code: ${error.message}`);
    }
  }
  
  visitNode(node) {
    if (!node) return null;

    try {
      switch (node.type) {
        case NodeTypes.PROGRAM: {
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => this.visitNode(child));
          }
          break;
        }
          
        case NodeTypes.FUNCTION_DECLARATION: {
          this.emit('FUNC_START', node.value);
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => this.visitNode(child));
          }
          this.emit('FUNC_END', node.value);
          break;
        }
          
        case NodeTypes.VARIABLE_DECLARATION: {
          if (node.children && node.children.length > 0) {
            const valueTemp = this.visitNode(node.children[0]);
            this.emit('ASSIGN', valueTemp, null, node.value);
          } else {
            this.emit('DECLARE', node.value);
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
              const property = leftNode.attributes ? leftNode.attributes.property : null;
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
          const rightTempVal = this.visitNode(node.children[1]);
          const resultTemp = this.newTemp();
          
          const operator = node.attributes ? node.attributes.operator : '+';
          this.emit(operator, leftTemp, rightTempVal, resultTemp);
          return resultTemp;
        }
          
        case NodeTypes.UNARY_EXPRESSION: {
          if (!node.children || node.children.length < 1) {
            throw new Error('Unary expression node must have at least 1 child');
          }
          
          const operandTemp = this.visitNode(node.children[0]);
          const unaryResultTemp = this.newTemp();
          
          const operator = node.attributes ? node.attributes.operator : '-';
          this.emit(operator, operandTemp, null, unaryResultTemp);
          return unaryResultTemp;
        }
          
        case NodeTypes.CALL_EXPRESSION: {
        if (!node.children || node.children.length < 1) {
          throw new Error('Call expression node must have at least 1 child');
        }

        const funcTemp = this.visitNode(node.children[0]);
        const argTemps = [];
        
        for (let i = 1; i < node.children.length; i++) {
          argTemps.push(this.visitNode(node.children[i]));
        }

        const callResultTemp = this.newTemp();
        this.emit('CALL', funcTemp, null, callResultTemp, argTemps); // Add params as 4th argument
        return callResultTemp;
      }
          
        case NodeTypes.MEMBER_EXPRESSION: {
          if (!node.children || node.children.length < 1) {
            throw new Error('Member expression node must have at least 1 child');
          }
          
          const objectTemp = this.visitNode(node.children[0]);
          const memberResultTemp = this.newTemp();
          
          if (node.attributes && node.attributes.computed) {
            if (node.children.length < 2) {
              throw new Error('Computed member expression must have 2 children');
            }
            const indexTemp = this.visitNode(node.children[1]);
            this.emit('ARRAY_GET', objectTemp, indexTemp, memberResultTemp);
          } else {
            const property = node.attributes ? node.attributes.property : null;
            this.emit('MEMBER_GET', objectTemp, property, memberResultTemp);
          }
          
          return memberResultTemp;
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
          
          this.emit('LABEL', null, null, loopStart);
          const whileConditionTemp = this.visitNode(node.children[0]);
          this.emit('IF_FALSE', whileConditionTemp, null, loopEnd);
          this.visitNode(node.children[1]); // body
          this.emit('GOTO', null, null, loopStart);
          this.emit('LABEL', null, null, loopEnd);
          break;
        }
          
        case NodeTypes.FOR_STATEMENT: {
          if (!node.children || node.children.length < 4) {
            throw new Error('For statement node must have 4 children');
          }
          
          const forStart = this.newLabel();
          const forEnd = this.newLabel();
          
          this.visitNode(node.children[0]); // initialization
          this.emit('LABEL', null, null, forStart);
          const forConditionTemp = this.visitNode(node.children[1]);
          this.emit('IF_FALSE', forConditionTemp, null, forEnd);
          this.visitNode(node.children[3]); // body
          this.visitNode(node.children[2]); // update
          this.emit('GOTO', null, null, forStart);
          this.emit('LABEL', null, null, forEnd);
          break;
        }
          
        case NodeTypes.RETURN_STATEMENT: {
          if (node.children && node.children.length > 0) {
            const returnValueTemp = this.visitNode(node.children[0]);
            this.emit('RETURN', returnValueTemp);
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
          
        case NodeTypes.EXPRESSION_STATEMENT: {
          if (node.children && node.children.length > 0) {
            this.visitNode(node.children[0]);
          }
          break;
        }
          
        case NodeTypes.IDENTIFIER: {
          return node.value;
        }
          
        case NodeTypes.LITERAL: {
          const literalTemp = this.newTemp();
          this.emit('LOAD_CONST', node.value, null, literalTemp);
          return literalTemp;
        }
          
        default: {
          console.warn(`Unknown node type: ${node.type}`);
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => this.visitNode(child));
          }
        }
      }
    } catch (error) {
      throw new Error(`Error processing node type ${node.type}: ${error.message}`);
    }
    
    return null;
  }
}

// For debugging purposes, log the exports
console.log('Exporting IntermediateInstruction:', typeof IntermediateInstruction);
console.log('Exporting IntermediateCodeGenerator:', typeof IntermediateCodeGenerator);