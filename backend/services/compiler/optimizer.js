export class CodeOptimizer {
  constructor(instructions) {
    this.instructions = instructions || [];
    this.optimized = [];
    this.stats = {
      originalCount: 0,
      optimizedCount: 0,
      passesApplied: 0,
      optimizationsApplied: 0
    };
  }
  
  optimize() {
    console.log('=== CodeOptimizer.optimize() started ===');
    console.log('Input instructions:', this.instructions);
    
    if (!Array.isArray(this.instructions) || this.instructions.length === 0) {
      console.log('No instructions to optimize');
      return this.instructions;
    }

    this.stats.originalCount = this.instructions.length;
    
    // Create a copy of instructions for optimization
    let current = [...this.instructions];
    
    // Apply optimization passes in order
    console.log('Applying constant folding...');
    current = this.constantFolding(current);
    this.stats.passesApplied++;
    
    console.log('Applying copy propagation...');
    current = this.copyPropagation(current);
    this.stats.passesApplied++;
    
    console.log('Applying algebraic simplification...');
    current = this.algebraicSimplification(current);
    this.stats.passesApplied++;
    
    console.log('Applying dead code elimination...');
    current = this.deadCodeElimination(current);
    this.stats.passesApplied++;
    
    // Apply peephole optimizations
    console.log('Applying peephole optimizations...');
    current = this.peepholeOptimization(current);
    this.stats.passesApplied++;
    
    this.optimized = current;
    this.stats.optimizedCount = current.length;
    
    console.log('=== Optimization complete ===');
    console.log('Original count:', this.stats.originalCount);
    console.log('Optimized count:', this.stats.optimizedCount);
    console.log('Optimizations applied:', this.stats.optimizationsApplied);
    
    return this.optimized;
  }
  
  constantFolding(instructions) {
    console.log('=== Constant Folding Pass ===');
    const optimized = [];
    const constants = new Map();
    let optimizationsInPass = 0;
    
    for (const instr of instructions) {
      if (!instr || !instr.operation) {
        console.warn('Skipping invalid instruction:', instr);
        continue;
      }

      if (instr.operation === 'LOAD_CONST') {
        constants.set(instr.result, instr.arg1);
        optimized.push(instr);
      } else if (['+', '-', '*', '/', '%', '**'].includes(instr.operation)) {
        const val1 = constants.get(instr.arg1);
        const val2 = constants.get(instr.arg2);
        
        if (val1 !== undefined && val2 !== undefined && 
            typeof val1 === 'number' && typeof val2 === 'number') {
          
          let result;
          try {
            switch (instr.operation) {
              case '+': result = val1 + val2; break;
              case '-': result = val1 - val2; break;
              case '*': result = val1 * val2; break;
              case '/': 
                if (val2 === 0) {
                  optimized.push(instr); // Keep original to avoid division by zero
                  continue;
                }
                result = val1 / val2; 
                break;
              case '%': 
                if (val2 === 0) {
                  optimized.push(instr); // Keep original to avoid modulo by zero
                  continue;
                }
                result = val1 % val2; 
                break;
              case '**': result = Math.pow(val1, val2); break;
            }
            
            constants.set(instr.result, result);
            optimized.push(this.createInstruction(
              'LOAD_CONST', 
              result, 
              null, 
              instr.result,
              instr.params || []
            ));
            optimizationsInPass++;
            console.log(`Folded constant: ${val1} ${instr.operation} ${val2} = ${result}`);
          } catch (error) {
            console.warn('Error in constant folding:', error);
            optimized.push(instr);
          }
        } else {
          optimized.push(instr);
          // If result is stored, mark it as non-constant
          if (instr.result) {
            constants.delete(instr.result);
          }
        }
      } else if (['==', '!=', '<', '>', '<=', '>='].includes(instr.operation)) {
        // Constant folding for comparisons
        const val1 = constants.get(instr.arg1);
        const val2 = constants.get(instr.arg2);
        
        if (val1 !== undefined && val2 !== undefined) {
          let result;
          switch (instr.operation) {
            case '==': result = val1 == val2; break;
            case '!=': result = val1 != val2; break;
            case '<': result = val1 < val2; break;
            case '>': result = val1 > val2; break;
            case '<=': result = val1 <= val2; break;
            case '>=': result = val1 >= val2; break;
          }
          
          constants.set(instr.result, result);
          optimized.push(this.createInstruction(
            'LOAD_CONST', 
            result, 
            null, 
            instr.result,
            instr.params || []
          ));
          optimizationsInPass++;
          console.log(`Folded comparison: ${val1} ${instr.operation} ${val2} = ${result}`);
        } else {
          optimized.push(instr);
        }
      } else {
        optimized.push(instr);
        // Clear constants that might be modified
        if (instr.result) {
          constants.delete(instr.result);
        }
      }
    }
    
    this.stats.optimizationsApplied += optimizationsInPass;
    console.log(`Constant folding applied ${optimizationsInPass} optimizations`);
    return optimized;
  }
  
  copyPropagation(instructions) {
    console.log('=== Copy Propagation Pass ===');
    const copies = new Map();
    const optimized = [];
    let optimizationsInPass = 0;
    
    for (const instr of instructions) {
      if (!instr || !instr.operation) {
        continue;
      }

      // Create new instruction with propagated values
      let newInstr = this.createInstruction(
        instr.operation,
        this.propagateValue(instr.arg1, copies),
        this.propagateValue(instr.arg2, copies),
        instr.result,
        instr.params || []
      );
      
      // Track copy assignments
      if (instr.operation === 'ASSIGN' && instr.arg2 === null) {
        const propagatedValue = this.propagateValue(instr.arg1, copies);
        copies.set(instr.result, propagatedValue);
        console.log(`Copy propagation: ${instr.result} = ${propagatedValue}`);
        optimizationsInPass++;
      }
      
      // Clear copies if variable is reassigned
      if (instr.result && instr.operation !== 'ASSIGN') {
        copies.delete(instr.result);
      }
      
      optimized.push(newInstr);
    }
    
    this.stats.optimizationsApplied += optimizationsInPass;
    console.log(`Copy propagation applied ${optimizationsInPass} optimizations`);
    return optimized;
  }
  
  propagateValue(value, copies) {
    if (value && typeof value === 'string' && copies.has(value)) {
      return copies.get(value);
    }
    return value;
  }
  
  algebraicSimplification(instructions) {
    console.log('=== Algebraic Simplification Pass ===');
    const optimized = [];
    let optimizationsInPass = 0;
    
    for (const instr of instructions) {
      if (!instr || !instr.operation) {
        continue;
      }

      let newInstr = null;
      
      // Addition simplifications
      if (instr.operation === '+') {
        if (this.isZero(instr.arg1)) {
          newInstr = this.createInstruction('ASSIGN', instr.arg2, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: 0 + ${instr.arg2} => ${instr.arg2}`);
        } else if (this.isZero(instr.arg2)) {
          newInstr = this.createInstruction('ASSIGN', instr.arg1, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: ${instr.arg1} + 0 => ${instr.arg1}`);
        }
      }
      
      // Subtraction simplifications
      else if (instr.operation === '-') {
        if (this.isZero(instr.arg2)) {
          newInstr = this.createInstruction('ASSIGN', instr.arg1, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: ${instr.arg1} - 0 => ${instr.arg1}`);
        } else if (instr.arg1 === instr.arg2) {
          newInstr = this.createInstruction('LOAD_CONST', 0, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: ${instr.arg1} - ${instr.arg1} => 0`);
        }
      }
      
      // Multiplication simplifications
      else if (instr.operation === '*') {
        if (this.isZero(instr.arg1) || this.isZero(instr.arg2)) {
          newInstr = this.createInstruction('LOAD_CONST', 0, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: multiplication by 0 => 0`);
        } else if (this.isOne(instr.arg1)) {
          newInstr = this.createInstruction('ASSIGN', instr.arg2, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: 1 * ${instr.arg2} => ${instr.arg2}`);
        } else if (this.isOne(instr.arg2)) {
          newInstr = this.createInstruction('ASSIGN', instr.arg1, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: ${instr.arg1} * 1 => ${instr.arg1}`);
        }
      }
      
      // Division simplifications
      else if (instr.operation === '/') {
        if (this.isOne(instr.arg2)) {
          newInstr = this.createInstruction('ASSIGN', instr.arg1, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: ${instr.arg1} / 1 => ${instr.arg1}`);
        } else if (instr.arg1 === instr.arg2 && !this.isZero(instr.arg1)) {
          newInstr = this.createInstruction('LOAD_CONST', 1, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: ${instr.arg1} / ${instr.arg1} => 1`);
        }
      }
      
      // Power simplifications
      else if (instr.operation === '**') {
        if (this.isZero(instr.arg2)) {
          newInstr = this.createInstruction('LOAD_CONST', 1, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: ${instr.arg1} ** 0 => 1`);
        } else if (this.isOne(instr.arg2)) {
          newInstr = this.createInstruction('ASSIGN', instr.arg1, null, instr.result, instr.params || []);
          optimizationsInPass++;
          console.log(`Simplified: ${instr.arg1} ** 1 => ${instr.arg1}`);
        }
      }
      
      // Use simplified instruction or original
      optimized.push(newInstr || instr);
    }
    
    this.stats.optimizationsApplied += optimizationsInPass;
    console.log(`Algebraic simplification applied ${optimizationsInPass} optimizations`);
    return optimized;
  }
  
  deadCodeElimination(instructions) {
    console.log('=== Dead Code Elimination Pass ===');
    const used = new Set();
    const defined = new Set();
    const optimized = [];
    let optimizationsInPass = 0;
    
    // First pass: collect all used variables
    for (const instr of instructions) {
      if (!instr || !instr.operation) continue;
      
      if (instr.arg1 && typeof instr.arg1 === 'string') {
        used.add(instr.arg1);
      }
      if (instr.arg2 && typeof instr.arg2 === 'string') {
        used.add(instr.arg2);
      }
      if (instr.params) {
        instr.params.forEach(param => {
          if (typeof param === 'string') {
            used.add(param);
          }
        });
      }
      
      if (instr.result) {
        defined.add(instr.result);
      }
    }
    
    // Second pass: keep only necessary instructions
    for (const instr of instructions) {
      if (!instr || !instr.operation) continue;
      
      // Always keep certain operations (side effects)
      const alwaysKeep = [
        'CALL', 'RETURN', 'LABEL', 'GOTO', 'IF_FALSE', 'IF_TRUE',
        'FUNC_START', 'FUNC_END', 'ARRAY_SET', 'MEMBER_SET',
        'THROW', 'TRY_START', 'TRY_END', 'CATCH_START', 'CATCH_END'
      ];
      
      if (alwaysKeep.includes(instr.operation)) {
        optimized.push(instr);
      } else if (instr.result && used.has(instr.result)) {
        optimized.push(instr);
      } else if (!instr.result) {
        // Instructions without results (might have side effects)
        optimized.push(instr);
      } else {
        // This instruction defines a variable that's never used
        console.log(`Eliminated dead code: ${instr.operation} -> ${instr.result}`);
        optimizationsInPass++;
      }
    }
    
    this.stats.optimizationsApplied += optimizationsInPass;
    console.log(`Dead code elimination removed ${optimizationsInPass} instructions`);
    return optimized;
  }
  
  peepholeOptimization(instructions) {
    console.log('=== Peephole Optimization Pass ===');
    const optimized = [];
    let optimizationsInPass = 0;
    
    for (let i = 0; i < instructions.length; i++) {
      const current = instructions[i];
      const next = instructions[i + 1];
      
      if (!current || !current.operation) {
        continue;
      }
      
      // Pattern: LOAD_CONST followed by ASSIGN to same variable
      if (current.operation === 'LOAD_CONST' && 
          next && next.operation === 'ASSIGN' && 
          next.arg1 === current.result && 
          next.arg2 === null) {
        
        // Combine into single LOAD_CONST
        optimized.push(this.createInstruction(
          'LOAD_CONST',
          current.arg1,
          null,
          next.result,
          current.params || []
        ));
        i++; // Skip next instruction
        optimizationsInPass++;
        console.log(`Peephole: Combined LOAD_CONST + ASSIGN`);
        continue;
      }
      
      // Pattern: ASSIGN followed by ASSIGN to same source
      if (current.operation === 'ASSIGN' && 
          next && next.operation === 'ASSIGN' && 
          next.arg1 === current.result && 
          next.arg2 === null) {
        
        // Direct assignment from original source
        optimized.push(current);
        optimized.push(this.createInstruction(
          'ASSIGN',
          current.arg1,
          null,
          next.result,
          next.params || []
        ));
        i++; // Skip next instruction
        optimizationsInPass++;
        console.log(`Peephole: Optimized chained assignment`);
        continue;
      }
      
      optimized.push(current);
    }
    
    this.stats.optimizationsApplied += optimizationsInPass;
    console.log(`Peephole optimization applied ${optimizationsInPass} optimizations`);
    return optimized;
  }
  
  // Helper methods
  isZero(value) {
    return value === 0 || value === '0';
  }
  
  isOne(value) {
    return value === 1 || value === '1';
  }
  
  createInstruction(operation, arg1, arg2, result, params = []) {
    // This should match your IntermediateInstruction class structure
    return {
      operation,
      arg1,
      arg2,
      result,
      params: [...params],
      toString() {
        let str = `${this.operation}`;
        if (this.arg1 !== null && this.arg1 !== undefined) str += ` ${this.arg1}`;
        if (this.arg2 !== null && this.arg2 !== undefined) str += ` ${this.arg2}`;
        if (this.result) str += ` -> ${this.result}`;
        if (this.params && this.params.length > 0) str += ` [${this.params.join(', ')}]`;
        return str;
      }
    };
  }
  
  getStats() {
    return {
      ...this.stats,
      reductionPercentage: this.stats.originalCount > 0 
        ? Math.round(((this.stats.originalCount - this.stats.optimizedCount) / this.stats.originalCount) * 100)
        : 0
    };
  }
  
  printOptimizationReport() {
    const stats = this.getStats();
    console.log('=== Optimization Report ===');
    console.log(`Original instructions: ${stats.originalCount}`);
    console.log(`Optimized instructions: ${stats.optimizedCount}`);
    console.log(`Instructions removed: ${stats.originalCount - stats.optimizedCount}`);
    console.log(`Reduction: ${stats.reductionPercentage}%`);
    console.log(`Optimization passes: ${stats.passesApplied}`);
    console.log(`Total optimizations applied: ${stats.optimizationsApplied}`);
  }
}