export class PythonCodeGenerator {
  constructor(intermediateCode) {
    console.log('=== PythonCodeGenerator Constructor ===');
    console.log('Intermediate Code:', intermediateCode);
    
    // FIX: Properly extract instructions from the intermediate code object
    if (Array.isArray(intermediateCode)) {
      // If it's already an array of instructions
      this.ic = intermediateCode;
    } else if (intermediateCode && Array.isArray(intermediateCode.instructions)) {
      // If it's an object with instructions property (most common case)
      this.ic = intermediateCode.instructions;
    } else if (intermediateCode && intermediateCode.ic && Array.isArray(intermediateCode.ic)) {
      // Alternative property name
      this.ic = intermediateCode.ic;
    } else {
      // Fallback to empty array
      this.ic = [];
    }
    
    console.log('Extracted instructions count:', this.ic.length);
    console.log('First few instructions:', this.ic.slice(0, 3));
    
    this.code = [];
    this.indentLevel = 0;
    this.varMap = new Map();
    this.labelMap = new Map();
    this.currentLine = 0;
    this.imports = new Set();
    this.functionStack = [];
    this.loopStack = [];
    this.tempVarCounter = 0;
    this.usedVars = new Set();
  }

  indent() {
    return '    '.repeat(this.indentLevel);
  }

  generate() {
    console.log('=== PythonCodeGenerator.generate() called ===');
    console.log('Instructions to process:', this.ic.length);
    
    if (this.ic.length === 0) {
      console.log('No instructions to process');
      return '# No code to generate';
    }
    
    // First pass: analyze and prepare
    this.analyzeInstructions();
    
    // Second pass: map labels to line numbers
    this.mapLabels();
    
    // Third pass: generate code
    for (let i = 0; i < this.ic.length; i++) {
      const instr = this.ic[i];
      console.log(`Processing instruction ${i}:`, instr);
      
      if (!instr || !instr.operation) {
        console.warn(`Skipping invalid instruction at ${i}:`, instr);
        continue;
      }
      
      try {
        this.generateInstruction(instr);
        console.log(`Code after instruction ${i}:`, this.code.slice(-3)); // Show last 3 lines
      } catch (error) {
        console.error(`Error processing instruction ${i}:`, error);
        this.code.push(`${this.indent()}# Error processing instruction: ${error.message}`);
      }
    }
    
    // Add imports at the beginning if needed
    const importsCode = this.generateImports();
    
    // Clean up and combine code
    const codeBody = this.code
      .filter(line => line !== null && line !== undefined)
      .map(line => typeof line === 'string' ? line : String(line))
      .filter(line => line.trim() !== '' || this.indentLevel > 0); // Keep empty lines inside functions
    
    const result = importsCode + codeBody.join('\n');
    
    console.log('=== Final result ===');
    console.log('Final result:', result);
    return result;
  }

  analyzeInstructions() {
    console.log('=== Analyzing instructions ===');
    
    // Look for required imports
    for (const instr of this.ic) {
      if (!instr || !instr.operation) continue;
      
      if (instr.operation === 'MEMBER_GET' && instr.arg1 === 'Math') {
        this.imports.add('math');
      }
      
      if (instr.operation === 'CALL') {
        const funcName = this.varMap.get(instr.arg1) || instr.arg1;
        if (funcName && funcName.startsWith('math.')) {
          this.imports.add('math');
        }
        if (funcName && funcName.startsWith('random.')) {
          this.imports.add('random');
        }
      }
    }
  }

  generateImports() {
    if (this.imports.size === 0) return '';
    
    const importLines = Array.from(this.imports)
      .sort()
      .map(imp => `import ${imp}`)
      .join('\n');
    
    return importLines + '\n\n';
  }

  mapLabels() {
    console.log('=== Mapping labels ===');
    this.currentLine = 0;
    
    for (const instr of this.ic) {
      if (!instr || !instr.operation) continue;
      
      if (instr.operation === 'LABEL') {
        this.labelMap.set(instr.result, this.currentLine);
        console.log(`Mapped label ${instr.result} to line ${this.currentLine}`);
      } else if (instr.operation !== 'GOTO' && instr.operation !== 'IF_FALSE') {
        this.currentLine++;
      }
    }
  }
  
