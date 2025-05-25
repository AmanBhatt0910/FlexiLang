export class JavaCodeGenerator {
  constructor(instructions) {
    this.instructions = instructions;
    this.code = [];
    this.indentLevel = 0;
  }
  
  indent() {
    return '    '.repeat(this.indentLevel);
  }
  
  generate() {
    this.code = ['public class GeneratedCode {'];
    this.indentLevel++;
    
    for (const instr of this.instructions) {
      this.generateInstruction(instr);
    }
    
    this.indentLevel--;
    this.code.push('}');
    
    return this.code.join('\n');
  }
  
  generateInstruction(instr) {
    switch (instr.operation) {
      case 'FUNC_START':
        this.code.push(`${this.indent()}public static void ${instr.arg1}() {`);
        this.indentLevel++;
        break;
        
      case 'FUNC_END':
        this.indentLevel--;
        this.code.push(`${this.indent()}}`);
        this.code.push('');
        break;
        
      case 'DECLARE':
        this.code.push(`${this.indent()}Object ${instr.arg1};`);
        break;
        
      case 'ASSIGN':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1};`);
        break;
        
      case 'LOAD_CONST':
        if (typeof instr.arg1 === 'string') {
          this.code.push(`${this.indent()}String ${instr.result} = "${instr.arg1}";`);
        } else if (typeof instr.arg1 === 'number') {
          this.code.push(`${this.indent()}double ${instr.result} = ${instr.arg1};`);
        } else {
          this.code.push(`${this.indent()}Object ${instr.result} = ${instr.arg1};`);
        }
        break;
        
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1} ${instr.operation} ${instr.arg2};`);
        break;
        
      case '&&':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1} && ${instr.arg2};`);
        break;
        
      case '||':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1} || ${instr.arg2};`);
        break;
        
      case 'RETURN':
        if (instr.arg1) {
          this.code.push(`${this.indent()}return ${instr.arg1};`);
        } else {
          this.code.push(`${this.indent()}return;`);
        }
        break;
        
      default:
        this.code.push(`${this.indent()}// ${instr.toString()}`);
    }
  }
}