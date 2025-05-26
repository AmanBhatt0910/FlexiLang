export class JavaScriptGenerator {
  constructor(intermediateCode) {
    console.log('=== JavaScriptCodeGenerator Constructor ===');
    console.log('Intermediate Code:', intermediateCode);
    
    // Extract instructions from the intermediate code object
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
    this.functionStack = [];
    this.loopStack = [];
    this.tempVarCounter = 0;
    this.usedVars = new Set();
    this.strictMode = true;
    this.asyncMode = false;
  }

  indent() {
    return '  '.repeat(this.indentLevel);
  }

  generate() {
    console.log('=== JavaScriptCodeGenerator.generate() called ===');
    console.log('Instructions to process:', this.ic.length);
    
    if (this.ic.length === 0) {
      console.log('No instructions to process');
      return '// No code to generate';
    }
    
    // Add strict mode if enabled
    if (this.strictMode) {
      this.code.push('"use strict";');
      this.code.push('');
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
        this.code.push(`${this.indent()}// Error processing instruction: ${error.message}`);
      }
    }
    
    // Clean up and combine code
    const codeBody = this.code
      .filter(line => line !== null && line !== undefined)
      .map(line => typeof line === 'string' ? line : String(line))
      .filter((line, index) => {
        // Keep empty lines that provide structure
        if (line.trim() === '') {
          const prevLine = this.code[index - 1];
          const nextLine = this.code[index + 1];
          return prevLine && nextLine && (
            prevLine.includes('}') || 
            nextLine.includes('function') || 
            nextLine.includes('class')
          );
        }
        return true;
      });
    
    const result = codeBody.join('\n');
    
    console.log('=== Final result ===');
    console.log('Final result:', result);
    return result;
  }

  analyzeInstructions() {
    console.log('=== Analyzing instructions ===');
    
    // Check if we need async/await
    for (const instr of this.ic) {
      if (!instr || !instr.operation) continue;
      
      // Check for async operations
      if (instr.operation === 'AWAIT' || instr.operation === 'ASYNC_CALL') {
        this.asyncMode = true;
      }
      
      // Check for specific ES6+ features
      if (instr.operation === 'DESTRUCTURE' || instr.operation === 'SPREAD') {
        // Could add ES6 compatibility checks here
      }
    }
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
      case '===':
      case '!==':
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

      // ES6+ features
      case 'CONST_DECLARE':
        this.handleConstDeclare(instr);
        break;

      case 'LET_DECLARE':
        this.handleLetDeclare(instr);
        break;

      case 'ARROW_FUNCTION':
        this.handleArrowFunction(instr);
        break;

      case 'TEMPLATE_LITERAL':
        this.handleTemplateLiteral(instr);
        break;

      case 'DESTRUCTURE':
        this.handleDestructure(instr);
        break;

      case 'SPREAD':
        this.handleSpread(instr);
        break;

      case 'AWAIT':
        this.handleAwait(instr);
        break;

      case 'ASYNC_CALL':
        this.handleAsyncCall(instr);
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
      this.code.push(`${this.indent()}console.log();`);
      return;
    }
    
    // Resolve the value to print
    const valueToPrint = this.resolveValue(instr.arg1);
    console.log('Resolved value to print:', valueToPrint);
    
    this.code.push(`${this.indent()}console.log(${valueToPrint});`);
  }

  handleAdd(instr) {
    console.log('=== handleAdd ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    // Check if variable already declared
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}let ${result} = ${left} + ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} + ${right};`);
    }
    
    this.varMap.set(result, result);
  }

  handleSub(instr) {
    console.log('=== handleSub ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}let ${result} = ${left} - ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} - ${right};`);
    }
    
    this.varMap.set(result, result);
  }

  handleMul(instr) {
    console.log('=== handleMul ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}let ${result} = ${left} * ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} * ${right};`);
    }
    
    this.varMap.set(result, result);
  }

  handleDiv(instr) {
    console.log('=== handleDiv ===');
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}let ${result} = ${left} / ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} / ${right};`);
    }
    
    this.varMap.set(result, result);
  }

  handleFunctionStart(instr) {
    console.log('=== handleFunctionStart ===');
    const funcName = instr.arg1 || 'anonymousFunction';
    const params = (instr.params || []).join(', ');
    const isAsync = instr.async || this.asyncMode;
    
    // Add JSDoc if available
    if (instr.docstring) {
      this.code.push(`${this.indent()}/**`);
      this.code.push(`${this.indent()} * ${instr.docstring}`);
      this.code.push(`${this.indent()} */`);
    }
    
    const asyncKeyword = isAsync ? 'async ' : '';
    this.code.push(`${this.indent()}${asyncKeyword}function ${funcName}(${params}) {`);
    this.indentLevel++;
    this.functionStack.push(funcName);
  }

  handleFunctionEnd(instr) {
    console.log('=== handleFunctionEnd ===');
    
    this.indentLevel--;
    this.functionStack.pop();
    this.code.push(`${this.indent()}}`);
    this.code.push(''); // Empty line after function
  }

  handleMemberGet(instr) {
    console.log('=== handleMemberGet ===');
    console.log('arg1:', instr.arg1, 'arg2:', instr.arg2, 'result:', instr.result);
    
    // Handle console.log and other built-ins
    if (instr.arg1 === 'console' && instr.arg2 === 'log') {
      console.log('Mapping console.log');
      this.varMap.set(instr.result, 'console.log');
      return;
    }
    
    // Handle Math object methods
    if (instr.arg1 === 'Math') {
      this.varMap.set(instr.result, `Math.${instr.arg2}`);
      return;
    }

    // Handle Array/Object property access
    const resolvedObj = this.resolveValue(instr.arg1);
    const memberAccess = `${resolvedObj}.${instr.arg2}`;
    this.varMap.set(instr.result, memberAccess);
  }

  handleCall(instr) {
    console.log('=== handleCall ===');
    console.log('Full instruction:', instr);
    
    // Resolve function name from varMap first, then try direct lookup
    let funcName = this.varMap.get(instr.arg1);
    if (funcName === undefined) {
      funcName = instr.arg1;
    }
    
    console.log('Resolved function name:', funcName);
    
    const params = instr.params || [];
    const args = params.map(param => this.resolveValue(param)).join(', ');
    
    console.log('Final arguments string:', args);

    // Handle special function calls
    if (funcName === 'console.log') {
      console.log('Generating console.log statement');
      this.code.push(`${this.indent()}console.log(${args});`);
      return;
    }

    // Handle array methods
    if (typeof funcName === 'string' && funcName.includes('.')) {
      const parts = funcName.split('.');
      const method = parts[parts.length - 1];
      
      if (['push', 'pop', 'shift', 'unshift', 'slice', 'splice'].includes(method)) {
        if (instr.result) {
          if (!this.usedVars.has(instr.result)) {
            this.code.push(`${this.indent()}let ${instr.result} = ${funcName}(${args});`);
            this.usedVars.add(instr.result);
          } else {
            this.code.push(`${this.indent()}${instr.result} = ${funcName}(${args});`);
          }
          this.varMap.set(instr.result, instr.result);
        } else {
          this.code.push(`${this.indent()}${funcName}(${args});`);
        }
        return;
      }
    }
    
    // For regular function calls
    if (instr.result) {
      console.log('Generating function call with assignment');
      if (!this.usedVars.has(instr.result)) {
        this.code.push(`${this.indent()}let ${instr.result} = ${funcName}(${args});`);
        this.usedVars.add(instr.result);
      } else {
        this.code.push(`${this.indent()}${instr.result} = ${funcName}(${args});`);
      }
      this.varMap.set(instr.result, instr.result);
    } else {
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
    console.log('Set in varMap:', instr.result, '->', instr.arg1);
  }

  handleAssign(instr) {
    console.log('=== handleAssign ===');
    if (!instr.result || instr.arg1 === undefined || instr.arg1 === null) {
      console.warn('Invalid ASSIGN instruction:', instr);
      return;
    }

    const resolvedValue = this.resolveValue(instr.arg1);
    
    // Check if variable already exists
    if (this.usedVars.has(instr.result)) {
      this.code.push(`${this.indent()}${instr.result} = ${resolvedValue};`);
    } else {
      this.code.push(`${this.indent()}let ${instr.result} = ${resolvedValue};`);
      this.usedVars.add(instr.result);
    }
    
    // Update variable mapping
    const sourceValue = this.varMap.get(instr.arg1);
    if (sourceValue !== undefined) {
      this.varMap.set(instr.result, sourceValue);
    } else {
      this.varMap.set(instr.result, instr.result);
    }
  }

  handleDeclare(instr) {
    console.log('=== handleDeclare ===');
    if (!instr.arg1) {
      console.warn('Invalid DECLARE instruction:', instr);
      return;
    }
    
    const initValue = instr.arg2 ? this.resolveValue(instr.arg2) : 'undefined';
    this.code.push(`${this.indent()}let ${instr.arg1} = ${initValue};`);
    this.varMap.set(instr.arg1, instr.arg1);
    this.usedVars.add(instr.arg1);
  }

  handleConstDeclare(instr) {
    if (!instr.arg1) {
      console.warn('Invalid CONST_DECLARE instruction:', instr);
      return;
    }
    
    const initValue = instr.arg2 ? this.resolveValue(instr.arg2) : 'undefined';
    this.code.push(`${this.indent()}const ${instr.arg1} = ${initValue};`);
    this.varMap.set(instr.arg1, instr.arg1);
    this.usedVars.add(instr.arg1);
  }

  handleLetDeclare(instr) {
    if (!instr.arg1) {
      console.warn('Invalid LET_DECLARE instruction:', instr);
      return;
    }
    
    const initValue = instr.arg2 ? this.resolveValue(instr.arg2) : 'undefined';
    this.code.push(`${this.indent()}let ${instr.arg1} = ${initValue};`);
    this.varMap.set(instr.arg1, instr.arg1);
    this.usedVars.add(instr.arg1);
  }

  handleArrowFunction(instr) {
    const params = (instr.params || []).join(', ');
    const body = instr.body || 'return undefined;';
    const result = instr.result || this.getTempVar();
    const isAsync = instr.async || false;
    
    const asyncKeyword = isAsync ? 'async ' : '';
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}const ${result} = ${asyncKeyword}(${params}) => {`);
      this.indentLevel++;
      this.code.push(`${this.indent()}${body}`);
      this.indentLevel--;
      this.code.push(`${this.indent()}};`);
      this.usedVars.add(result);
    }
    
    this.varMap.set(result, result);
  }

  handleTemplateLiteral(instr) {
    const template = instr.arg1 || '';
    const substitutions = instr.substitutions || [];
    const result = instr.result || this.getTempVar();
    
    // Replace placeholders with actual values
    let processedTemplate = template;
    substitutions.forEach((sub, index) => {
      const value = this.resolveValue(sub);
      processedTemplate = processedTemplate.replace(`\${${index}}`, `\${${value}}`);
    });
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}const ${result} = \`${processedTemplate}\`;`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = \`${processedTemplate}\`;`);
    }
    
    this.varMap.set(result, result);
  }

  handleDestructure(instr) {
    const pattern = instr.pattern || '{}';
    const source = this.resolveValue(instr.source);
    
    this.code.push(`${this.indent()}const ${pattern} = ${source};`);
    
    // Mark destructured variables as used
    if (instr.variables) {
      instr.variables.forEach(variable => {
        this.usedVars.add(variable);
        this.varMap.set(variable, variable);
      });
    }
  }

  handleSpread(instr) {
    const array = this.resolveValue(instr.source);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}const ${result} = [...${array}];`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = [...${array}];`);
    }
    
    this.varMap.set(result, result);
  }

  handleAwait(instr) {
    const promise = this.resolveValue(instr.arg1);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}const ${result} = await ${promise};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = await ${promise};`);
    }
    
    this.varMap.set(result, result);
  }

  handleAsyncCall(instr) {
    // Similar to regular call but marks function as async
    this.asyncMode = true;
    this.handleCall(instr);
  }

  handleArithmetic(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    // Handle special JavaScript operators
    let operation = instr.operation;
    if (operation === '//') {
      // Floor division
      operation = '/';
      const expression = `Math.floor(${left} ${operation} ${right})`;
      
      if (!this.usedVars.has(result)) {
        this.code.push(`${this.indent()}let ${result} = ${expression};`);
        this.usedVars.add(result);
      } else {
        this.code.push(`${this.indent()}${result} = ${expression};`);
      }
    } else {
      if (!this.usedVars.has(result)) {
        this.code.push(`${this.indent()}let ${result} = ${left} ${operation} ${right};`);
        this.usedVars.add(result);
      } else {
        this.code.push(`${this.indent()}${result} = ${left} ${operation} ${right};`);
      }
    }
    
    this.varMap.set(result, result);
  }

  handleComparison(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}let ${result} = ${left} ${instr.operation} ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} ${instr.operation} ${right};`);
    }
    
    this.varMap.set(result, result);
  }

  handleLogicalAnd(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}let ${result} = ${left} && ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} && ${right};`);
    }
    
    this.varMap.set(result, result);
  }

  handleLogicalOr(instr) {
    const left = this.resolveValue(instr.arg1);
    const right = this.resolveValue(instr.arg2);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}let ${result} = ${left} || ${right};`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${left} || ${right};`);
    }
    
    this.varMap.set(result, result);
  }

    handleLogicalNot(instr) {
    const operand = this.resolveValue(instr.arg1);
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}let ${result} = !(${operand});`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = !(${operand});`);
    }
    
    this.varMap.set(result, result);
  }

  handleIfFalse(instr) {
    const condition = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}if (!${condition}) {`);
    this.indentLevel++;
  }

  handleIfTrue(instr) {
    const condition = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}if (${condition}) {`);
    this.indentLevel++;
  }

  handleGoto(instr) {
    const label = instr.result || instr.arg1;
    this.code.push(`${this.indent()}// goto ${label} (not supported in JavaScript)`);
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
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}const ${result} = ${array}[${index}];`);
      this.usedVars.add(result);
    } else {
      this.code.push(`${this.indent()}${result} = ${array}[${index}];`);
    }
    this.varMap.set(result, result);
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
    const elements = (instr.params || []).map(p => this.resolveValue(p)).join(', ');
    const result = instr.result || this.getTempVar();
    
    if (!this.usedVars.has(result)) {
      this.code.push(`${this.indent()}const ${result} = [${elements}];`);
      this.usedVars.add(result);
    }
    this.varMap.set(result, result);
  }

  handleObjectCreate(instr) {
    const result = instr.result || this.getTempVar();
    const props = (instr.params || []).map((p, i) => {
      if (i % 2 === 0) return `${p}: ${this.resolveValue(instr.params[i+1])}`;
    }).filter(Boolean).join(', ');
    
    this.code.push(`${this.indent()}const ${result} = {${props}};`);
    this.varMap.set(result, result);
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
    this.code.push(`${this.indent()}try {`);
    this.indentLevel++;
  }

  handleCatchStart(instr) {
    this.indentLevel--;
    const errorVar = instr.arg1 || 'e';
    this.code.push(`${this.indent()}} catch (${errorVar}) {`);
    this.indentLevel++;
  }

  handleFinallyStart() {
    this.indentLevel--;
    this.code.push(`${this.indent()}} finally {`);
    this.indentLevel++;
  }

  handleThrow(instr) {
    const value = this.resolveValue(instr.arg1);
    this.code.push(`${this.indent()}throw ${value};`);
  }

  handleUnknown(instr) {
    this.code.push(`${this.indent()}// Unknown operation: ${instr.operation}`);
    this.code.push(`${this.indent()}// ${JSON.stringify(instr)}`);
  }

  // Helper method to resolve values
  resolveValue(value) {
    if (this.varMap.has(value)) {
      return this.varMap.get(value);
    }
    // Handle numeric values
    if (typeof value === 'number') return value;
    // Handle string literals
    if (typeof value === 'string' && !this.varMap.has(value)) {
      return `'${value}'`;
    }
    return value;
  }

  getTempVar() {
    return `__temp${this.tempVarCounter++}`;
  }
}