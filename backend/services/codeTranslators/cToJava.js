/**
 * C to Java code translator
 * @param {string} code - C code to be translated
 * @returns {string} - Java equivalent code
 */
export const cToJava = (code) => {
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let lastIndent = 0;
  let hasMainMethod = false;
  let includeScanner = false;
  let className = 'CProgram';
  
  // First pass - detect if we need Scanner for input operations
  for (let line of lines) {
    if (line.includes('scanf') || line.includes('getchar') || line.includes('gets')) {
      includeScanner = true;
      break;
    }
  }
  
  // Add class wrapper and imports if needed
  if (includeScanner) {
    translated.push('import java.util.Scanner;');
    translated.push('');
  }
  
  translated.push(`public class ${className} {`);
  if (includeScanner) {
    translated.push('    private static Scanner scanner = new Scanner(System.in);');
    translated.push('');
  }
  indentation = 1;
  
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
      
      // Convert C types to Java types
      const javaReturnType = convertCTypeToJava(returnType);
      const javaParams = convertCParamsToJava(params);
      
      if (funcName === 'main') {
        translated.push(currentIndent + `public static void main(String[] args) {`);
        hasMainMethod = true;
      } else {
        const modifier = hasMainMethod ? 'public static' : 'public static';
        translated.push(currentIndent + `${modifier} ${javaReturnType} ${funcName}(${javaParams}) {`);
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
      translated.push('    '.repeat(indentation) + '}');
      continue;
    }
    
    // Handle variable declarations
    const varDeclMatch = trimmed.match(/^(int|float|double|char|long|short|bool)\s+(.+);?$/);
    if (varDeclMatch) {
      const [_, cType, varDecl] = varDeclMatch;
      const javaType = convertCTypeToJava(cType);
      
      // Handle multiple variable declarations
      if (varDecl.includes(',')) {
        const vars = varDecl.split(',').map(v => v.trim());
        for (let j = 0; j < vars.length; j++) {
          const varName = vars[j].replace(/[\[\]]/g, ''); // Remove array brackets for now
          translated.push(currentIndent + `${javaType} ${varName};`);
        }
      } else {
        let modifiedDecl = varDecl;
        // Handle array declarations
        const arrayMatch = varDecl.match(/(\w+)\[(\d*)\]/);
        if (arrayMatch) {
          const [_, varName, size] = arrayMatch;
          if (size) {
            translated.push(currentIndent + `${javaType}[] ${varName} = new ${javaType}[${size}];`);
          } else {
            translated.push(currentIndent + `${javaType}[] ${varName};`);
          }
        } else {
          translated.push(currentIndent + `${javaType} ${modifiedDecl};`);
        }
      }
      continue;
    }
    
    // Handle printf statements
    if (trimmed.includes('printf(')) {
      let modifiedLine = trimmed.replace(/printf\s*\(/, 'System.out.printf(');
      // Convert C format specifiers to Java format specifiers
      modifiedLine = modifiedLine.replace(/%d/g, '%d');
      modifiedLine = modifiedLine.replace(/%f/g, '%.2f');
      modifiedLine = modifiedLine.replace(/%c/g, '%c');
      modifiedLine = modifiedLine.replace(/%s/g, '%s');
      modifiedLine = modifiedLine.replace(/\\n/g, '%n');
      
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
          translated.push(currentIndent + `${varName} = scanner.nextInt();`);
        } else if (format.includes('%f')) {
          translated.push(currentIndent + `${varName} = scanner.nextFloat();`);
        } else if (format.includes('%c')) {
          translated.push(currentIndent + `${varName} = scanner.next().charAt(0);`);
        } else if (format.includes('%s')) {
          translated.push(currentIndent + `${varName} = scanner.next();`);
        } else {
          translated.push(currentIndent + `${varName} = scanner.next();`);
        }
      }
      continue;
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) {
      let condition = trimmed.replace(/if\s*\((.+?)\)\s*{?/, '$1');
      // Convert C logical operators to Java
      condition = condition.replace(/&&/g, '&&')
                          .replace(/\|\|/g, '||')
                          .replace(/!=/g, '!=')
                          .replace(/==/g, '==');
      
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
                          .replace(/!=/g, '!=')
                          .replace(/==/g, '==');
      
      translated.push(currentIndent + `} else if (${condition}) {`);
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle else statements
    if (trimmed === 'else' || trimmed === 'else {') {
      translated.push(currentIndent + 'else {');
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
      let javaInit = init.trim();
      const initMatch = javaInit.match(/^(int|float|double|char)\s+(.+)/);
      if (initMatch) {
        const [_, type, varDecl] = initMatch;
        javaInit = `${convertCTypeToJava(type)} ${varDecl}`;
      }
      
      translated.push(currentIndent + `for (${javaInit}; ${condition.trim()}; ${increment.trim()}) {`);
      if (!trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle while loops
    const whileMatch = trimmed.match(/while\s*\((.+?)\)\s*{?/);
    if (whileMatch) {
      const [_, condition] = whileMatch;
      translated.push(currentIndent + `while (${condition}) {`);
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
      translated.push(currentIndent + `} while (${condition});`);
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
      modifiedLine = modifiedLine.replace(/strlen\(([^)]+)\)/g, '$1.length()');
    }
    
    if (modifiedLine.includes('strcpy(')) {
      modifiedLine = modifiedLine.replace(/strcpy\(([^,]+),\s*([^)]+)\)/g, '$1 = $2');
    }
    
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
  
  // Close the main class
  translated.push('}');
  
  return translated.join('\n');
};

/**
 * Convert C data types to Java data types
 * @param {string} cType - C data type
 * @returns {string} - Java data type
 */
function convertCTypeToJava(cType) {
  const typeMap = {
    'int': 'int',
    'float': 'float',
    'double': 'double',
    'char': 'char',
    'void': 'void',
    'long': 'long',
    'short': 'short',
    'bool': 'boolean',
    'unsigned int': 'int',
    'unsigned long': 'long',
    'unsigned short': 'short'
  };
  
  return typeMap[cType.trim()] || cType.trim();
}

/**
 * Convert C function parameters to Java parameters
 * @param {string} params - C function parameters
 * @returns {string} - Java function parameters
 */
function convertCParamsToJava(params) {
  if (!params || params.trim() === '' || params.trim() === 'void') {
    return '';
  }
  
  const paramList = params.split(',').map(param => {
    param = param.trim();
    
    // Handle array parameters
    const arrayMatch = param.match(/^(int|float|double|char|long|short)\s+(\w+)\[\]/);
    if (arrayMatch) {
      const [_, type, name] = arrayMatch;
      return `${convertCTypeToJava(type)}[] ${name}`;
    }
    
    // Handle pointer parameters (convert to arrays)
    const pointerMatch = param.match(/^(int|float|double|char|long|short)\s*\*\s*(\w+)/);
    if (pointerMatch) {
      const [_, type, name] = pointerMatch;
      return `${convertCTypeToJava(type)}[] ${name}`;
    }
    
    // Handle regular parameters
    const regularMatch = param.match(/^(int|float|double|char|long|short|void)\s+(\w+)/);
    if (regularMatch) {
      const [_, type, name] = regularMatch;
      return `${convertCTypeToJava(type)} ${name}`;
    }
    
    return param;
  });
  
  return paramList.join(', ');
}