  generateInstruction(instr) {
    console.log('=== generateInstruction called ===');
    console.log('Instruction:', instr);

    if (!instr || !instr.operation) {
      console.warn('Skipping undefined or invalid instruction:', instr);
      return;
    }

    console.log('Processing operation:', instr.operation);

    switch (instr.operation) {
      // ADD THESE NEW CASES FOR BASIC OPERATIONS
      case 'LOAD_STRING':
        this.handleLoadString(instr);
        break;

      case 'LOAD_NUMBER':
        this.handleLoadNumber(instr);
        break;

      case 'PRINT':
        this.handlePrint(instr);
        break;

      case 'ADD':
        this.handleAdd(instr);
        break;

      case 'SUB':
        this.handleSub(instr);
        break;

      case 'MUL':
        this.handleMul(instr);
        break;

      case 'DIV':
        this.handleDiv(instr);
        break;

      // EXISTING CASES
      case 'FUNC_START':
        this.handleFunctionStart(instr);
        break;

      case 'FUNC_END':
        this.handleFunctionEnd(instr);
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

      case 'DECLARE':
        this.handleDeclare(instr);
        break;
        
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
      case '**':
      case '//':
        this.handleArithmetic(instr);
        break;
        
      case '==':
      case '!=':
      case '<':
      case '>':
      case '<=':
      case '>=':
        this.handleComparison(instr);
        break;
        
      case '&&':
      case 'AND':
        this.handleLogicalAnd(instr);
        break;
        
      case '||':
      case 'OR':
        this.handleLogicalOr(instr);
        break;
        
      case '!':
      case 'NOT':
        this.handleLogicalNot(instr);
        break;
        
      case 'IF_FALSE':
        this.handleIfFalse(instr);
        break;

      case 'IF_TRUE':
        this.handleIfTrue(instr);
        break;
        
      case 'GOTO':
        this.handleGoto(instr);
        break;
        
      case 'LABEL':
        this.handleLabel(instr);
        break;
        
      case 'RETURN':
        this.handleReturn(instr);
        break;
        
      case 'ARRAY_GET':
        this.handleArrayGet(instr);
        break;

      case 'ARRAY_SET':
        this.handleArraySet(instr);
        break;

      case 'MEMBER_SET':
        this.handleMemberSet(instr);
        break;

      case 'ARRAY_CREATE':
        this.handleArrayCreate(instr);
        break;

      case 'OBJECT_CREATE':
        this.handleObjectCreate(instr);
        break;

      case 'FOR_INIT':
        this.handleForInit(instr);
        break;

      case 'FOR_CONDITION':
        this.handleForCondition(instr);
        break;

      case 'FOR_UPDATE':
        this.handleForUpdate(instr);
        break;

      case 'WHILE_START':
        this.handleWhileStart(instr);
        break;

      case 'WHILE_END':
        this.handleWhileEnd(instr);
        break;

      case 'BREAK':
        this.handleBreak(instr);
        break;

      case 'CONTINUE':
        this.handleContinue(instr);
        break;

      case 'TRY_START':
        this.handleTryStart(instr);
        break;

      case 'CATCH_START':
        this.handleCatchStart(instr);
        break;

      case 'FINALLY_START':
        this.handleFinallyStart(instr);
        break;

      case 'THROW':
        this.handleThrow(instr);
        break;
        
      default:
        console.log('Handling default case for operation:', instr.operation);
        this.handleUnknown(instr);
    }
    
    console.log('Code after this instruction:', this.code.slice(-2)); // Show last 2 lines
  }

  // ADD THESE NEW HANDLER METHODS
  handleLoadString(instr) {
    console.log('=== handleLoadString ===');
    console.log('Loading string:', instr.arg1, 'into:', instr.result);
    
    if (!instr.result) {
      console.warn('Invalid LOAD_STRING instruction - no result variable:', instr);
      return;
    }
    
    // Store the string value in varMap for later resolution
    this.varMap.set(instr.result, instr.arg1);
    console.log('Mapped', instr.result, 'to string:', instr.arg1);
  }

  handleLoadNumber(instr) {
    console.log('=== handleLoadNumber ===');
    console.log('Loading number:', instr.arg1, 'into:', instr.result);
    
    if (!instr.result) {
      console.warn('Invalid LOAD_NUMBER instruction - no result variable:', instr);
      return;
    }
    
    // Store the number value in varMap for later resolution
    this.varMap.set(instr.result, instr.arg1);
    console.log('Mapped', instr.result, 'to number:', instr.arg1);
  }

