/**
 * C to Python code translator
 * @param {string} code - C code to be translated
 * @returns {string} - Python equivalent code
 */
export const cToPython = (code) => {
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let hasMainMethod = false;
  let needsSysImport = false;
  let needsMathImport = false;
  
  // First pass - detect if we need imports
  for (let line of lines) {
    if (line.includes('printf') || line.includes('scanf') || line.includes('getchar') || line.includes('gets')) {
      // Python doesn't need special imports for basic I/O
    }
    if (line.includes('pow') || line.includes('sqrt') || line.includes('sin') || line.includes('cos')) {
      needsMathImport = true;
    }
  }
  
  // Add imports if needed
  if (needsMathImport) {
    translated.push('import math');
    translated.push('');
  }
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let currentIndent = '    '.repeat(indentation);
    
    // Skip empty lines but preserve them
    if (trimmed === '') {
      translated.push('');
      continue;
    }
    
    // Skip preprocessor directives (includes, defines, etc.)
    if (trimmed.startsWith('#')) {
      continue;
    }
    
    // Handle single-line comments
    if (trimmed.startsWith('//')) {
      translated.push(currentIndent + trimmed.replace('//', '#'));
      continue;
    }
    
    // Handle multi-line comments (convert to Python style)
    if (trimmed.startsWith('/*')) {
      translated.push(currentIndent + '"""');
      let commentContent = trimmed.replace('/*', '').replace('*/', '');
      if (commentContent.trim()) {
        translated.push(currentIndent + commentContent.trim());
      }
      continue;
    }
    
    if (trimmed.endsWith('*/')) {
      let commentContent = trimmed.replace('*/', '');
      if (commentContent.trim()) {
        translated.push(currentIndent + commentContent.trim());
      }
      translated.push(currentIndent + '"""');
      continue;
    }
    
    // Handle function definitions
    const funcMatch = trimmed.match(/^(int|void|float|double|char|long|short)\s+(\w+)\s*\((.*?)\)\s*{?$/);
    if (funcMatch) {
      const [_, returnType, funcName, params] = funcMatch;
      
      const pythonParams = convertCParamsToPython(params);
      
      if (funcName === 'main') {
        translated.push('def main():');
        hasMainMethod = true;
      } else {
        translated.push(`def ${funcName}(${pythonParams}):`);
      }
      
      indentation++;
      continue;
    }
    
    // Handle opening braces (Python doesn't use braces)
    if (trimmed === '{') {
      continue;
    }
    
    // Handle closing braces
    if (trimmed === '}') {
      indentation--;
      // Add pass statement if the block was empty
      if (translated.length > 0 && translated[translated.length - 1].trim().endsWith(':')) {
        translated.push('    '.repeat(indentation + 1) + 'pass');
      }
      continue;
    }
    
    // Handle variable declarations (Python doesn't need type declarations)
    const varDeclMatch = trimmed.match(/^(int|float|double|char|long|short|bool)\s+(.+);?$/);
    if (varDeclMatch) {
      const [_, cType, varDecl] = varDeclMatch;
      
      // Handle multiple variable declarations
      if (varDecl.includes(',')) {
        const vars = varDecl.split(',').map(v => v.trim());
        for (let j = 0; j < vars.length; j++) {
          let varName = vars[j];
          
          // Handle initialization
          if (varName.includes('=')) {
            translated.push(currentIndent + varName);
          } else {
            // Handle array declarations
            const arrayMatch = varName.match(/(\w+)\[(\d*)\]/);
            if (arrayMatch) {
              const [_, name, size] = arrayMatch;
              if (size) {
                translated.push(currentIndent + `${name} = [0] * ${size}`);
              } else {
                translated.push(currentIndent + `${name} = []`);
              }
            } else {
              // Initialize with appropriate default value
              const defaultValue = getDefaultValue(cType);
              translated.push(currentIndent + `${varName} = ${defaultValue}`);
            }
          }
        }
      } else {
        let varName = varDecl;
        
        // Handle initialization
        if (varName.includes('=')) {
          translated.push(currentIndent + varName);
        } else {
          // Handle array declarations
          const arrayMatch = varName.match(/(\w+)\[(\d*)\]/);
          if (arrayMatch) {
            const [_, name, size] = arrayMatch;
            if (size) {
              translated.push(currentIndent + `${name} = [0] * ${size}`);
            } else {
              translated.push(currentIndent + `${name} = []`);
            }
          } else {
            // Initialize with appropriate default value
            const defaultValue = getDefaultValue(cType);
            translated.push(currentIndent + `${varName} = ${defaultValue}`);
          }
        }
      }
      continue;
    }
    
    // Handle printf statements
    if (trimmed.includes('printf(')) {
      let modifiedLine = trimmed.replace(/printf\s*\(/, 'print(');
      
      // Convert C format specifiers to Python format
      modifiedLine = modifiedLine.replace(/%d/g, '{}');
      modifiedLine = modifiedLine.replace(/%f/g, '{:.2f}');
      modifiedLine = modifiedLine.replace(/%c/g, '{}');
      modifiedLine = modifiedLine.replace(/%s/g, '{}');
      modifiedLine = modifiedLine.replace(/\\n/g, '');
      
      // Handle format string and variables
      const printMatch = modifiedLine.match(/print\s*\(\s*"([^"]*)"(.*?)\)/);
      if (printMatch) {
        const [_, formatStr, vars] = printMatch;
        if (vars.trim()) {
          // Remove leading comma and spaces
          const cleanVars = vars.replace(/^\s*,\s*/, '');
          modifiedLine = `print("${formatStr}".format(${cleanVars}))`;
        } else {
          modifiedLine = `print("${formatStr}")`;
        }
      }
      
      // Remove semicolon
      modifiedLine = modifiedLine.replace(/;$/, '');
      translated.push(currentIndent + modifiedLine);
      continue;
    }
    
    // Handle scanf statements
    if (trimmed.includes('scanf(')) {
      const scanfMatch = trimmed.match(/scanf\s*\(\s*"([^"]+)"\s*,\s*&?(\w+)\s*\)/);
      if (scanfMatch) {
        const [_, format, varName] = scanfMatch;
        
        if (format.includes('%d')) {
          translated.push(currentIndent + `${varName} = int(input())`);
        } else if (format.includes('%f')) {
          translated.push(currentIndent + `${varName} = float(input())`);
        } else if (format.includes('%c')) {
          translated.push(currentIndent + `${varName} = input()[0]`);
        } else if (format.includes('%s')) {
          translated.push(currentIndent + `${varName} = input()`);
        } else {
          translated.push(currentIndent + `${varName} = input()`);
        }
      }
      continue;
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) {
      let condition = trimmed.replace(/if\s*\((.+?)\)\s*{?/, '$1');
      // Convert C logical operators to Python
      condition = condition.replace(/&&/g, ' and ')
                          .replace(/\|\|/g, ' or ')
                          .replace(/!=/g, '!=')
                          .replace(/==/g, '==')
                          .replace(/!/g, 'not ');
      
      translated.push(currentIndent + `if ${condition}:`);
      indentation++;
      continue;
    }
    
    // Handle else if statements
    if (trimmed.startsWith('else if')) {
      indentation--; // Decrease for the previous if block
      let condition = trimmed.replace(/else\s+if\s*\((.+?)\)\s*{?/, '$1');
      condition = condition.replace(/&&/g, ' and ')
                          .replace(/\|\|/g, ' or ')
                          .replace(/!=/g, '!=')
                          .replace(/==/g, '==')
                          .replace(/!/g, 'not ');
      
      translated.push(currentIndent + `elif ${condition}:`);
      indentation++;
      continue;
    }
    
    // Handle else statements
    if (trimmed === 'else' || trimmed === 'else {') {
      indentation--; // Decrease for the previous if block
      translated.push(currentIndent + 'else:');
      indentation++;
      continue;
    }
    
    // Handle for loops
    const forMatch = trimmed.match(/for\s*\((.+?);(.+?);(.+?)\)\s*{?/);
    if (forMatch) {
      const [_, init, condition, increment] = forMatch;
      
      // Extract variable name and initial value
      const initMatch = init.trim().match(/(?:int\s+)?(\w+)\s*=\s*(.+)/);
      const condMatch = condition.trim().match(/(\w+)\s*(<|<=|>|>=)\s*(.+)/);
      const incrMatch = increment.trim().match(/(\w+)(\+\+|--|\s*\+=\s*\d+|\s*-=\s*\d+)/);
      
      if (initMatch && condMatch && incrMatch) {
        const [_, varName, initialValue] = initMatch;
        const [__, condVar, operator, endValue] = condMatch;
        const [___, incrVar, incrOp] = incrMatch;
        
        if (operator === '<' && incrOp === '++') {
          translated.push(currentIndent + `for ${varName} in range(${initialValue}, ${endValue}):`);
        } else if (operator === '<=' && incrOp === '++') {
          translated.push(currentIndent + `for ${varName} in range(${initialValue}, ${endValue} + 1):`);
        } else {
          // Fallback to while loop for complex for loops
          translated.push(currentIndent + `${varName} = ${initialValue}`);
          translated.push(currentIndent + `while ${condition.trim()}:`);
        }
      } else {
        // Fallback: convert to while loop
        translated.push(currentIndent + init.trim());
        translated.push(currentIndent + `while ${condition.trim()}:`);
      }
      
      indentation++;
      continue;
    }
    
    // Handle while loops
    const whileMatch = trimmed.match(/while\s*\((.+?)\)\s*{?/);
    if (whileMatch) {
      const [_, condition] = whileMatch;
      let pythonCondition = condition.replace(/&&/g, ' and ')
                                   .replace(/\|\|/g, ' or ')
                                   .replace(/!=/g, '!=')
                                   .replace(/==/g, '==')
                                   .replace(/!/g, 'not ');
      translated.push(currentIndent + `while ${pythonCondition}:`);
      indentation++;
      continue;
    }
    
    // Handle do-while loops (convert to while True with break)
    if (trimmed === 'do' || trimmed === 'do {') {
      translated.push(currentIndent + 'while True:');
      indentation++;
      continue;
    }
    
    const doWhileMatch = trimmed.match(/}\s*while\s*\((.+?)\);?/);
    if (doWhileMatch) {
      const [_, condition] = doWhileMatch;
      let pythonCondition = condition.replace(/&&/g, ' and ')
                                   .replace(/\|\|/g, ' or ')
                                   .replace(/!=/g, '!=')
                                   .replace(/==/g, '==')
                                   .replace(/!/g, 'not ');
      indentation--;
      translated.push(currentIndent + `if not (${pythonCondition}):`);
      translated.push(currentIndent + '    break');
      continue;
    }
    
    // Handle switch statements (convert to if-elif chain)
    const switchMatch = trimmed.match(/switch\s*\((.+?)\)\s*{?/);
    if (switchMatch) {
      const [_, variable] = switchMatch;
      translated.push(currentIndent + `# Switch statement for ${variable}`);
      translated.push(currentIndent + `_switch_var = ${variable}`);
      continue;
    }
    
    // Handle case statements
    const caseMatch = trimmed.match(/case\s+(.+?):/);
    if (caseMatch) {
      const [_, value] = caseMatch;
      if (translated[translated.length - 1].includes('_switch_var')) {
        translated.push(currentIndent + `if _switch_var == ${value}:`);
      } else {
        translated.push(currentIndent + `elif _switch_var == ${value}:`);
      }
      indentation++;
      continue;
    }
    
    // Handle default case
    if (trimmed === 'default:') {
      translated.push(currentIndent + 'else:');
      indentation++;
      continue;
    }
    
    // Handle break and continue
    if (trimmed === 'break;') {
      translated.push(currentIndent + 'break');
      continue;
    }
    
    if (trimmed === 'continue;') {
      translated.push(currentIndent + 'continue');
      continue;
    }
    
    // Handle return statements
    if (trimmed.startsWith('return ')) {
      let returnStmt = trimmed.replace(/;$/, '');
      translated.push(currentIndent + returnStmt);
      continue;
    }
    
    // Handle increment/decrement operators
    let modifiedLine = trimmed;
    modifiedLine = modifiedLine.replace(/(\w+)\+\+/g, '$1 += 1');
    modifiedLine = modifiedLine.replace(/(\w+)--/g, '$1 -= 1');
    modifiedLine = modifiedLine.replace(/\+\+(\w+)/g, '$1 += 1');
    modifiedLine = modifiedLine.replace(/--(\w+)/g, '$1 -= 1');
    
    // Convert C string operations
    if (modifiedLine.includes('strlen(')) {
      modifiedLine = modifiedLine.replace(/strlen\(([^)]+)\)/g, 'len($1)');
    }
    
    if (modifiedLine.includes('strcpy(')) {
      modifiedLine = modifiedLine.replace(/strcpy\(([^,]+),\s*([^)]+)\)/g, '$1 = $2');
    }
    
    // Convert math functions
    if (modifiedLine.includes('pow(')) {
      modifiedLine = modifiedLine.replace(/pow\(([^,]+),\s*([^)]+)\)/g, 'math.pow($1, $2)');
    }
    
    // Remove semicolon (Python doesn't use semicolons)
    modifiedLine = modifiedLine.replace(/;$/, '');
    
    // Skip empty lines after processing
    if (modifiedLine.trim() === '') {
      continue;
    }
    
    translated.push(currentIndent + modifiedLine);
  }
  
  // Add main execution block if main function exists
  if (hasMainMethod) {
    translated.push('');
    translated.push('if __name__ == "__main__":');
    translated.push('    main()');
  }
  
  return translated.join('\n');
};

/**
 * Get default value for Python variables based on C type
 * @param {string} cType - C data type
 * @returns {string} - Default value in Python
 */
function getDefaultValue(cType) {
  const defaultMap = {
    'int': '0',
    'float': '0.0',
    'double': '0.0',
    'char': "''",
    'long': '0',
    'short': '0',
    'bool': 'False',
    'unsigned int': '0',
    'unsigned long': '0',
    'unsigned short': '0'
  };
  
  return defaultMap[cType.trim()] || '0';
}

/**
 * Convert C function parameters to Python parameters
 * @param {string} params - C function parameters
 * @returns {string} - Python function parameters
 */
function convertCParamsToPython(params) {
  if (!params || params.trim() === '' || params.trim() === 'void') {
    return '';
  }
  
  const paramList = params.split(',').map(param => {
    param = param.trim();
    
    // Extract parameter name (Python doesn't need type declarations)
    const arrayMatch = param.match(/^(int|float|double|char|long|short)\s+(\w+)\[\]/);
    if (arrayMatch) {
      const [_, type, name] = arrayMatch;
      return name;
    }
    
    const pointerMatch = param.match(/^(int|float|double|char|long|short)\s*\*\s*(\w+)/);
    if (pointerMatch) {
      const [_, type, name] = pointerMatch;
      return name;
    }
    
    const regularMatch = param.match(/^(int|float|double|char|long|short|void)\s+(\w+)/);
    if (regularMatch) {
      const [_, type, name] = regularMatch;
      return name;
    }
    
    return param;
  });
  
  return paramList.join(', ');
}