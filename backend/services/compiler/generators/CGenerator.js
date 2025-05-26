export class CGenerator {
  constructor(intermediateCode) {
    console.log('=== CCodeGenerator Constructor ===');
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
    this.includes = new Set();
    this.functionStack = [];
    this.loopStack = [];
    this.tempVarCounter = 0;
    this.usedVars = new Set();
    this.varTypes = new Map(); // Track variable types for C
    this.functions = [];
    this.inMainFunction = false;
    this.hasMainFunction = false;
    this.structDefinitions = new Set();
    this.globalVars = [];
  }

  indent() {
    return '    '.repeat(this.indentLevel);
  }

  generate() {
    console.log('=== CCodeGenerator.generate() called ===');
    console.log('Instructions to process:', this.ic.length);
    
    if (this.ic.length === 0) {
      console.log('No instructions to process');
      return '// No code to generate';
    }
    
    // First pass: analyze and prepare
    this.analyzeInstructions();
    
    // Second pass: map labels to line numbers
    this.mapLabels();
    
    // Generate C structure
    this.generateIncludes();
    this.generateStructDefinitions();
    this.generateGlobalVars();
    this.generateFunctionDeclarations();
    
    // Generate main function if needed
    if (this.hasMainFunction) {
      this.generateMainFunction();
    }
    
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
        this.code.push(`${this.indent()}/* Error processing instruction: ${error.message} */`);
      }
    }
    
    // Close main function if open
    if (this.inMainFunction) {
      this.code.push(`${this.indent()}return 0;`);
      this.indentLevel--;
      this.code.push('}');
    }
    
    // Add function implementations
    this.generateFunctionImplementations();
    
    // Clean up and combine code
    const codeBody = this.code
      .filter(line => line !== null && line !== undefined)
      .map(line => typeof line === 'string' ? line : String(line))
      .filter(line => line.trim() !== '' || this.indentLevel > 0);
    
    const result = codeBody.join('\n');
    
    console.log('=== Final result ===');
    console.log('Final result:', result);
    return result;
  }

  analyzeInstructions() {
    console.log('=== Analyzing instructions ===');
    
    // Look for required includes and main function needs
    let hasTopLevelCode = false;
    
    for (const instr of this.ic) {
      if (!instr || !instr.operation) continue;
      
      // Check if we need stdio.h
      if (instr.operation === 'PRINT') {
        this.includes.add('#include <stdio.h>');
      }
      
      // Check for string operations
      if (instr.operation === 'LOAD_STRING' || instr.operation === 'ADD') {
        this.includes.add('#include <string.h>');
      }
      
      // Check for math operations
      if (this.isMathOperation(instr.operation)) {
        this.includes.add('#include <math.h>');
      }
      
      // Check for array/memory operations
      if (instr.operation === 'ARRAY_CREATE' || instr.operation === 'OBJECT_CREATE') {
        this.includes.add('#include <stdlib.h>');
      }
      
      // Check if we have top-level code that needs main function
      if (instr.operation !== 'FUNC_START' && instr.operation !== 'FUNC_END' && 
          instr.operation !== 'LABEL' && !this.isControlFlowOperation(instr.operation)) {
        hasTopLevelCode = true;
      }
    }
    
    this.hasMainFunction = hasTopLevelCode;
    
    // Always include basic headers
    this.includes.add('#include <stdio.h>');
    this.includes.add('#include <stdlib.h>');
  }

  isMathOperation(operation) {
    return ['**', 'sqrt', 'pow', 'abs', 'sin', 'cos', 'tan', 'log'].includes(operation);
  }

  isControlFlowOperation(operation) {
    return ['IF_FALSE', 'IF_TRUE', 'GOTO', 'WHILE_START', 'WHILE_END', 'FOR_INIT', 'FOR_CONDITION', 'FOR_UPDATE'].includes(operation);
  }

  generateIncludes() {
    const includeLines = Array.from(this.includes).sort();
    for (const include of includeLines) {
      this.code.push(include);
    }
    if (includeLines.length > 0) {
      this.code.push('');
    }
  }

  generateStructDefinitions() {
    if (this.structDefinitions.size > 0) {
      for (const structDef of this.structDefinitions) {
        this.code.push(structDef);
      }
      this.code.push('');
    }
  }

  generateGlobalVars() {
    if (this.globalVars.length > 0) {
      for (const globalVar of this.globalVars) {
        this.code.push(globalVar);
      }
      this.code.push('');
    }
  }

  generateFunctionDeclarations() {
    // Function declarations will be added as we encounter FUNC_START
  }

  generateMainFunction() {
    this.code.push('int main() {');
    this.indentLevel++;
    this.inMainFunction = true;
  }

  generateFunctionImplementations() {
    // Function implementations are generated inline
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
      // Basic operations
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

      // Function operations
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
        
      // Arithmetic operations
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
      case '**':
      case '//':
        this.handleArithmetic(instr);
        break;
        
      // Comparison operations
      case '==':
      case '!=':
      case '<':
      case '>':
      case '<=':
      case '>=':
        this.handleComparison(instr);
        break;
        
      // Logical operations
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
        
      // Control flow
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
        
      // Array operations
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

      // Loop operations
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

      // Exception handling (limited in C)
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

  // Handler methods for basic operations
  handleLoadString(instr) {
    console.log('=== handleLoadString ===');
    console.log('Loading string:', instr.arg1, 'into:', instr.result);
    
    if (!instr.result) {
      console.warn('Invalid LOAD_STRING instruction - no result variable:', instr);
      return;
    }
    
    // Store the string value in varMap for later resolution
    this.varMap.set(instr.result, `"${instr.arg1}"`);
    this.varTypes.set(instr.result, 'char*');
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
    this.varTypes.set(instr.result, this.getNumberType(instr.arg1));
    console.log('Mapped', instr.result, 'to number:', instr.arg1);
  }

  handlePrint(instr) {
    console.log('=== handlePrint ===');
    console.log('Printing:', instr.arg1);
    
    if (!instr.arg1) {
      console.warn('Invalid PRINT instruction - no argument:', instr);
      this.code.push(`${this.indent()}printf("\\n");`);
      return;
    }
    
    // Resolve the value to print
    const valueToPrint = this.resolveValue(instr.arg1);
    const valueType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
    
    // Choose appropriate printf format specifier
    let formatSpec = '%s';
    if (valueType === 'int') formatSpec = '%d';
    else if (valueType === 'double' || valueType === 'float') formatSpec = '%f';
    else if (valueType === 'char') formatSpec = '%c';
    
    console.log('Resolved value to print:', valueToPrint);
    
    this.code.push(`${this.indent()}printf("${formatSpec}\\n", ${valueToPrint});`);
  }

  handleAdd(instr) {
    console.log('=== handleAdd ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    // Determine result type
    const leftType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
    const rightType = this.varTypes.get(instr.arg2) || this.inferType(instr.arg2);
    
    // Special handling for string concatenation
    if (leftType === 'char*' || rightType === 'char*') {
      this.handleStringConcatenation(left, right, result);
      return;
    }
    
    const resultType = this.getArithmeticResultType(leftType, rightType);
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}${resultType} ${result} = ${left} + ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} + ${right};`);
    }
    
    this.varMap.set(result, result);
    this.varTypes.set(result, resultType);
  }

  handleStringConcatenation(left, right, result) {
    // For string concatenation in C, we need to use strcat or sprintf
    this.code.push(`${this.indent()}char* ${result} = malloc(strlen(${left}) + strlen(${right}) + 1);`);
    this.code.push(`${this.indent()}strcpy(${result}, ${left});`);
    this.code.push(`${this.indent()}strcat(${result}, ${right});`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'char*');
    this.usedVars.add(result);
  }

  handleSub(instr) {
    console.log('=== handleSub ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    const leftType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
    const rightType = this.varTypes.get(instr.arg2) || this.inferType(instr.arg2);
    const resultType = this.getArithmeticResultType(leftType, rightType);
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}${resultType} ${result} = ${left} - ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} - ${right};`);
    }
    
    this.varMap.set(result, result);
    this.varTypes.set(result, resultType);
  }

  handleMul(instr) {
    console.log('=== handleMul ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    const leftType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
    const rightType = this.varTypes.get(instr.arg2) || this.inferType(instr.arg2);
    const resultType = this.getArithmeticResultType(leftType, rightType);
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}${resultType} ${result} = ${left} * ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} * ${right};`);
    }
    
    this.varMap.set(result, result);
    this.varTypes.set(result, resultType);
  }

  handleDiv(instr) {
    console.log('=== handleDiv ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    // Division typically results in double
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}double ${result} = (double)${left} / ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = (double)${left} / ${right};`);
    }
    
    this.varMap.set(result, result);
    this.varTypes.set(result, 'double');
  }

  handleFunctionStart(instr) {
    console.log('=== handleFunctionStart ===');
    const funcName = instr.arg1 || 'anonymous_function';
    const params = (instr.params || []).map(param => `void* ${param}`).join(', ');
    
    // Close main function if we're in it
    if (this.inMainFunction) {
      this.code.push(`${this.indent()}return 0;`);
      this.indentLevel--;
      this.code.push('}');
      this.code.push('');
      this.inMainFunction = false;
    }
    
    // Add function declaration if not already added
    const returnType = instr.returnType || 'void*';
    this.code.push(`${returnType} ${funcName}(${params}) {`);
    this.indentLevel++;
    this.functionStack.push(funcName);
  }

  handleFunctionEnd(instr) {
    console.log('=== handleFunctionEnd ===');
    
    // Add default return if function doesn't end with return
    const lastLine = this.code[this.code.length - 1];
    if (!lastLine || !lastLine.trim().startsWith('return')) {
      this.code.push(`${this.indent()}return NULL;`);
    }
    
    this.indentLevel--;
    this.functionStack.pop();
    this.code.push('}');
    this.code.push(''); // Empty line after function
  }

  handleMemberGet(instr) {
    console.log('=== handleMemberGet ===');
    console.log('arg1:', instr.arg1, 'arg2:', instr.arg2, 'result:', instr.result);
    
    // Handle specific JavaScript to C mappings
    if (instr.arg1 === 'console' && instr.arg2 === 'log') {
      console.log('Mapping console.log to printf');
      this.varMap.set(instr.result, 'printf');
      return;
    }
    
    // Handle Math object methods
    if (instr.arg1 === 'Math') {
      const mathFunction = this.mapMathFunction(instr.arg2);
      this.varMap.set(instr.result, mathFunction);
      return;
    }

    // Handle Array length
    if (instr.arg2 === 'length') {
      const resolvedObj = this.resolveValue(instr.arg1);
      // In C, we need to track array sizes separately
      this.varMap.set(instr.result, `${resolvedObj}_length`);
      return;
    }
    
    // For struct member access
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
    if (funcName === 'printf') {
      console.log('Generating printf statement');
      if (params.length > 0) {
        const firstParam = this.resolveValue(params[0]);
        const formatSpec = this.inferPrintfFormat(firstParam);
        this.code.push(`${this.indent()}printf(${formatSpec}, ${args});`);
      } else {
        this.code.push(`${this.indent()}printf("\\n");`);
      }
      return;
    }

    // Handle math functions
    if (funcName.startsWith('Math.') || this.isMathFunction(funcName)) {
      const mathCall = `${funcName}(${args})`;
      if (instr.result) {
        this.code.push(`${this.indent()}double ${instr.result} = ${mathCall};`);
        this.varMap.set(instr.result, instr.result);
        this.varTypes.set(instr.result, 'double');
        this.usedVars.add(instr.result);
      } else {
        this.code.push(`${this.indent()}${mathCall};`);
      }
      return;
    }
    
    // For regular function calls that have a result
    if (instr.result) {
      console.log('Generating function call with assignment');
      const callExpression = `${funcName}(${args})`;
      this.code.push(`${this.indent()}void* ${instr.result} = ${callExpression};`);
      this.varMap.set(instr.result, instr.result);
      this.varTypes.set(instr.result, 'void*');
      this.usedVars.add(instr.result);
    } else {
      // Function call without assignment (side effects only)
      console.log('Generating function call without assignment');
      this.code.push(`${this.indent()}${funcName}(${args});`);
    }
  }

  inferPrintfFormat(value) {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value; // Already a format string
    }
    return '"%s"'; // Default to string format
  }

  isMathFunction(funcName) {
    const mathFunctions = ['sin', 'cos', 'tan', 'sqrt', 'pow', 'abs', 'floor', 'ceil', 'log'];
    return mathFunctions.includes(funcName);
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
    this.varTypes.set(instr.result, this.inferType(instr.arg1));
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
    const sourceType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
    
    // Check if variable already exists
    if (this.usedVars.has(instr.result)) {
      this.code.push(`${this.indent()}${instr.result} = ${resolvedValue};`);
    } else {
      this.code.push(`${this.indent()}${sourceType} ${instr.result} = ${resolvedValue};`);
      this.usedVars.add(instr.result);
    }
    
    // Update variable mapping
    const sourceValue = this.varMap.get(instr.arg1);
    if (sourceValue !== undefined) {
      this.varMap.set(instr.result, sourceValue);
    } else {
      this.varMap.set(instr.result, instr.result);
    }
    this.varTypes.set(instr.result, sourceType);
  }

  handleDeclare(instr) {
    console.log('=== handleDeclare ===');
    if (!instr.arg1) {
      console.warn('Invalid DECLARE instruction:', instr);
      return;
    }
    
    // In C, we need to specify the type
    const initValue = instr.arg2 ? this.resolveValue(instr.arg2) : '0';
    const varType = instr.arg2 ? this.inferType(instr.arg2) : 'int';
    
    this.code.push(`${this.indent()}${varType} ${instr.arg1} = ${initValue};`);
    this.varMap.set(instr.arg1, instr.arg1);
    this.varTypes.set(instr.arg1, varType);
    this.usedVars.add(instr.arg1);
  }

    handleArithmetic(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    // Handle special cases
    let operation = instr.operation;
    let resultType = 'double';
    
    if (operation === '//') {
      // Integer division
      operation = '/';
      resultType = 'int';
      this.code.push(`${this.indent()}${resultType} ${result} = ${left} ${operation} ${right};`);
    } else if (operation === '**') {
      // Power operation
      this.code.push(`${this.indent()}double ${result} = pow(${left}, ${right});`);
      this.includes.add('#include <math.h>');
    } else {
      const leftType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
      const rightType = this.varTypes.get(instr.arg2) || this.inferType(instr.arg2);
      resultType = this.getArithmeticResultType(leftType, rightType);
      
      // Handle type casting for mixed operations
      const cast = resultType !== leftType ? `(${resultType})` : '';
      this.code.push(`${this.indent()}${resultType} ${result} = ${cast}${left} ${operation} ${right};`);
    }
    
    this.varMap.set(result, result);
    this.varTypes.set(result, resultType);
    this.usedVars.add(result);
  }

  handleComparison(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}int ${result} = (${left} ${instr.operation} ${right});`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'int');
    this.usedVars.add(result);
  }

  handleLogicalAnd(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}int ${result} = (${left} && ${right});`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'int');
    this.usedVars.add(result);
  }

  handleLogicalOr(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}int ${result} = (${left} || ${right});`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'int');
    this.usedVars.add(result);
  }

  handleLogicalNot(instr) {
    const operand = this.resolveValue(instr.arg1);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}int ${result} = !(${operand});`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'int');
    this.usedVars.add(result);
  }

  handleIfFalse(instr) {
    const condition = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}if (!(${condition})) {`);
    this.indentLevel++;
  }

  handleIfTrue(instr) {
    const condition = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}if (${condition}) {`);
    this.indentLevel++;
  }

  handleGoto(instr) {
    const label = instr.result || instr.arg1;
    this.code.push(`${this.indent()}goto ${label};`);
  }

  handleLabel(instr) {
    const label = instr.result || instr.arg1;
    this.code.push(`${label}:`);
  }

  handleReturn(instr) {
    if (instr.arg1) {
      const value = this.resolveValue(instr.arg1);
      this.code.push(`${this.indent()}return ${value};`);
    } else {
      this.code.push(`${this.indent()}return;`);
    }
  }

  handleArrayGet(instr) {
    const array = this.resolveValue(instr.arg1);
    const index = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    const arrayType = this.varTypes.get(instr.arg1)?.replace('*', '') || 'int';
    
    this.code.push(`${this.indent()}${arrayType} ${result} = ${array}[${index}];`);
    this.varMap.set(result, result);
    this.varTypes.set(result, arrayType);
    this.usedVars.add(result);
  }

  handleArraySet(instr) {
    const array = this.resolveValue(instr.arg1);
    const index = this.resolveValue(instr.arg2);
    const value = this.resolveValue(instr.result);
    
    this.code.push(`${this.indent()}${array}[${index}] = ${value};`);
  }

  handleMemberSet(instr) {
    const obj = this.resolveValue(instr.arg1);
    const prop = instr.arg2;
    const value = this.resolveValue(instr.result);
    
    this.code.push(`${this.indent()}${obj}.${prop} = ${value};`);
  }

  handleArrayCreate(instr) {
    const size = this.resolveValue(instr.arg1);
    const result = instr.result || this.getTempVar();
    const type = instr.elementType || 'int';
    
    this.code.push(`${this.indent()}${type}* ${result} = (${type}*)malloc(${size} * sizeof(${type}));`);
    this.varMap.set(result, result);
    this.varTypes.set(result, `${type}*`);
    this.usedVars.add(result);
  }

  handleObjectCreate(instr) {
    const result = instr.result || this.getTempVar();
    const structName = instr.arg1 || 'AnonymousStruct';
    
    // Generate struct definition if needed
    if (!this.structDefinitions.has(structName)) {
      const structDef = `typedef struct {\n    // Add fields here\n} ${structName};`;
      this.structDefinitions.add(structDef);
    }
    
    this.code.push(`${this.indent()}${structName} ${result};`);
    this.varMap.set(result, result);
    this.varTypes.set(result, structName);
    this.usedVars.add(result);
  }

  handleForInit(instr) {
    const init = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}for (${init};`);
  }

  handleForCondition(instr) {
    const condition = this.resolveValue(instr.arg1);
    this.code[this.code.length - 1] += ` ${condition};`;
  }

  handleForUpdate(instr) {
    const update = this.resolveValue(instr.arg1);
    this.code[this.code.length - 1] += ` ${update}) {`;
    this.indentLevel++;
  }

  handleWhileStart(instr) {
    const condition = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}while (${condition}) {`);
    this.indentLevel++;
  }

  handleWhileEnd() {
    this.indentLevel--;
    this.code.push(`${this.indent()}}`);
  }

  handleBreak() {
    this.code.push(`${this.indent()}break;`);
  }

  handleContinue() {
    this.code.push(`${this.indent()}continue;`);
  }

  handleTryStart() {
    this.code.push(`${this.indent()}// Exception handling not supported in C`);
  }

  handleCatchStart() {
    this.code.push(`${this.indent()}// Use error codes for error handling`);
  }

  handleFinallyStart() {
    this.code.push(`${this.indent()}// Cleanup code should be manual`);
  }

  handleThrow(instr) {
    const value = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}fprintf(stderr, "Error: %s\\n", ${value});`);
    this.code.push(`${this.indent()}exit(EXIT_FAILURE);`);
  }

  // Helper methods
  getArithmeticResultType(type1, type2) {
    const typePrecedence = { 'double': 2, 'float': 1, 'int': 0 };
    return typePrecedence[type1] > typePrecedence[type2] ? type1 : type2;
  }

  inferType(value) {
    if (typeof value === 'string') {
      if (value.startsWith('"')) return 'char*';
      if (value.includes('.')) return 'double';
      return 'int';
    }
    return 'int'; // Default to int
  }

  mapMathFunction(jsMethod) {
    const mathMap = {
      'sqrt': 'sqrt',
      'pow': 'pow',
      'abs': 'fabs',
      'sin': 'sin',
      'cos': 'cos',
      'tan': 'tan',
      'log': 'log'
    };
    return mathMap[jsMethod] || jsMethod;
  }

  getNumberType(value) {
    return value.includes('.') ? 'double' : 'int';
  }

  getTempVar() {
    return `temp${this.tempVarCounter++}`;
  }
}