  handlePrint(instr) {
    console.log('=== handlePrint ===');
    console.log('Printing:', instr.arg1);
    
    if (!instr.arg1) {
      console.warn('Invalid PRINT instruction - no argument:', instr);
      this.code.push(`${this.indent()}print()`);
      return;
    }
    
    // Resolve the value to print
    const valueToPrint = this.resolveValue(instr.arg1);
    console.log('Resolved value to print:', valueToPrint);
    
    this.code.push(`${this.indent()}print(${valueToPrint})`);
  }

  handleAdd(instr) {
    console.log('=== handleAdd ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = ${left} + ${right}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleSub(instr) {
    console.log('=== handleSub ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = ${left} - ${right}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleMul(instr) {
    console.log('=== handleMul ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = ${left} * ${right}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleDiv(instr) {
    console.log('=== handleDiv ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = ${left} / ${right}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleFunctionStart(instr) {
    console.log('=== handleFunctionStart ===');
    const funcName = instr.arg1 || 'anonymous_function';
    const params = (instr.params || []).join(', ');
    
    this.code.push(`${this.indent()}def ${funcName}(${params}):`);
    this.indentLevel++;
    this.functionStack.push(funcName);
    
    // Add docstring if available
    if (instr.docstring) {
      this.code.push(`${this.indent()}"""${instr.docstring}"""`);
    }
  }

  handleFunctionEnd(instr) {
    console.log('=== handleFunctionEnd ===');
    
    // Add default return if function doesn't end with return
    const lastLine = this.code[this.code.length - 1];
    if (!lastLine || !lastLine.trim().startsWith('return')) {
      this.code.push(`${this.indent()}return None`);
    }
    
    this.indentLevel--;
    this.functionStack.pop();
    this.code.push(''); // Empty line after function
  }

  handleMemberGet(instr) {
    console.log('=== handleMemberGet ===');
    console.log('arg1:', instr.arg1, 'arg2:', instr.arg2, 'result:', instr.result);
    
    // Handle specific JavaScript to Python mappings
    if (instr.arg1 === 'console' && instr.arg2 === 'log') {
      console.log('Mapping console.log to print');
      this.varMap.set(instr.result, 'print');
      return; // Don't generate assignment code for console.log
    }
    
    // Handle Math object methods
    if (instr.arg1 === 'Math') {
      const mathMethod = this.mapMathMethod(instr.arg2);
      this.varMap.set(instr.result, mathMethod);
      if (mathMethod.startsWith('math.')) {
        this.imports.add('math');
      }
      return;
    }

    // Handle Array methods
    if (instr.arg2 === 'length') {
      const resolvedObj = this.resolveValue(instr.arg1);
      this.varMap.set(instr.result, `len(${resolvedObj})`);
      return;
    }
    
    // For other member access, resolve the object first
    const resolvedObj = this.resolveValue(instr.arg1);
    const memberAccess = `${resolvedObj}.${instr.arg2}`;
    this.varMap.set(instr.result, memberAccess);
  }

  handleCall(instr) {
    console.log('=== handleCall ===');
    console.log('Full instruction:', instr);
    console.log('arg1 (function):', instr.arg1);
    console.log('params:', instr.params);
    console.log('result:', instr.result);
    console.log('Current varMap:', [...this.varMap.entries()]);
    
    // Resolve function name from varMap first, then try direct lookup
    let funcName = this.varMap.get(instr.arg1);
    if (funcName === undefined) {
      // If not in varMap, check if it's a direct function reference
      funcName = instr.arg1;
    }
    
    console.log('Resolved function name:', funcName);
    
    const params = instr.params || [];
    console.log('Parameters to resolve:', params);
    
    // Resolve parameters from varMap or constants
    const args = params.map((param, index) => {
      const resolved = this.resolveValue(param);
      console.log(`Resolving parameter ${index}: ${param} -> ${resolved}`);
      return resolved;
    }).join(', ');
    
    console.log('Final arguments string:', args);

    // Special handling for built-in functions
    if (funcName === 'print') {
      console.log('Generating print statement');
      this.code.push(`${this.indent()}print(${args})`);
      return;
    }

    // Handle array methods
    if (typeof funcName === 'string' && funcName.includes('.')) {
      const parts = funcName.split('.');
      const method = parts[parts.length - 1];
      
      if (method === 'push') {
        const arrayName = parts.slice(0, -1).join('.');
        this.code.push(`${this.indent()}${arrayName}.append(${args})`);
        return;
      } else if (method === 'pop') {
        const arrayName = parts.slice(0, -1).join('.');
        if (instr.result) {
          this.code.push(`${this.indent()}${instr.result} = ${arrayName}.pop()`);
          this.varMap.set(instr.result, instr.result);
        } else {
          this.code.push(`${this.indent()}${arrayName}.pop()`);
        }
        return;
      } else if (method === 'shift') {
        const arrayName = parts.slice(0, -1).join('.');
        if (instr.result) {
          this.code.push(`${this.indent()}${instr.result} = ${arrayName}.pop(0)`);
          this.varMap.set(instr.result, instr.result);
        } else {
          this.code.push(`${this.indent()}${arrayName}.pop(0)`);
        }
        return;
      } else if (method === 'unshift') {
        const arrayName = parts.slice(0, -1).join('.');
        this.code.push(`${this.indent()}${arrayName}.insert(0, ${args})`);
        return;
      }
    }
    
    // For regular function calls that have a result
    if (instr.result) {
      console.log('Generating function call with assignment');
      const callExpression = `${funcName}(${args})`;
      this.code.push(`${this.indent()}${instr.result} = ${callExpression}`);
      this.varMap.set(instr.result, instr.result);
      this.usedVars.add(instr.result);
    } else {
      // Function call without assignment (side effects only)
      console.log('Generating function call without assignment');
      this.code.push(`${this.indent()}${funcName}(${args})`);
    }
  }

  handleLoadConst(instr) {
    console.log('=== handleLoadConst ===');
    console.log('arg1 (value):', instr.arg1);
    console.log('result (temp var):', instr.result);
    
    if (!instr.result) {
      console.warn('Invalid LOAD_CONST instruction:', instr);
      return;
    }

    // Store the constant value in varMap for later resolution
    this.varMap.set(instr.result, instr.arg1);
    console.log('Set in varMap:', instr.result, '->', instr.arg1);
    console.log('VarMap after setting:', [...this.varMap.entries()]);
  }

  handleAssign(instr) {
    console.log('=== handleAssign ===');
    if (!instr.result || instr.arg1 === undefined || instr.arg1 === null) {
      console.warn('Invalid ASSIGN instruction:', instr);
      return;
    }

    const resolvedValue = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}${instr.result} = ${resolvedValue}`);
    
    // Update variable mapping
    const sourceValue = this.varMap.get(instr.arg1);
    if (sourceValue !== undefined) {
      this.varMap.set(instr.result, sourceValue);
    } else {
      this.varMap.set(instr.result, instr.result);
    }
    this.usedVars.add(instr.result);
  }

  handleDeclare(instr) {
    console.log('=== handleDeclare ===');
    if (!instr.arg1) {
      console.warn('Invalid DECLARE instruction:', instr);
      return;
    }
    
    // In Python, we initialize with None unless a value is provided
    const initValue = instr.arg2 ? this.resolveValue(instr.arg2) : 'None';
    this.code.push(`${this.indent()}${instr.arg1} = ${initValue}`);
    this.varMap.set(instr.arg1, instr.arg1);
    this.usedVars.add(instr.arg1);
  }

  handleArithmetic(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    // Handle special cases
    let operation = instr.operation;
    if (operation === '//') {
      operation = '//'; // Floor division
    } else if (operation === '**') {
      operation = '**'; // Power
    }
    
    this.code.push(`${this.indent()}${result} = ${left} ${operation} ${right}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleComparison(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = ${left} ${instr.operation} ${right}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleLogicalAnd(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = ${left} and ${right}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleLogicalOr(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = ${left} or ${right}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleLogicalNot(instr) {
    const operand = this.resolveValue(instr.arg1);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = not ${operand}`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleIfFalse(instr) {
    const condition = this.resolveValue(instr.arg1);
    const label = instr.result || instr.arg2;
    
    this.code.push(`${this.indent()}if not (${condition}):`);
    this.indentLevel++;
    
    if (label && this.labelMap.has(label)) {
      this.code.push(`${this.indent()}# Jump to ${label}`);
      this.code.push(`${this.indent()}pass`);
    } else {
      this.code.push(`${this.indent()}pass`);
    }
    
    this.indentLevel--;
  }

  handleIfTrue(instr) {
    const condition = this.resolveValue(instr.arg1);
    const label = instr.result || instr.arg2;
    
    this.code.push(`${this.indent()}if ${condition}:`);
    this.indentLevel++;
    
    if (label && this.labelMap.has(label)) {
      this.code.push(`${this.indent()}# Jump to ${label}`);
      this.code.push(`${this.indent()}pass`);
    } else {
      this.code.push(`${this.indent()}pass`);
    }
    
    this.indentLevel--;
  }

  handleGoto(instr) {
    const label = instr.result || instr.arg1;
    this.code.push(`${this.indent()}# goto ${label}`);
  }

  handleLabel(instr) {
    const label = instr.result || instr.arg1;
    // Labels are handled as comments in Python
    if (this.indentLevel > 0) {
      this.code.push(`${this.indent()}# ${label}:`);
    } else {
      this.code.push(`# ${label}:`);
    }
  }

  handleReturn(instr) {
    if (instr.arg1 !== undefined && instr.arg1 !== null) {
      const returnValue = this.resolveValue(instr.arg1);
      this.code.push(`${this.indent()}return ${returnValue}`);
    } else {
      this.code.push(`${this.indent()}return None`);
    }
  }

  handleArrayGet(instr) {
    const array = this.resolveValue(instr.arg1);
    const index = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = ${array}[${index}]`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleArraySet(instr) {
    const array = this.resolveValue(instr.arg1);
    const index = this.resolveValue(instr.arg2);
    const value = this.resolveValue(instr.result);
    
    this.code.push(`${this.indent()}${array}[${index}] = ${value}`);
  }

  handleMemberSet(instr) {
    const obj = this.resolveValue(instr.arg1);
    const prop = instr.arg2;
    const value = this.resolveValue(instr.result);
    
    this.code.push(`${this.indent()}${obj}.${prop} = ${value}`);
  }

  handleArrayCreate(instr) {
    const elements = (instr.params || []).map(param => this.resolveValue(param)).join(', ');
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}${result} = [${elements}]`);
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleObjectCreate(instr) {
    const result = instr.result || this.getTempVar();
    
    if (instr.params && instr.params.length > 0) {
      // Object with initial properties
      const props = [];
      for (let i = 0; i < instr.params.length; i += 2) {
        const key = instr.params[i];
        const value = this.resolveValue(instr.params[i + 1]);
        props.push(`"${key}": ${value}`);
      }
      this.code.push(`${this.indent()}${result} = {${props.join(', ')}}`);
    } else {
      // Empty object
      this.code.push(`${this.indent()}${result} = {}`);
    }
    
    this.varMap.set(result, result);
    this.usedVars.add(result);
  }

  handleForInit(instr) {
    // For loop initialization
    if (instr.arg1 && instr.arg2) {
      const varName = instr.arg1;
      const initValue = this.resolveValue(instr.arg2);
      this.code.push(`${this.indent()}${varName} = ${initValue}`);
      this.varMap.set(varName, varName);
      this.usedVars.add(varName);
    }
  }

  handleForCondition(instr) {
    // This would be part of a while loop in Python
    const condition = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}while ${condition}:`);
    this.indentLevel++;
    this.loopStack.push('for');
  }

  handleForUpdate(instr) {
    // This would be at the end of the loop body
    if (instr.arg1 && instr.operation) {
      const updateExpr = `${instr.arg1} ${instr.operation} ${this.resolveValue(instr.arg2)}`;
      // This will be added at the end of the loop
      this.code.push(`${this.indent()}${updateExpr}`);
    }
  }

  handleWhileStart(instr) {
    const condition = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}while ${condition}:`);
    this.indentLevel++;
    this.loopStack.push('while');
  }

  handleWhileEnd(instr) {
    this.indentLevel--;
    this.loopStack.pop();
  }

  handleBreak(instr) {
    this.code.push(`${this.indent()}break`);
  }

  handleContinue(instr) {
    this.code.push(`${this.indent()}continue`);
  }

  handleTryStart(instr) {
    this.code.push(`${this.indent()}try:`);
    this.indentLevel++;
  }

  handleCatchStart(instr) {
    this.indentLevel--;
    const exceptionVar = instr.arg1 || 'e';
    this.code.push(`${this.indent()}except Exception as ${exceptionVar}:`);
    this.indentLevel++;
  }

  handleFinallyStart(instr) {
    this.indentLevel--;
    this.code.push(`${this.indent()}finally:`);
    this.indentLevel++;
  }

  handleThrow(instr) {
    const exception = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}raise ${exception}`);
  }

  handleUnknown(instr) {
    this.code.push(`${this.indent()}# Unknown operation: ${instr.operation}`);
    if (instr.toString && typeof instr.toString === 'function') {
      this.code.push(`${this.indent()}# ${instr.toString()}`);
    } else {
      this.code.push(`${this.indent()}# Args: ${instr.arg1}, ${instr.arg2} -> ${instr.result}`);
    }
  }

  // Helper method to map JavaScript Math methods to Python equivalents
  mapMathMethod(method) {
    const mathMappings = {
      'floor': 'math.floor',
      'ceil': 'math.ceil',
      'round': 'round',
      'abs': 'abs',
      'max': 'max',
      'min': 'min',
      'pow': 'math.pow',
      'sqrt': 'math.sqrt',
      'random': 'random.random',
      'sin': 'math.sin',
      'cos': 'math.cos',
      'tan': 'math.tan',
      'log': 'math.log',
      'log10': 'math.log10',
      'exp': 'math.exp',
      'PI': 'math.pi',
      'E': 'math.e'
    };
    
    return mathMappings[method] || `math.${method}`;
  }

  // Helper method to format values for Python output
  formatValue(value) {
    if (value === null || value === undefined) {
      return 'None';
    }
    
    if (typeof value === 'string') {
      // Check if it's a function name or variable that should not be quoted
      if (value === 'print' || 
          this.isVariableName(value) || 
          this.varMap.has(value) ||
          value.startsWith('math.') ||
          value.startsWith('len(')) {
        return value;
      }
      // Escape quotes and wrap in quotes for string literals
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }
    
    if (typeof value === 'number') {
      return String(value);
    }
    
    return String(value);
  }

  // Helper method to check if a string looks like a variable name
  isVariableName(str) {
    if (typeof str !== 'string') return false;
    return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(str);
  }

  // Helper method to resolve values - FIXED VERSION
  resolveValue(value) {
    console.log('=== resolveValue ===');
    console.log('Input value:', value, 'Type:', typeof value);
    
    if (value === null || value === undefined) {
      return 'None';
    }
    
    // First check if it's a mapped variable
    if (this.varMap.has(value)) {
      const mappedValue = this.varMap.get(value);
      console.log('Found mapped value for', value, ':', mappedValue);
      
      // If the mapped value is itself a reference, resolve it recursively
      if (this.varMap.has(mappedValue) && mappedValue !== value) {
        return this.resolveValue(mappedValue);
      }
      
      // Format the mapped value appropriately
      return this.formatValue(mappedValue);
    }
    
    // If not in varMap, format the value directly
    console.log('Value not in varMap, formatting directly:', value);
    return this.formatValue(value);
  }

  // Helper method to generate temporary variables
  getTempVar() {
    return `temp_${this.tempVarCounter++}`;
  }

  // Helper method to clean up code
  cleanupCode() {
    // Remove consecutive empty lines
    const cleaned = [];
    let lastWasEmpty = false;
    
    for (const line of this.code) {
      const isEmpty = !line || line.trim() === '';
      
      if (isEmpty && lastWasEmpty) {
        continue; // Skip consecutive empty lines
      }
      
      cleaned.push(line);
      lastWasEmpty = isEmpty;
    }
    
    return cleaned;
  }

  // Method to get generation statistics
  getStats() {
    return {
      instructionsProcessed: this.ic.length,
      linesGenerated: this.code.length,
      variablesMapped: this.varMap.size,
      labelsFound: this.labelMap.size,
      importsNeeded: this.imports.size,
      tempVarsCreated: this.tempVarCounter
    };
  }
}