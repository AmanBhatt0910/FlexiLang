export class IntermediateInstruction {
  constructor(operation, arg1 = null, arg2 = null, result = null) {
    this.operation = operation;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.result = result;
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
    this.ast = ast;
    this.instructions = [];
    this.tempCounter = 0;
    this.labelCounter = 0;
  }
  
  newTemp() {
    return `t${this.tempCounter++}`;
  }
  
  newLabel() {
    return `L${this.labelCounter++}`;
  }
  
  emit(operation, arg1 = null, arg2 = null, result = null) {
    const instruction = new IntermediateInstruction(operation, arg1, arg2, result);
    this.instructions.push(instruction);
    return instruction;
  }
  
  generate() {
    this.visitNode(this.ast);
    return this.instructions;
  }
  
  visitNode(node) {
    if (!node) return null;

    switch (node.type) {
      case NodeTypes.PROGRAM: {
        node.children.forEach(child => this.visitNode(child));
        break;
      }
        
      case NodeTypes.FUNCTION_DECLARATION: {
        this.emit('FUNC_START', node.value);
        node.children.forEach(child => this.visitNode(child));
        this.emit('FUNC_END', node.value);
        break;
      }
        
      case NodeTypes.VARIABLE_DECLARATION: {
        if (node.children.length > 0) {
          const valueTemp = this.visitNode(node.children[0]);
          this.emit('ASSIGN', valueTemp, null, node.value);
        } else {
          this.emit('DECLARE', node.value);
        }
        break;
      }
        
      case NodeTypes.ASSIGNMENT: {
        const rightTemp = this.visitNode(node.children[1]);
        const leftNode = node.children[0];
        
        if (leftNode.type === NodeTypes.IDENTIFIER) {
          this.emit('ASSIGN', rightTemp, null, leftNode.value);
        } else if (leftNode.type === NodeTypes.MEMBER_EXPRESSION) {
          const objTemp = this.visitNode(leftNode.children[0]);
          if (leftNode.attributes.computed) {
            const indexTemp = this.visitNode(leftNode.children[1]);
            this.emit('ARRAY_SET', objTemp, indexTemp, rightTemp);
          } else {
            this.emit('MEMBER_SET', objTemp, leftNode.attributes.property, rightTemp);
          }
        }
        return rightTemp;
      }
        
      case NodeTypes.BINARY_EXPRESSION: {
        const leftTemp = this.visitNode(node.children[0]);
        const rightTempVal = this.visitNode(node.children[1]);
        const resultTemp = this.newTemp();
        
        this.emit(node.attributes.operator, leftTemp, rightTempVal, resultTemp);
        return resultTemp;
      }
        
      case NodeTypes.UNARY_EXPRESSION: {
        const operandTemp = this.visitNode(node.children[0]);
        const unaryResultTemp = this.newTemp();
        
        this.emit(node.attributes.operator, operandTemp, null, unaryResultTemp);
        return unaryResultTemp;
      }
        
      case NodeTypes.CALL_EXPRESSION: {
        const funcTemp = this.visitNode(node.children[0]);
        const argTemps = [];
        
        for (let i = 1; i < node.children.length; i++) {
          argTemps.push(this.visitNode(node.children[i]));
        }
        
        argTemps.forEach((arg, index) => {
          this.emit('PARAM', arg, null, index);
        });
        
        const callResultTemp = this.newTemp();
        this.emit('CALL', funcTemp, argTemps.length, callResultTemp);
        return callResultTemp;
      }
        
      case NodeTypes.MEMBER_EXPRESSION: {
        const objectTemp = this.visitNode(node.children[0]);
        const memberResultTemp = this.newTemp();
        
        if (node.attributes.computed) {
          const indexTemp = this.visitNode(node.children[1]);
          this.emit('ARRAY_GET', objectTemp, indexTemp, memberResultTemp);
        } else {
          this.emit('MEMBER_GET', objectTemp, node.attributes.property, memberResultTemp);
        }
        
        return memberResultTemp;
      }
        
      case NodeTypes.IF_STATEMENT: {
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
        if (node.children.length > 0) {
          const returnValueTemp = this.visitNode(node.children[0]);
          this.emit('RETURN', returnValueTemp);
        } else {
          this.emit('RETURN');
        }
        break;
      }
        
      case NodeTypes.BLOCK_STATEMENT: {
        node.children.forEach(child => this.visitNode(child));
        break;
      }
        
      case NodeTypes.EXPRESSION_STATEMENT: {
        this.visitNode(node.children[0]);
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
        node.children.forEach(child => this.visitNode(child));
      }
    }
    
    return null;
  }
}