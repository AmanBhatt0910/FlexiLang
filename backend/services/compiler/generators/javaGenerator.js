export class JavaCodeGenerator {
  constructor(intermediateCode) {
    console.log('=== JavaCodeGenerator Constructor ===');
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
    this.varTypes = new Map(); // Track variable types for Java
    this.classMembers = [];
    this.inMainMethod = false;
    this.hasMainMethod = false;
  }

  indent() {
    return '    '.repeat(this.indentLevel);
  }

  generate() {
    console.log('=== JavaCodeGenerator.generate() called ===');
    console.log('Instructions to process:', this.ic.length);
    
    if (this.ic.length === 0) {
      console.log('No instructions to process');
      return '// No code to generate';
    }
    
    // First pass: analyze and prepare
    this.analyzeInstructions();
    
    // Second pass: map labels to line numbers
    this.mapLabels();
    
    // Generate class structure
    this.generateClassHeader();
    
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
        this.code.push(`${this.indent()}// Error processing instruction: ${error.message}`);
      }
    }
    
    // Close any open methods/class
    this.generateClassFooter();
    
    // Add imports at the beginning if needed
    const importsCode = this.generateImports();
    
    // Clean up and combine code
    const codeBody = this.code
      .filter(line => line !== null && line !== undefined)
      .map(line => typeof line === 'string' ? line : String(line))
      .filter(line => line.trim() !== '' || this.indentLevel > 0); // Keep empty lines inside methods
    
    const result = importsCode + codeBody.join('\n');
    
    console.log('=== Final result ===');
    console.log('Final result:', result);
    return result;
  }

  analyzeInstructions() {
    console.log('=== Analyzing instructions ===');
    
    // Look for required imports and main method needs
    let hasTopLevelCode = false;
    
    for (const instr of this.ic) {
      if (!instr || !instr.operation) continue;
      
      // Check if we need System.out.println
      if (instr.operation === 'PRINT') {
        this.imports.add('// System.out already available');
      }
      
      // Check for Math operations
      if (instr.operation === 'MEMBER_GET' && instr.arg1 === 'Math') {
        this.imports.add('// Math class already available');
      }
      
      // Check for array operations
      if (instr.operation === 'ARRAY_CREATE' || instr.operation === 'ARRAY_GET' || instr.operation === 'ARRAY_SET') {
        this.imports.add('import java.util.*;');
      }
      
      // Check if we have top-level code that needs main method
      if (instr.operation !== 'FUNC_START' && instr.operation !== 'FUNC_END' && 
          instr.operation !== 'LABEL' && !this.isControlFlowOperation(instr.operation)) {
        hasTopLevelCode = true;
      }
    }
    
    this.hasMainMethod = hasTopLevelCode;
  }

  isControlFlowOperation(operation) {
    return ['IF_FALSE', 'IF_TRUE', 'GOTO', 'WHILE_START', 'WHILE_END', 'FOR_INIT', 'FOR_CONDITION', 'FOR_UPDATE'].includes(operation);
  }

  generateImports() {
    if (this.imports.size === 0) return '';
    
    const importLines = Array.from(this.imports)
      .filter(imp => !imp.startsWith('//')) // Filter out comments
      .sort()
      .map(imp => imp)
      .join('\n');
    
    return importLines ? importLines + '\n\n' : '';
  }

  generateClassHeader() {
    this.code.push('public class GeneratedCode {');
    this.indentLevel++;
    
    // Add main method if needed
    if (this.hasMainMethod) {
      this.code.push(`${this.indent()}public static void main(String[] args) {`);
      this.indentLevel++;
      this.inMainMethod = true;
    }
  }

  generateClassFooter() {
    // Close main method if open
    if (this.inMainMethod) {
      this.indentLevel--;
      this.code.push(`${this.indent()}}`);
      this.code.push('');
    }
    
    // Close any open functions
    while (this.functionStack.length > 0) {
      this.indentLevel--;
      this.code.push(`${this.indent()}}`);
      this.functionStack.pop();
    }
    
    // Close class
    this.indentLevel--;
    this.code.push('}'); 
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

      // Exception handling
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
    this.varMap.set(instr.result, instr.arg1);
    this.varTypes.set(instr.result, 'String');
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
      this.code.push(`${this.indent()}System.out.println();`);
      return;
    }
    
    // Resolve the value to print
    const valueToPrint = this.resolveValue(instr.arg1);
    console.log('Resolved value to print:', valueToPrint);
    
    this.code.push(`${this.indent()}System.out.println(${valueToPrint});`);
  }

  handleAdd(instr) {
    console.log('=== handleAdd ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    // Determine result type
    const leftType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
    const rightType = this.varTypes.get(instr.arg2) || this.inferType(instr.arg2);
    const resultType = this.getArithmeticResultType(leftType, rightType);
    
    this.code.push(`${this.indent()}${resultType} ${result} = ${left} + ${right};`);
    this.varMap.set(result, result);
    this.varTypes.set(result, resultType);
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
    
    this.code.push(`${this.indent()}${resultType} ${result} = ${left} - ${right};`);
    this.varMap.set(result, result);
    this.varTypes.set(result, resultType);
    this.usedVars.add(result);
  }

  handleMul(instr) {
    console.log('=== handleMul ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    const leftType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
    const rightType = this.varTypes.get(instr.arg2) || this.inferType(instr.arg2);
    const resultType = this.getArithmeticResultType(leftType, rightType);
    
    this.code.push(`${this.indent()}${resultType} ${result} = ${left} * ${right};`);
    this.varMap.set(result, result);
    this.varTypes.set(result, resultType);
    this.usedVars.add(result);
  }

  handleDiv(instr) {
    console.log('=== handleDiv ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    // Division typically results in double
    this.code.push(`${this.indent()}double ${result} = (double)${left} / ${right};`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'double');
    this.usedVars.add(result);
  }

  handleFunctionStart(instr) {
    console.log('=== handleFunctionStart ===');
    const funcName = instr.arg1 || 'anonymousFunction';
    const params = (instr.params || []).map(param => `Object ${param}`).join(', ');
    
    // Close main method if we're in it
    if (this.inMainMethod) {
      this.indentLevel--;
      this.code.push(`${this.indent()}}`);
      this.code.push('');
      this.inMainMethod = false;
    }
    
    this.code.push(`${this.indent()}public static Object ${funcName}(${params}) {`);
    this.indentLevel++;
    this.functionStack.push(funcName);
    
    // Add javadoc if available
    if (instr.docstring) {
      this.code.splice(-2, 0, `${this.indent()}/**`);
      this.code.splice(-1, 0, `${this.indent()} * ${instr.docstring}`);
      this.code.splice(-1, 0, `${this.indent()} */`);
    }
  }

  handleFunctionEnd(instr) {
    console.log('=== handleFunctionEnd ===');
    
    // Add default return if function doesn't end with return
    const lastLine = this.code[this.code.length - 1];
    if (!lastLine || !lastLine.trim().startsWith('return')) {
      this.code.push(`${this.indent()}return null;`);
    }
    
    this.indentLevel--;
    this.functionStack.pop();
    this.code.push(`${this.indent()}}`);
    this.code.push(''); // Empty line after function
  }

  handleMemberGet(instr) {
    console.log('=== handleMemberGet ===');
    console.log('arg1:', instr.arg1, 'arg2:', instr.arg2, 'result:', instr.result);
    
    // Handle specific JavaScript to Java mappings
    if (instr.arg1 === 'console' && instr.arg2 === 'log') {
      console.log('Mapping console.log to System.out.println');
      this.varMap.set(instr.result, 'System.out.println');
      return; // Don't generate assignment code for console.log
    }
    
    // Handle Math object methods
    if (instr.arg1 === 'Math') {
      const mathMethod = this.mapMathMethod(instr.arg2);
      this.varMap.set(instr.result, mathMethod);
      return;
    }

    // Handle Array methods
    if (instr.arg2 === 'length') {
      const resolvedObj = this.resolveValue(instr.arg1);
      this.varMap.set(instr.result, `${resolvedObj}.length`);
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
    if (funcName === 'System.out.println') {
      console.log('Generating println statement');
      this.code.push(`${this.indent()}System.out.println(${args});`);
      return;
    }

    // Handle array methods
    if (typeof funcName === 'string' && funcName.includes('.')) {
      const parts = funcName.split('.');
      const method = parts[parts.length - 1];
      
      if (method === 'push') {
        const arrayName = parts.slice(0, -1).join('.');
        // Java ArrayList equivalent
        this.code.push(`${this.indent()}${arrayName}.add(${args});`);
        return;
      } else if (method === 'pop') {
        const arrayName = parts.slice(0, -1).join('.');
        if (instr.result) {
          this.code.push(`${this.indent()}Object ${instr.result} = ${arrayName}.remove(${arrayName}.size() - 1);`);
          this.varMap.set(instr.result, instr.result);
          this.varTypes.set(instr.result, 'Object');
        } else {
          this.code.push(`${this.indent()}${arrayName}.remove(${arrayName}.size() - 1);`);
        }
        return;
      }
    }
    
    // For regular function calls that have a result
    if (instr.result) {
      console.log('Generating function call with assignment');
      const callExpression = `${funcName}(${args})`;
      this.code.push(`${this.indent()}Object ${instr.result} = ${callExpression};`);
      this.varMap.set(instr.result, instr.result);
      this.varTypes.set(instr.result, 'Object');
      this.usedVars.add(instr.result);
    } else {
      // Function call without assignment (side effects only)
      console.log('Generating function call without assignment');
      this.code.push(`${this.indent()}${funcName}(${args});`);
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
    
    // In Java, we need to specify the type
    const initValue = instr.arg2 ? this.resolveValue(instr.arg2) : 'null';
    const varType = instr.arg2 ? this.inferType(instr.arg2) : 'Object';
    
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
      // Floor division - use integer division and cast
      operation = '/';
      resultType = 'int';
      this.code.push(`${this.indent()}${resultType} ${result} = (int)(${left} ${operation} ${right});`);
    } else if (operation === '**') {
      // Power operation
      this.code.push(`${this.indent()}double ${result} = Math.pow(${left}, ${right});`);
    } else {
      const leftType = this.varTypes.get(instr.arg1) || this.inferType(instr.arg1);
      const rightType = this.varTypes.get(instr.arg2) || this.inferType(instr.arg2);
      resultType = this.getArithmeticResultType(leftType, rightType);
      
      this.code.push(`${this.indent()}${resultType} ${result} = ${left} ${operation} ${right};`);
    }
    
    this.varMap.set(result, result);
    this.varTypes.set(result, resultType);
    this.usedVars.add(result);
  }

  handleComparison(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}boolean ${result} = ${left} ${instr.operation} ${right};`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'boolean');
    this.usedVars.add(result);
  }

  handleLogicalAnd(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}boolean ${result} = ${left} && ${right};`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'boolean');
    this.usedVars.add(result);
  }

  handleLogicalOr(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}boolean ${result} = ${left} || ${right};`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'boolean');
    this.usedVars.add(result);
  }

  handleLogicalNot(instr) {
    const operand = this.resolveValue(instr.arg1);
    const result = instr.result || this.getTempVar();
    
    this.code.push(`${this.indent()}boolean ${result} = !(${operand});`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'boolean');
    this.usedVars.add(result);
  }

    handleIfFalse(instr) {
    const condition = this.resolveValue(instr.arg1);
    const label = instr.result || instr.arg2;
    
    this.code.push(`${this.indent()}if (!(${condition})) {`);
    this.indentLevel++;
    
    if (label && this.labelMap.has(label)) {
      this.code.push(`${this.indent()}// Jump to ${label}`);
    }
    // Close the if block in next instruction
  }

  handleIfTrue(instr) {
    const condition = this.resolveValue(instr.arg1);
    const label = instr.result || instr.arg2;
    
    this.code.push(`${this.indent()}if (${condition}) {`);
    this.indentLevel++;
    
    if (label && this.labelMap.has(label)) {
      this.code.push(`${this.indent()}// Jump to ${label}`);
    }
  }

  handleGoto(instr) {
    const label = instr.result || instr.arg1;
    this.code.push(`${this.indent()}// goto ${label} (not supported in Java)`);
  }

  handleLabel(instr) {
    const label = instr.result || instr.arg1;
    this.code.push(`${this.indent()}// label: ${label}`);
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
    
    if (array.endsWith('.length')) {
      this.code.push(`${this.indent()}int ${result} = ${array};`);
    } else {
      this.code.push(`${this.indent()}Object ${result} = ${array}.get(${index});`);
    }
    this.varMap.set(result, result);
    this.varTypes.set(result, 'Object');
  }

  handleArraySet(instr) {
    const array = this.resolveValue(instr.arg1);
    const index = this.resolveValue(instr.arg2);
    const value = this.resolveValue(instr.result);
    this.code.push(`${this.indent()}${array}.set(${index}, ${value});`);
  }

  handleMemberSet(instr) {
    const obj = this.resolveValue(instr.arg1);
    const prop = instr.arg2;
    const value = this.resolveValue(instr.result);
    this.code.push(`${this.indent()}${obj}.put("${prop}", ${value});`);
  }

  handleArrayCreate(instr) {
    const size = instr.arg1 ? this.resolveValue(instr.arg1) : 0;
    const result = instr.result || this.getTempVar();
    this.code.push(`${this.indent()}ArrayList<Object> ${result} = new ArrayList<>(${size});`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'ArrayList');
  }

  handleObjectCreate(instr) {
    const result = instr.result || this.getTempVar();
    this.code.push(`${this.indent()}HashMap<String, Object> ${result} = new HashMap<>();`);
    this.varMap.set(result, result);
    this.varTypes.set(result, 'HashMap');
  }

  handleForInit(instr) {
    const varName = instr.arg1;
    const initValue = this.resolveValue(instr.arg2);
    this.code.push(`${this.indent()}for (int ${varName} = ${initValue};`);
  }

  handleForCondition(instr) {
    const condition = this.resolveValue(instr.arg1);
    this.code[this.code.length - 1] += ` ${condition};`;
  }

  handleForUpdate(instr) {
    const update = `${instr.arg1} ${instr.operation}= ${this.resolveValue(instr.arg2)}`;
    this.code[this.code.length - 1] += ` ${update}) {`;
    this.indentLevel++;
  }

  handleBreak(instr) {
    this.code.push(`${this.indent()}break;`);
  }

  handleContinue(instr) {
    this.code.push(`${this.indent()}continue;`);
  }

  handleTryStart(instr) {
    this.code.push(`${this.indent()}try {`);
    this.indentLevel++;
  }

  handleCatchStart(instr) {
    this.indentLevel--;
    const exception = instr.arg1 || 'Exception';
    const varName = instr.arg2 || 'e';
    this.code.push(`${this.indent()}} catch (${exception} ${varName}) {`);
    this.indentLevel++;
  }

  handleFinallyStart(instr) {
    this.indentLevel--;
    this.code.push(`${this.indent()}} finally {`);
    this.indentLevel++;
  }

  handleThrow(instr) {
    const exception = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}throw new Exception(${exception});`);
  }

  handleUnknown(instr) {
    this.code.push(`${this.indent()}// Unknown operation: ${instr.operation}`);
    this.code.push(`${this.indent()}// ${JSON.stringify(instr)}`);
  }

  // Helper methods
  getNumberType(value) {
    return Number.isInteger(parseFloat(value)) ? 'int' : 'double';
  }

  inferType(value) {
    if (typeof value === 'string') {
      if (value.startsWith('"')) return 'String';
      if (value === 'true' || value === 'false') return 'boolean';
      if (!isNaN(value)) return this.getNumberType(value);
    }
    return 'Object';
  }

  getArithmeticResultType(type1, type2) {
    const precedence = { double: 3, int: 2, boolean: 1 };
    return precedence[type1] > precedence[type2] ? type1 : type2;
  }

  mapMathMethod(method) {
    const mappings = {
      random: 'Math.random()',
      pow: 'Math.pow',
      sqrt: 'Math.sqrt',
      abs: 'Math.abs',
      floor: 'Math.floor',
      ceil: 'Math.ceil'
    };
    return mappings[method] || `Math.${method}`;
  }
}