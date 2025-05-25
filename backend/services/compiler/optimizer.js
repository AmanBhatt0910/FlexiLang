export class CodeOptimizer {
  constructor(instructions) {
    this.instructions = instructions;
    this.optimized = [];
  }
  
  optimize() {
    // Create a copy of instructions for optimization
    let current = [...this.instructions];
    
    // Apply optimization passes
    current = this.constantFolding(current);
    current = this.deadCodeElimination(current);
    current = this.copyPropagation(current);
    current = this.algebraicSimplification(current);
    
    this.optimized = current;
    return this.optimized;
  }
  
  constantFolding(instructions) {
    const optimized = [];
    const constants = new Map();
    
    for (const instr of instructions) {
      if (instr.operation === 'LOAD_CONST') {
        constants.set(instr.result, instr.arg1);
        optimized.push(instr);
      } else if (['+', '-', '*', '/', '%'].includes(instr.operation)) {
        const val1 = constants.get(instr.arg1);
        const val2 = constants.get(instr.arg2);
        
        if (val1 !== undefined && val2 !== undefined && 
            typeof val1 === 'number' && typeof val2 === 'number') {
          
          let result;
          switch (instr.operation) {
            case '+': result = val1 + val2; break;
            case '-': result = val1 - val2; break;
            case '*': result = val1 * val2; break;
            case '/': result = val2 !== 0 ? val1 / val2 : val1; break;
            case '%': result = val2 !== 0 ? val1 % val2 : val1; break;
          }
          
          constants.set(instr.result, result);
          optimized.push(new IntermediateInstruction('LOAD_CONST', result, null, instr.result));
        } else {
          optimized.push(instr);
        }
      } else {
        optimized.push(instr);
      }
    }
    
    return optimized;
  }
  
  deadCodeElimination(instructions) {
    const used = new Set();
    const optimized = [];
    
    // Mark all used variables
    for (const instr of instructions) {
      if (instr.arg1) used.add(instr.arg1);
      if (instr.arg2) used.add(instr.arg2);
      
      // Always keep certain operations
      if (['CALL', 'RETURN', 'LABEL', 'GOTO', 'IF_FALSE', 'FUNC_START', 'FUNC_END'].includes(instr.operation)) {
        optimized.push(instr);
      } else if (instr.result && used.has(instr.result)) {
        optimized.push(instr);
      } else if (!instr.result) {
        optimized.push(instr);
      }
    }
    
    return optimized;
  }
  
  copyPropagation(instructions) {
    const copies = new Map();
    const optimized = [];
    
    for (const instr of instructions) {
      let newInstr = new IntermediateInstruction(
        instr.operation,
        copies.get(instr.arg1) || instr.arg1,
        copies.get(instr.arg2) || instr.arg2,
        instr.result
      );
      
      if (instr.operation === 'ASSIGN' && instr.arg2 === null) {
        copies.set(instr.result, instr.arg1);
      }
      
      optimized.push(newInstr);
    }
    
    return optimized;
  }
  
  algebraicSimplification(instructions) {
    const optimized = [];
    
    for (const instr of instructions) {
      if (instr.operation === '+' && instr.arg2 === '0') {
        // x + 0 = x
        optimized.push(new IntermediateInstruction('ASSIGN', instr.arg1, null, instr.result));
      } else if (instr.operation === '*' && (instr.arg1 === '1' || instr.arg2 === '1')) {
        // x * 1 = x
        const operand = instr.arg1 === '1' ? instr.arg2 : instr.arg1;
        optimized.push(new IntermediateInstruction('ASSIGN', operand, null, instr.result));
      } else if (instr.operation === '*' && (instr.arg1 === '0' || instr.arg2 === '0')) {
        // x * 0 = 0
        optimized.push(new IntermediateInstruction('LOAD_CONST', 0, null, instr.result));
      } else {
        optimized.push(instr);
      }
    }
    
    return optimized;
  }
}
