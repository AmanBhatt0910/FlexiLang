/**
 * Java to JavaScript code translator
 * @param {string} code - Java code to be translated
 * @returns {string} - JavaScript equivalent code
 */
export const javaToJs = (code) => {
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let lastIndent = 0;
  let insideClass = false;
  let className = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let currentIndent = ' '.repeat(indentation * 2);
    
    // Skip empty lines but preserve them
    if (trimmed === '') {
      translated.push('');
      continue;
    }
    
    // Calculate current indentation level
    const indent = line.search(/\S|$/);
    
    // Detect indentation changes (closing braces)
    if (i > 0 && indent < lastIndent && trimmed === '}') {
      indentation--;
      translated.push(' '.repeat(indentation * 2) + '}');
      continue;
    }
    lastIndent = indent;
    
    // Handle comments
    if (trimmed.startsWith('//')) {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')) {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle imports/packages
    if (trimmed.startsWith('package ')) {
      // Skip package declarations in JS
      translated.push(currentIndent + `// ${trimmed}`);
      continue;
    }
    
    if (trimmed.startsWith('import ')) {
      const importMatch = trimmed.match(/import\s+(?:static\s+)?(.+?);/);
      if (importMatch) {
        const importPath = importMatch[1];
        if (importPath.includes('*')) {
          const module = importPath.replace('.*', '');
          const moduleName = module.split('.').pop();
          translated.push(currentIndent + `import * as ${moduleName} from '${module}';`);
        } else {
          const className = importPath.split('.').pop();
          translated.push(currentIndent + `import { ${className} } from '${importPath}';`);
        }
      }
      continue;
    }
    
    // Handle class definitions
    if (trimmed.includes('class ')) {
      const classMatch = trimmed.match(/(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:final\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+?))?\s*\{?/);
      if (classMatch) {
        const [_, name, parent, interfaces] = classMatch;
        className = name;
        insideClass = true;
        
        if (parent) {
          translated.push(currentIndent + `class ${name} extends ${parent} {`);
        } else {
          translated.push(currentIndent + `class ${name} {`);
        }
        
        if (!trimmed.endsWith('{')) {
          indentation++;
        } else {
          indentation++;
        }
        continue;
      }
    }
    
    // Handle interface definitions
    if (trimmed.includes('interface ')) {
      const interfaceMatch = trimmed.match(/(?:public\s+)?interface\s+(\w+)(?:\s+extends\s+(.+?))?\s*\{?/);
      if (interfaceMatch) {
        const [_, name, parent] = interfaceMatch;
        translated.push(currentIndent + `// Interface ${name}`);
        translated.push(currentIndent + `class ${name} {`);
        indentation++;
        continue;
      }
    }
    
    // Handle method definitions
    if (trimmed.includes('(') && trimmed.includes(')') && (trimmed.includes('public') || trimmed.includes('private') || trimmed.includes('protected') || trimmed.includes('static'))) {
      const methodMatch = trimmed.match(/(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:final\s+)?(\w+|void)\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+\w+)?\s*\{?/);
      if (methodMatch) {
        const [_, returnType, methodName, params] = methodMatch;
        
        // Handle constructor
        if (methodName === className) {
          translated.push(currentIndent + `constructor(${params}) {`);
        } else if (returnType === 'void') {
          translated.push(currentIndent + `${methodName}(${params}) {`);
        } else {
          translated.push(currentIndent + `${methodName}(${params}) {`);
        }
        
        if (!trimmed.endsWith('{')) {
          indentation++;
        } else {
          indentation++;
        }
        continue;
      }
    }
    
    // Handle field declarations
    const fieldMatch = trimmed.match(/(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:final\s+)?(\w+)\s+(\w+)(?:\s*=\s*(.+?))?;/);
    if (fieldMatch && !trimmed.includes('(')) {
      const [_, type, varName, value] = fieldMatch;
      if (value) {
        translated.push(currentIndent + `${varName} = ${value};`);
      } else {
        translated.push(currentIndent + `${varName};`);
      }
      continue;
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ') && trimmed.includes('(')) {
      const condition = trimmed.match(/if\s*\((.+?)\)/)[1]
        .replace(/&&/g, '&&')
        .replace(/\|\|/g, '||')
        .replace(/!/g, '!');
      
      translated.push(currentIndent + `if (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle else if statements
    if (trimmed.startsWith('else if ')) {
      const condition = trimmed.match(/else\s+if\s*\((.+?)\)/)[1];
      translated.push(currentIndent + `} else if (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle else statements
    if (trimmed === 'else {' || trimmed === 'else') {
      translated.push(currentIndent + '} else {');
      indentation++;
      continue;
    }
    
    // Handle for loops
    if (trimmed.startsWith('for ')) {
      // Enhanced for loop (for-each)
      const enhancedForMatch = trimmed.match(/for\s*\(\s*(\w+)\s+(\w+)\s*:\s*(.+?)\s*\)/);
      if (enhancedForMatch) {
        const [_, type, varName, iterable] = enhancedForMatch;
        translated.push(currentIndent + `for (const ${varName} of ${iterable}) {`);
      } else {
        // Traditional for loop
        const forMatch = trimmed.match(/for\s*\((.+?)\)/);
        if (forMatch) {
          const forContent = forMatch[1];
          translated.push(currentIndent + `for (${forContent}) {`);
        }
      }
      indentation++;
      continue;
    }
    
    // Handle while loops
    if (trimmed.startsWith('while ')) {
      const condition = trimmed.match(/while\s*\((.+?)\)/)[1];
      translated.push(currentIndent + `while (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle do-while loops
    if (trimmed.startsWith('do ') || trimmed === 'do {') {
      translated.push(currentIndent + 'do {');
      indentation++;
      continue;
    }
    
    if (trimmed.startsWith('} while ')) {
      const condition = trimmed.match(/\}\s*while\s*\((.+?)\)/)[1];
      translated.push(currentIndent + `} while (${condition});`);
      continue;
    }
    
    // Handle switch statements
    if (trimmed.startsWith('switch ')) {
      const switchVar = trimmed.match(/switch\s*\((.+?)\)/)[1];
      translated.push(currentIndent + `switch (${switchVar}) {`);
      indentation++;
      continue;
    }
    
    // Handle case statements
    if (trimmed.startsWith('case ')) {
      const caseValue = trimmed.match(/case\s+(.+?):/)[1];
      translated.push(currentIndent + `case ${caseValue}:`);
      continue;
    }
    
    if (trimmed === 'default:') {
      translated.push(currentIndent + 'default:');
      continue;
    }
    
    // Handle try-catch-finally
    if (trimmed === 'try {' || trimmed === 'try') {
      translated.push(currentIndent + 'try {');
      indentation++;
      continue;
    }
    
    if (trimmed.startsWith('catch ')) {
      const catchMatch = trimmed.match(/catch\s*\(\s*(\w+)\s+(\w+)\s*\)/);
      if (catchMatch) {
        const [_, exceptionType, varName] = catchMatch;
        translated.push(currentIndent + `} catch (${varName}) {`);
      } else {
        translated.push(currentIndent + '} catch (e) {');
      }
      indentation++;
      continue;
    }
    
    if (trimmed === 'finally {' || trimmed === 'finally') {
      translated.push(currentIndent + '} finally {');
      indentation++;
      continue;
    }
    
    // Handle System.out.println to console.log
    if (trimmed.includes('System.out.println')) {
      const printMatch = trimmed.match(/System\.out\.println\s*\((.+?)\)/);
      if (printMatch) {
        translated.push(currentIndent + `console.log(${printMatch[1]});`);
        continue;
      }
    }
    
    if (trimmed.includes('System.out.print')) {
      const printMatch = trimmed.match(/System\.out\.print\s*\((.+?)\)/);
      if (printMatch) {
        translated.push(currentIndent + `process.stdout.write(${printMatch[1]});`);
        continue;
      }
    }
    
    // Handle return statements
    if (trimmed.startsWith('return ')) {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle break and continue
    if (trimmed === 'break;') {
      translated.push(currentIndent + 'break;');
      continue;
    }
    
    if (trimmed === 'continue;') {
      translated.push(currentIndent + 'continue;');
      continue;
    }
    
    // Handle variable declarations with types
    const varDeclMatch = trimmed.match(/(\w+)\s+(\w+)(?:\s*=\s*(.+?))?;/);
    if (varDeclMatch && !trimmed.includes('(') && !trimmed.includes('public') && !trimmed.includes('private') && !trimmed.includes('protected')) {
      const [_, type, varName, value] = varDeclMatch;
      if (value) {
        translated.push(currentIndent + `let ${varName} = ${value};`);
      } else {
        // Handle type-specific default values
        let defaultValue = 'undefined';
        if (type === 'int' || type === 'double' || type === 'float' || type === 'long') {
          defaultValue = '0';
        } else if (type === 'boolean') {
          defaultValue = 'false';
        } else if (type === 'String') {
          defaultValue = '""';
        }
        translated.push(currentIndent + `let ${varName} = ${defaultValue};`);
      }
      continue;
    }
    
    // Handle array declarations
    if (trimmed.includes('[]') && trimmed.includes('=')) {
      const arrayMatch = trimmed.match(/(\w+)\[\]\s+(\w+)\s*=\s*(.+?);/);
      if (arrayMatch) {
        const [_, type, varName, value] = arrayMatch;
        if (value.startsWith('new ') && value.includes('[')) {
          // new int[5] -> new Array(5)
          const sizeMatch = value.match(/new\s+\w+\[(.+?)\]/);
          if (sizeMatch) {
            translated.push(currentIndent + `let ${varName} = new Array(${sizeMatch[1]});`);
          }
        } else {
          translated.push(currentIndent + `let ${varName} = ${value};`);
        }
        continue;
      }
    }
    
    // Handle Java's length property for arrays
    if (trimmed.includes('.length')) {
      translated.push(currentIndent + line.replace(/\.length(?!\()/g, '.length') + (trimmed.endsWith(';') ? '' : ';'));
      continue;
    }
    
    // Handle opening braces on separate lines
    if (trimmed === '{') {
      indentation++;
      translated.push(currentIndent + '{');
      continue;
    }
    
    // Generic line conversion - ensure semicolons
    if (trimmed.length > 0 && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith(':')) {
      // Don't add semicolon to comments or certain keywords
      if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
        translated.push(currentIndent + trimmed + ';');
      } else {
        translated.push(currentIndent + trimmed);
      }
    } else {
      translated.push(currentIndent + trimmed);
    }
  }
  
  // Add closing braces for any remaining indentation
  while (indentation > 0) {
    indentation--;
    translated.push(' '.repeat(indentation * 2) + '}');
  }
  
  return translated.join('\n');
};