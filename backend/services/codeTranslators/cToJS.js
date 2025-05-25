/**
 * C to JavaScript code translator
 * @param {string} code - C code to be translated
 * @returns {string} - JavaScript equivalent code
 */
export const cToJS = (code) => {
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let hasMainFunction = false;
  let needsReadlineSync = false;
  
  // First pass - detect if we need readline-sync for input operations
  for (let line of lines) {
    if (line.includes('scanf') || line.includes('getchar') || line.includes('gets')) {
      needsReadlineSync = true;
      break;
    }
  }
  
  // Add imports if needed
  if (needsReadlineSync) {
    translated.push('const readlineSync = require(\'readline-sync\');');
    translated.push('');
  }
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let currentIndent = '  '.repeat(indentation);
    
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
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle multi-line comments
    if (trimmed.startsWith('/*')) {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle function definitions
    const funcMatch = trimmed.match(/^(int|void|float|double|char|long|short)\s+(\w+)\s*\((.*?)\)\s*{?$/);
    if (funcMatch) {
      const [_, returnType, funcName, params] = funcMatch;
      
      const jsParams = convertCParamsToJS(params);
      
      if (funcName === 'main') {
        translated.push(currentIndent + `function main(${jsParams}) {`);
        hasMainFunction = true;
      } else {
        translated.push(currentIndent + `function ${funcName}(${jsParams}) {`);
      }
      
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle opening braces
    if (trimmed === '{') {
      indentation++;
      continue;
    }
    
    // Handle closing braces
    if (trimmed === '}') {
      indentation--;
      translated.push('  '.repeat(indentation) + '}');
      continue;
    }
    
    // Handle variable declarations
    const varDeclMatch = trimmed.match(/^(int|float|double|char|long|short|bool)\s+(.+);?$/);
    if (varDeclMatch) {
      const [_, cType, varDecl] = varDeclMatch;
      
      // Handle multiple variable declarations
      if (varDecl.includes(',')) {
        const vars = varDecl.split(',').map(v => v.trim());
        for (let j = 0; j < vars.length; j++) {
          let varName = vars[j];
          
          // Handle array declarations
          const arrayMatch = varName.match(/(\w+)\[(\d*)\]/);
          if (arrayMatch) {
            const [_, name, size] = arrayMatch;
            if (size) {
              translated.push(currentIndent + `let ${name} = new Array(${size});`);
            } else {
              translated.push(currentIndent + `let ${name} = [];`);
            }
          } else {
            // Handle initialization
            if (varName.includes('=')) {
              translated.push(currentIndent + `let ${varName};`);
            } else {
              const defaultValue = getDefaultValue(cType);
              translated.push(currentIndent + `let ${varName} = ${defaultValue};`);
            }
          }
        }
      } else {
        let modifiedDecl = varDecl;
        
        // Handle array declarations
        const arrayMatch = varDecl.match(/(\w+)\[(\d*)\]/);
        if (arrayMatch) {
          const [_, varName, size] = arrayMatch;
          if (size) {
            translated.push(currentIndent + `let ${varName} = new Array(${size});`);
          } else {
            translated.push(currentIndent + `let ${varName} = [];`);
          }
        } else {
          // Handle initialization
          if (varDecl.includes('=')) {
            translated.push(currentIndent + `let ${modifiedDecl};`);
          } else {
            const defaultValue = getDefaultValue(cType);
            translated.push(currentIndent + `let ${modifiedDecl} = ${defaultValue};`);
          }
        }
      }
      continue;
    }
    
    // Handle printf statements
    if (trimmed.includes('printf(')) {
      let modifiedLine = trimmed.replace(/printf\s*\(/, 'console.log(');
      
      // Convert C format specifiers to template literals or string concatenation
      const formatMatch = modifiedLine.match(/console\.log\(\s*"([^"]+)"\s*(?:,\s*(.+?))?\s*\)/);
      if (formatMatch) {
        const [_, format, vars] = formatMatch;
        let formatStr = format;
        
        // Convert format specifiers
        formatStr = formatStr.replace(/%d/g, '%s')
                            .replace(/%f/g, '%s')
                            .replace(/%c/g, '%s')
                            .replace(/\\n/g, '\\n');
        
        if (vars) {
          // Use template literal approach for cleaner output
          let templateStr = formatStr;
          const varList = vars.split(',').map(v => v.trim());
          
          for (let j = 0; j < varList.length; j++) {
            templateStr = templateStr.replace('%s', '${' + varList[j] + '}');
          }
          
          modifiedLine = `console.log(\`${templateStr}\`)`;
        } else {
          modifiedLine = `console.log("${formatStr}")`;
        }
      }
      
      if (!modifiedLine.endsWith(';')) {
        modifiedLine += ';';
      }
      translated.push(currentIndent + modifiedLine);
      continue;
    }
    
    // Handle scanf statements
    if (trimmed.includes('scanf(')) {
      const scanfMatch = trimmed.match(/scanf\s*\(\s*"([^"]+)"\s*,\s*&?(\w+)\s*\)/);
      if (scanfMatch) {
        const [_, format, varName] = scanfMatch;
        
        if (format.includes('%d')) {
          translated.push(currentIndent + `${varName} = parseInt(readlineSync.question(''));`);
        } else if (format.includes('%f')) {
          translated.push(currentIndent + `${varName} = parseFloat(readlineSync.question(''));`);
        } else if (format.includes('%c')) {
          translated.push(currentIndent + `${varName} = readlineSync.question('').charAt(0);`);
        } else if (format.includes('%s')) {
          translated.push(currentIndent + `${varName} = readlineSync.question('');`);
        } else {
          translated.push(currentIndent + `${varName} = readlineSync.question('');`);
        }
      }
      continue;
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) {
      let condition = trimmed.replace(/if\s*\((.+?)\)\s*{?/, '$1');
      // Convert C logical operators to JavaScript (they're the same)
      condition = condition.replace(/&&/g, '&&')
                          .replace(/\|\|/g, '||')
                          .replace(/!=/g, '!==')
                          .replace(/==/g, '===');
      
      translated.push(currentIndent + `if (${condition}) {`);
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle else if statements
    if (trimmed.startsWith('else if')) {
      let condition = trimmed.replace(/else\s+if\s*\((.+?)\)\s*{?/, '$1');
      condition = condition.replace(/&&/g, '&&')
                          .replace(/\|\|/g, '||')
                          .replace(/!=/g, '!==')
                          .replace(/==/g, '===');
      
      translated.push(currentIndent + `} else if (${condition}) {`);
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle else statements
    if (trimmed === 'else' || trimmed === 'else {') {
      translated.push(currentIndent + '} else {');
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle for loops
    const forMatch = trimmed.match(/for\s*\((.+?);(.+?);(.+?)\)\s*{?/);
    if (forMatch) {
      const [_, init, condition, increment] = forMatch;
      
      // Convert C for loop initialization
      let jsInit = init.trim();
      const initMatch = jsInit.match(/^(int|float|double|char)\s+(.+)/);
      if (initMatch) {
        const [_, type, varDecl] = initMatch;
        jsInit = `let ${varDecl}`;
      }
      
      let jsCondition = condition.trim().replace(/==/g, '===').replace(/!=/g, '!==');
      
      translated.push(currentIndent + `for (${jsInit}; ${jsCondition}; ${increment.trim()}) {`);
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle while loops
    const whileMatch = trimmed.match(/while\s*\((.+?)\)\s*{?/);
    if (whileMatch) {
      const [_, condition] = whileMatch;
      let jsCondition = condition.replace(/==/g, '===').replace(/!=/g, '!==');
      translated.push(currentIndent + `while (${jsCondition}) {`);
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle do-while loops
    if (trimmed === 'do' || trimmed === 'do {') {
      translated.push(currentIndent + 'do {');
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    const doWhileMatch = trimmed.match(/}\s*while\s*\((.+?)\);?/);
    if (doWhileMatch) {
      const [_, condition] = doWhileMatch;
      let jsCondition = condition.replace(/==/g, '===').replace(/!=/g, '!==');
      translated.push(currentIndent + `} while (${jsCondition});`);
      continue;
    }
    
    // Handle switch statements
    const switchMatch = trimmed.match(/switch\s*\((.+?)\)\s*{?/);
    if (switchMatch) {
      const [_, variable] = switchMatch;
      translated.push(currentIndent + `switch (${variable}) {`);
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle case statements
    const caseMatch = trimmed.match(/case\s+(.+?):/);
    if (caseMatch) {
      const [_, value] = caseMatch;
      translated.push(currentIndent + `case ${value}:`);
      continue;
    }
    
    // Handle default case
    if (trimmed === 'default:') {
      translated.push(currentIndent + 'default:');
      continue;
    }
    
    // Handle break and continue
    if (trimmed === 'break;' || trimmed === 'continue;') {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle return statements
    if (trimmed.startsWith('return ')) {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle array access and operations
    let modifiedLine = trimmed;
    
    // Convert C string operations
    if (modifiedLine.includes('strlen(')) {
      modifiedLine = modifiedLine.replace(/strlen\(([^)]+)\)/g, '$1.length');
    }
    
    if (modifiedLine.includes('strcpy(')) {
      modifiedLine = modifiedLine.replace(/strcpy\(([^,]+),\s*([^)]+)\)/g, '$1 = $2');
    }
    
    // Convert C comparison operators to JavaScript
    modifiedLine = modifiedLine.replace(/==/g, '===').replace(/!=/g, '!==');
    
    // Add semicolon if missing and not a control structure
    if (!modifiedLine.endsWith(';') && 
        !modifiedLine.endsWith('{') && 
        !modifiedLine.endsWith('}') && 
        !modifiedLine.endsWith(':') &&
        modifiedLine.length > 0) {
      modifiedLine += ';';
    }
    
    translated.push(currentIndent + modifiedLine);
  }
  
  // Add main function call if main function exists
  if (hasMainFunction) {
    translated.push('');
    translated.push('// Call main function');
    translated.push('main();');
  }
  
  return translated.join('\n');
};

/**
 * Get default value for JavaScript variables based on C type
 * @param {string} cType - C data type
 * @returns {string} - Default value in JavaScript
 */
function getDefaultValue(cType) {
  const typeDefaults = {
    'int': '0',
    'float': '0.0',
    'double': '0.0',
    'char': "''",
    'long': '0',
    'short': '0',
    'bool': 'false',
    'unsigned int': '0',
    'unsigned long': '0',
    'unsigned short': '0'
  };
  
  return typeDefaults[cType.trim()] || 'null';
}

/**
 * Convert C function parameters to JavaScript parameters
 * @param {string} params - C function parameters
 * @returns {string} - JavaScript function parameters
 */
function convertCParamsToJS(params) {
  if (!params || params.trim() === '' || params.trim() === 'void') {
    return '';
  }
  
  const paramList = params.split(',').map(param => {
    param = param.trim();
    
    // Handle array parameters
    const arrayMatch = param.match(/^(int|float|double|char|long|short)\s+(\w+)\[\]/);
    if (arrayMatch) {
      const [_, type, name] = arrayMatch;
      return name;
    }
    
    // Handle pointer parameters
    const pointerMatch = param.match(/^(int|float|double|char|long|short)\s*\*\s*(\w+)/);
    if (pointerMatch) {
      const [_, type, name] = pointerMatch;
      return name;
    }
    
    // Handle regular parameters
    const regularMatch = param.match(/^(int|float|double|char|long|short|void)\s+(\w+)/);
    if (regularMatch) {
      const [_, type, name] = regularMatch;
      return name;
    }
    
    return param;
  });
  
  return paramList.join(', ');
}