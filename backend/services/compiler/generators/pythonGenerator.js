export class PythonCodeGenerator {
  constructor(instructions) {
    this.instructions = instructions;
    this.code = [];
    this.indentLevel = 0;
  }
  
  indent() {
    return '    '.repeat(this.indentLevel);
  }
  
  generate() {
    this.code = [];
    
    for (const instr of this.instructions) {
      this.generateInstruction(instr);
    }
    
    return this.code.join('\n');
  }
  
  generateInstruction(instr) {
    switch (instr.operation) {
      case 'FUNC_START':
        this.code.push(`${this.indent()}def ${instr.arg1}():`);
        this.indentLevel++;
        break;
        
      case 'FUNC_END':
        this.indentLevel--;
        this.code.push('');
        break;
        
      case 'DECLARE':
        this.code.push(`${this.indent()}${instr.arg1} = None`);
        break;
        
      case 'ASSIGN':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}`);
        break;
        
      case 'LOAD_CONST':
        if (typeof instr.arg1 === 'string') {
          this.code.push(`${this.indent()}${instr.result} = "${instr.arg1}"`);
        } else {
          this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}`);
        }
        break;
        
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1} ${instr.operation} ${instr.arg2}`);
        break;
        
      case '==':
      case '!=':
      case '<':
      case '>':
      case '<=':
      case '>=':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1} ${instr.operation} ${instr.arg2}`);
        break;
        
      case '&&':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1} and ${instr.arg2}`);
        break;
        
      case '||':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1} or ${instr.arg2}`);
        break;
        
      case '!':
        this.code.push(`${this.indent()}${instr.result} = not ${instr.arg1}`);
        break;
        
      case 'IF_FALSE':
        this.code.push(`${this.indent()}if not ${instr.arg1}:`);
        this.indentLevel++;
        this.code.push(`${this.indent()}goto ${instr.result}`);
        this.indentLevel--;
        break;
        
      case 'GOTO':
        this.code.push(`${this.indent()}# goto ${instr.result}`);
        break;
        
      case 'LABEL':
        this.code.push(`${this.indent()}# ${instr.result}:`);
        break;
        
      case 'CALL':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}()`);
        break;
        
      case 'RETURN':
        if (instr.arg1) {
          this.code.push(`${this.indent()}return ${instr.arg1}`);
        } else {
          this.code.push(`${this.indent()}return`);
        }
        break;
        
      case 'MEMBER_GET':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}.${instr.arg2}`);
        break;
        
      case 'ARRAY_GET':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}[${instr.arg2}]`);
        break;
        
      default:
        this.code.push(`${this.indent()}# ${instr.toString()}`);
    }
  }
}