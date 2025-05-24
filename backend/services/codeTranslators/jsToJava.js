/**
 * JavaScript to Java code translator
 * @param {string} code - JavaScript code to be translated
 * @returns {string} - Java equivalent code
 */
export const jsToJava = (code) => {
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let lastIndent = 0;
  let insideClass = false;
  let className = '';
  let hasMainMethod = false;
  let packageName = '';
  let imports = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let currentIndent = ' '.repeat(indentation * 4); // Java uses 4 spaces typically
    
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
      translated.push(' '.repeat(indentation * 4) + '}');
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
    
    // Handle imports
    if (trimmed.startsWith('import ')) {
      // ES6 named imports: import { ClassName } from 'module'
      const namedImportMatch = trimmed.match(/import\s*\{\s*(.+?)\s*\}\s*from\s*['"](.+?)['"]/);
      if (namedImportMatch) {
        const [_, imports, module] = namedImportMatch;
        const importItems = imports.split(',').map(item => item.trim());
        importItems.forEach(item => {
          translated.push(`import ${module.replace(/['"]/g, '')}.${item};`);
        });
        continue;
      }
      
      // Namespace imports: import * as Module from 'module'
      const namespaceImportMatch = trimmed.match(/import\s*\*\s*as\s+(\w+)\s*from\s*['"](.+?)['"]/);
      if (namespaceImportMatch) {
        const [_, alias, module] = namespaceImportMatch;
        translated.push(`import ${module.replace(/['"]/g, '')}.*;`);
        continue;
      }
      
      // Default imports: import Module from 'module'
      const defaultImportMatch = trimmed.match(/import\s+(\w+)\s*from\s*['"](.+?)['"]/);
      if (defaultImportMatch) {
        const [_, moduleName, module] = defaultImportMatch;
        translated.push(`import ${module.replace(/['"]/g, '')}.${moduleName};`);
        continue;
      }
    }
    
    // Handle exports - convert to public class if it's a class export
    if (trimmed.startsWith('export ')) {
      // Remove export keyword and continue processing
      trimmed = trimmed.replace(/^export\s+/, '');
      line = line.replace(/^(\s*)export\s+/, '$1');
    }
    
    // Handle class definitions
    if (trimmed.includes('class ')) {
      const classMatch = trimmed.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?/);
      if (classMatch) {
        const [_, name, parent] = classMatch;
        className = name;
        insideClass = true;
        
        if (parent) {
          translated.push(currentIndent + `public class ${name} extends ${parent} {`);
        } else {
          translated.push(currentIndent + `public class ${name} {`);
        }
        
        indentation++;
        continue;
      }
    }
    
    // Handle constructor
    if (trimmed.startsWith('constructor(')) {
      const constructorMatch = trimmed.match(/constructor\s*\(([^)]*)\)\s*\{?/);
      if (constructorMatch) {
        const [_, params] = constructorMatch;
        // Convert parameters to Java types (assuming String for simplicity)
        const javaParams = params.split(',').map(param => {
          const p = param.trim();
          return p ? `String ${p}` : '';
        }).filter(p => p).join(', ');
        
        translated.push(currentIndent + `public ${className}(${javaParams}) {`);
        indentation++;
        continue;
      }
    }
    
    // Handle method definitions
    if (trimmed.includes('(') && trimmed.includes(')') && !trimmed.startsWith('if') && !trimmed.startsWith('while') && !trimmed.startsWith('for') && !trimmed.startsWith('switch')) {
      const methodMatch = trimmed.match(/(\w+)\s*\(([^)]*)\)\s*\{?/);
      if (methodMatch && !trimmed.includes('=') && !trimmed.includes('new ')) {
        const [_, methodName, params] = methodMatch;
        
        // Convert parameters to Java types
        const javaParams = params.split(',').map(param => {
          const p = param.trim();
          return p ? `String ${p}` : '';
        }).filter(p => p).join(', ');
        
        // Check if this might be a main-like function
        if (methodName === 'main' || (params === '' && methodName.toLowerCase().includes('main'))) {
          translated.push(currentIndent + `public static void main(String[] args) {`);
          hasMainMethod = true;
        } else {
          translated.push(currentIndent + `public void ${methodName}(${javaParams}) {`);
        }
        
        indentation++;
        continue;
      }
    }
    
    // Handle variable declarations
    if (trimmed.startsWith('let ') || trimmed.startsWith('const ') || trimmed.startsWith('var ')) {
      const varMatch = trimmed.match(/(let|const|var)\s+(\w+)(?:\s*=\s*(.+?))?;?$/);
      if (varMatch) {
        const [_, keyword, varName, value] = varMatch;
        
        if (value) {
          // Try to infer type from value
          let javaType = 'Object';
          if (value.match(/^\d+$/)) {
            javaType = 'int';
          } else if (value.match(/^\d+\.\d+$/)) {
            javaType = 'double';
          } else if (value === 'true' || value === 'false') {
            javaType = 'boolean';
          } else if (value.startsWith('"') || value.startsWith("'")) {
            javaType = 'String';
          } else if (value.startsWith('[') || value.includes('new Array')) {
            javaType = 'Object[]';
          }
          
          translated.push(currentIndent + `${javaType} ${varName} = ${value.replace(/'/g, '"')};`);
        } else {
          translated.push(currentIndent + `Object ${varName};`);
        }
        continue;
      }
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ') && trimmed.includes('(')) {
      const condition = trimmed.match(/if\s*\((.+?)\)/)[1];
      translated.push(currentIndent + `if (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle else if statements
    if (trimmed.startsWith('} else if ')) {
      indentation--;
      const condition = trimmed.match(/\}\s*else\s+if\s*\((.+?)\)/)[1];
      translated.push(currentIndent + `} else if (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle else statements
    if (trimmed === '} else {') {
      indentation--;
      translated.push(currentIndent + '} else {');
      indentation++;
      continue;
    }
    
    // Handle for loops
    if (trimmed.startsWith('for ')) {
      // for...of loop
      const forOfMatch = trimmed.match(/for\s*\(\s*(?:const|let|var)\s+(\w+)\s+of\s+(.+?)\s*\)/);
      if (forOfMatch) {
        const [_, varName, iterable] = forOfMatch;
        translated.push(currentIndent + `for (Object ${varName} : ${iterable}) {`);
      } else {
        // Traditional for loop
        const forMatch = trimmed.match(/for\s*\((.+?)\)/);
        if (forMatch) {
          let forContent = forMatch[1];
          // Convert let/const/var to proper Java declarations
          forContent = forContent.replace(/(let|const|var)\s+(\w+)/g, 'int $2');
          translated.push(currentIndent + `for (${forContent}) {`);
        }
      }
      indentation++;
      continue;
    }
    
    // Handle for...in loops
    if (trimmed.includes('for ') && trimmed.includes(' in ')) {
      const forInMatch = trimmed.match(/for\s*\(\s*(?:const|let|var)\s+(\w+)\s+in\s+(.+?)\s*\)/);
      if (forInMatch) {
        const [_, varName, object] = forInMatch;
        translated.push(currentIndent + `for (String ${varName} : ${object}.keySet()) {`);
        indentation++;
        continue;
      }
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
      indentation--;
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
    
    if (trimmed.startsWith('} catch ')) {
      indentation--;
      const catchMatch = trimmed.match(/\}\s*catch\s*\(\s*(\w+)\s*\)/);
      if (catchMatch) {
        const [_, varName] = catchMatch;
        translated.push(currentIndent + `} catch (Exception ${varName}) {`);
      } else {
        translated.push(currentIndent + '} catch (Exception e) {');
      }
      indentation++;
      continue;
    }
    
    if (trimmed === '} finally {') {
      indentation--;
      translated.push(currentIndent + '} finally {');
      indentation++;
      continue;
    }
    
    // Handle console.log to System.out.println
    if (trimmed.includes('console.log')) {
      const logMatch = trimmed.match(/console\.log\s*\((.+?)\)/);
      if (logMatch) {
        translated.push(currentIndent + `System.out.println(${logMatch[1]});`);
        continue;
      }
    }
    
    if (trimmed.includes('console.error')) {
      const errorMatch = trimmed.match(/console\.error\s*\((.+?)\)/);
      if (errorMatch) {
        translated.push(currentIndent + `System.err.println(${errorMatch[1]});`);
        continue;
      }
    }
    
    // Handle process.stdout.write
    if (trimmed.includes('process.stdout.write')) {
      const writeMatch = trimmed.match(/process\.stdout\.write\s*\((.+?)\)/);
      if (writeMatch) {
        translated.push(currentIndent + `System.out.print(${writeMatch[1]});`);
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
    
    // Handle array creation
    if (trimmed.includes('new Array(')) {
      const arrayMatch = trimmed.match(/(.+?)\s*=\s*new Array\((.+?)\)/);
      if (arrayMatch) {
        const [_, varName, size] = arrayMatch;
        translated.push(currentIndent + `Object[] ${varName.replace(/(let|const|var)\s+/, '')} = new Object[${size}];`);
        continue;
      }
    }
    
    // Handle array literals
    if (trimmed.includes('[') && trimmed.includes(']') && trimmed.includes('=')) {
      const arrayLiteralMatch = trimmed.match(/(.+?)\s*=\s*\[(.+?)\]/);
      if (arrayLiteralMatch) {
        const [_, varName, elements] = arrayLiteralMatch;
        const cleanVarName = varName.replace(/(let|const|var)\s+/, '');
        translated.push(currentIndent + `Object[] ${cleanVarName} = {${elements}};`);
        continue;
      }
    }
    
    // Handle .length property
    if (trimmed.includes('.length')) {
      translated.push(currentIndent + line.replace(/\.length/g, '.length'));
      continue;
    }
    
    // Handle opening braces on separate lines
    if (trimmed === '{') {
      indentation++;
      translated.push(currentIndent + '{');
      continue;
    }
    
    // Handle function expressions and arrow functions
    if (trimmed.includes('=>')) {
      // Simple arrow function to method conversion
      const arrowMatch = trimmed.match(/(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{?/);
      if (arrowMatch) {
        const [_, funcName, params] = arrowMatch;
        const javaParams = params.split(',').map(param => {
          const p = param.trim();
          return p ? `Object ${p}` : '';
        }).filter(p => p).join(', ');
        
        translated.push(currentIndent + `public void ${funcName}(${javaParams}) {`);
        indentation++;
        continue;
      }
    }
    
    // Generic line conversion - ensure semicolons and handle single quotes
    if (trimmed.length > 0) {
      let convertedLine = trimmed;
      
      // Convert single quotes to double quotes
      convertedLine = convertedLine.replace(/'/g, '"');
      
      // Add semicolon if missing and appropriate
      if (!convertedLine.endsWith(';') && !convertedLine.endsWith('{') && !convertedLine.endsWith('}') && !convertedLine.endsWith(':')) {
        if (!convertedLine.startsWith('//') && !convertedLine.startsWith('/*') && !convertedLine.startsWith('*')) {
          convertedLine += ';';
        }
      }
      
      translated.push(currentIndent + convertedLine);
    } else {
      translated.push(currentIndent + trimmed);
    }
  }
  
  // Add closing braces for any remaining indentation
  while (indentation > 0) {
    indentation--;
    translated.push(' '.repeat(indentation * 4) + '}');
  }
  
  // If we have a class but no main method, and there's executable code, wrap in main
  let finalCode = translated.join('\n');
  
  // Add basic class wrapper if no class was detected
  if (!insideClass && !hasMainMethod) {
    const codeLines = finalCode.split('\n').filter(line => line.trim());
    if (codeLines.length > 0) {
      const wrappedCode = [
        'public class Main {',
        '    public static void main(String[] args) {',
        ...translated.map(line => '        ' + line),
        '    }',
        '}'
      ];
      finalCode = wrappedCode.join('\n');
    }
  }
  
  return finalCode;
};