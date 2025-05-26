export class PythonCodeGenerator {
  constructor(intermediateCode) {
    this.ic = intermediateCode;
    this.code = [];
    this.indentLevel = 0;
    this.consoleLogVars = new Set();
    this.varMap = new Map();
  }

  indent() {
    return '    '.repeat(this.indentLevel);
  }

  generate() {
    for (const instr of this.ic) {
      this.generateInstruction(instr);
    }
    return this.code.join('\n');
  }
  
  generateInstruction(instr) {
    // Add safety check for undefined instruction
    if (!instr || !instr.operation) {
      console.warn('Skipping undefined or invalid instruction:', instr);
      return;
    }

    switch (instr.operation) {
      case 'FUNC_START':
        this.handleFunctionStart(instr);
        break;

      case 'FUNC_END':
        this.handleFunctionEnd();
        break;

      case 'MEMBER_GET':
        this.handleMemberGet(instr);
        break;

      case 'CALL':
        this.handleCall(instr);
        break;

      case 'LOAD_CONST':
        this.handleLoadConst(instr);
        break;

      case 'ASSIGN':
        this.handleAssign(instr);
        break;
        
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        this.code.push(`${this.indent()}${instr.result || 'temp'} = ${instr.arg1 || 'None'} ${instr.operation} ${instr.arg2 || 'None'}`);
        break;
        
      case '==':
      case '!=':
      case '<':
      case '>':
      case '<=':
      case '>=':
        this.code.push(`${this.indent()}${instr.result || 'temp'} = ${instr.arg1 || 'None'} ${instr.operation} ${instr.arg2 || 'None'}`);
        break;
        
      case '&&':
        this.code.push(`${this.indent()}${instr.result || 'temp'} = ${instr.arg1 || 'None'} and ${instr.arg2 || 'None'}`);
        break;
        
      case '||':
        this.code.push(`${this.indent()}${instr.result || 'temp'} = ${instr.arg1 || 'None'} or ${instr.arg2 || 'None'}`);
        break;
        
      case '!':
        this.code.push(`${this.indent()}${instr.result || 'temp'} = not ${instr.arg1 || 'None'}`);
        break;
        
      case 'IF_FALSE':
        this.code.push(`${this.indent()}if not ${instr.arg1 || 'None'}:`);
        this.indentLevel++;
        this.code.push(`${this.indent()}# goto ${instr.result || 'label'}`);
        this.indentLevel--;
        break;
        
      case 'GOTO':
        this.code.push(`${this.indent()}# goto ${instr.result || 'label'}`);
        break;
        
      case 'LABEL':
        this.code.push(`${this.indent()}# ${instr.result || 'label'}:`);
        break;
        
      case 'RETURN':
        if (instr.arg1) {
          this.code.push(`${this.indent()}return ${instr.arg1}`);
        } else {
          this.code.push(`${this.indent()}return`);
        }
        break;
        
      case 'ARRAY_GET':
        this.code.push(`${this.indent()}${instr.result || 'temp'} = ${instr.arg1 || 'None'}[${instr.arg2 || '0'}]`);
        break;
        
      default:
        this.code.push(`${this.indent()}# Unknown operation: ${instr.operation}`);
        if (instr.toString && typeof instr.toString === 'function') {
          this.code.push(`${this.indent()}# ${instr.toString()}`);
        }
    }
  }

  handleFunctionStart(instr) {
    const funcName = instr.arg1 || 'anonymous_function';
    this.code.push(`${this.indent()}def ${funcName}():`);
    this.indentLevel++;
  }

  handleFunctionEnd() {
    this.indentLevel--;
    this.code.push('');
  }

  handleMemberGet(instr) {
    // Directly map console.log to Python print
    if (instr.arg1 === 'console' && instr.arg2 === 'log') {
      this.code.push(`${this.indent()}${instr.result} = print`);
      return;
    }
    this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}.${instr.arg2}`);
  }

  handleCall(instr) {
    const args = (instr.params || []).map(param => {
      const value = this.varMap.get(param);
      return typeof value === 'string' ? `"${value}"` : value;
    }).join(', ');

    if (instr.arg1 === 'print') {
      this.code.push(`${this.indent()}print(${args})`);
    } else {
      this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}(${args})`);
    }
  }

  handleLoadConst(instr) {
    this.varMap.set(instr.result, instr.arg1);
    if (typeof instr.arg1 === 'string') {
      this.code.push(`${this.indent()}${instr.result} = "${instr.arg1}"`);
    } else {
      this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}`);
    }
  }

  handleAssign(instr) {
    // Add safety checks
    if (!instr.result || !instr.arg1) {
      console.warn('Invalid ASSIGN instruction:', instr);
      return;
    }

    const value = this.varMap.get(instr.arg1);
    if (value !== undefined) {
      this.code.push(`${this.indent()}${instr.result} = ${typeof value === 'string' ? `"${value}"` : value}`);
    } else {
      this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}`);
    }
  }
}