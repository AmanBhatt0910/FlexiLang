export class CGenerator {
  constructor(instructions) {
    this.instructions = instructions;
    this.code = [];
    this.indentLevel = 0;
    this.currentFunction = null;
  }

  indent() {
    return '    '.repeat(this.indentLevel);
  }

  generate() {
    this.code.push('#include <stdio.h>');
    this.code.push('#include <stdlib.h>');
    this.code.push('');

    for (const instr of this.instructions) {
      this.generateInstruction(instr);
    }

    return this.code.join('\n');
  }

  generateInstruction(instr) {
    switch (instr.operation) {
      case 'FUNC_START':
        this.currentFunction = instr.arg1;
        this.code.push(`void ${instr.arg1}() {`);
        this.indentLevel++;
        break;

      case 'FUNC_END':
        this.indentLevel--;
        this.code.push('}\n');
        this.currentFunction = null;
        break;

      case 'DECLARE':
        this.code.push(`${this.indent()}int ${instr.arg1};`);
        break;

      case 'ASSIGN':
        this.code.push(`${this.indent()}${instr.result} = ${instr.arg1};`);
        break;

      case 'LOAD_CONST':
        if (typeof instr.arg1 === 'string') {
          this.code.push(`${this.indent()}char* ${instr.result} = "${instr.arg1}";`);
        } else {
          this.code.push(`${this.indent()}int ${instr.result} = ${instr.arg1};`);
        }
        break;

      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        this.code.push(
          `${this.indent()}int ${instr.result} = ${instr.arg1} ${instr.operation} ${instr.arg2};`
        );
        break;

      case 'CALL':
        if (instr.arg1 === 'print') {
          this.code.push(`${this.indent()}printf("%d\\n", ${instr.result});`);
        } else {
          this.code.push(`${this.indent()}${instr.result} = ${instr.arg1}();`);
        }
        break;

      case 'RETURN':
        if (instr.arg1) {
          this.code.push(`${this.indent()}return ${instr.arg1};`);
        } else {
          this.code.push(`${this.indent()}return;`);
        }
        break;

      case 'IF_FALSE':
        this.code.push(`${this.indent()}if (!${instr.arg1}) {`);
        this.indentLevel++;
        break;

      case 'LABEL':
        this.code.push(`${instr.result}:`);
        break;

      case 'GOTO':
        this.code.push(`${this.indent()}goto ${instr.result};`);
        break;

      default:
        this.code.push(`${this.indent()}// ${instr.toString()}`);
    }
  }
}