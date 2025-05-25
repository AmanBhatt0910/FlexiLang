/**
 * Java to JavaScript code translator
 * @param {string} code - Java code to be translated
 * @returns {string} - JavaScript equivalent code
 */
export const javaToJS = (code) => {
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let lastIndent = 0;
  let hasMain = false;
  let currentClass = null;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let currentIndent = ' '.repeat(indentation * 2); // JS typically uses 2-space indentation
    
    // Skip empty lines but preserve them
    if (trimmed === '') {
      translated.push('');
      continue;
    }
    
    // Calculate current indentation level
    const indent = line.search(/\S|$/);
    
    // Detect indentation changes (closing braces)
    if (i > 0 && indent < lastIndent && trimmed !== '}') {
      const indentDiff = Math.floor((lastIndent - indent) / 4);
      for (let j = 0; j < indentDiff; j++) {
        indentation--;
        translated.push(' '.repeat(indentation * 2) + '}');
      }
    }
    lastIndent = indent;
    
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
    
    // Handle package declarations (convert to comments)
    if (trimmed.startsWith('package ')) {
      translated.push(currentIndent + '// ' + trimmed);
      continue;
    }
    
    // Handle imports
    if (trimmed.startsWith('import ')) {
      const importMatch = trimmed.match(/import\s+(?:static\s+)?(.+?);/);
      if (importMatch) {
        const importPath = importMatch[1];
        
        // Map common Java imports to JavaScript equivalents or comments
        if (importPath.includes('java.util.Scanner')) {
          translated.push(currentIndent + '// Scanner functionality - use prompt() for browser or readline for Node.js');
        } else if (importPath.includes('java.util.ArrayList') || importPath.includes('java.util.List')) {
          translated.push(currentIndent + '// ArrayList equivalent: use Array with push(), pop(), etc.');
        } else if (importPath.includes('java.lang.Math')) {
          translated.push(currentIndent + '// Math functions available as Math.* in JavaScript');
        } else if (importPath.includes('java.lang.String')) {
          translated.push(currentIndent + '// String methods available on string primitives in JavaScript');
        } else {
          translated.push(currentIndent + '// ' + trimmed + ' - Manual conversion required');
        }
      }
      continue;
    }
    
    // Handle class declarations
    if (trimmed.startsWith('public class ') || trimmed.startsWith('class ')) {
      const classMatch = trimmed.match(/(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+?))?\s*\{?/);
      if (classMatch) {
        const [_, className, extendsClass] = classMatch;
        currentClass = className;
        
        if (extendsClass) {
          translated.push(currentIndent + `class ${className} extends ${extendsClass} {`);
        } else {
          translated.push(currentIndent + `class ${className} {`);
        }
        
        if (trimmed.endsWith('{')) {
          indentation++;
        }
        continue;
      }
    }
    
    // Handle method declarations
    if (trimmed.includes('(') && trimmed.includes(')') && (trimmed.includes('public') || trimmed.includes('private') || trimmed.includes('static'))) {
      // Main method special case
      if (trimmed.includes('public static void main')) {
        translated.push(currentIndent + '// Main method');
        translated.push(currentIndent + 'function main() {');
        hasMain = true;
        indentation++;
        continue;
      }
      
      // Regular method
      const methodMatch = trimmed.match(/(?:(public|private|protected)\s+)?(?:(static)\s+)?(?:\w+\s+)?(\w+)\s*\(([^)]*)\)\s*\{?/);
      if (methodMatch) {
        const [_, access, staticMod, methodName, params] = methodMatch;
        
        // Convert parameters (remove Java type declarations)
        const jsParams = params.split(',').map(param => {
          const parts = param.trim().split(/\s+/);
          if (parts.length >= 2) {
            return parts[parts.length - 1]; // Take the parameter name only
          }
          return param.trim();
        }).filter(p => p).join(', ');
        
        if (staticMod && currentClass) {
          translated.push(currentIndent + `static ${methodName}(${jsParams}) {`);
        } else if (currentClass) {
          translated.push(currentIndent + `${methodName}(${jsParams}) {`);
        } else {
          translated.push(currentIndent + `function ${methodName}(${jsParams}) {`);
        }
        
        indentation++;
        continue;
      }
    }
    
    // Handle variable declarations
    const varDeclMatch = trimmed.match(/^(?:final\s+)?(int|double|float|boolean|char|String|long|short|byte)\s+(\w+)(?:\s*=\s*(.+?))?;/);
    if (varDeclMatch) {
      const [_, type, varName, value] = varDeclMatch;
      
      if (value) {
        let jsValue = value;
        // Convert string literals and other values
        if (type === 'String' && !value.startsWith('"') && !value.startsWith("'")) {
          jsValue = `"${value}"`;
        }
        translated.push(currentIndent + `let ${varName} = ${jsValue};`);
      } else {
        translated.push(currentIndent + `let ${varName};`);
      }
      continue;
    }
    
    // Handle System.out.println and System.out.print
    if (trimmed.includes('System.out.println') || trimmed.includes('System.out.print')) {
      const printMatch = trimmed.match(/(System\.out\.print(?:ln)?)\s*\((.+?)\)\s*;/);
      if (printMatch) {
        const [_, method, content] = printMatch;
        
        // Handle string concatenation with +
        let formattedContent = content;
        if (content.includes('+')) {
          // JavaScript handles string concatenation naturally with +
          formattedContent = content;
        }
        
        translated.push(currentIndent + `console.log(${formattedContent});`);
        continue;
      }
    }
    
    // Handle Scanner input
    if (trimmed.includes('Scanner') && trimmed.includes('new Scanner')) {
      const scannerMatch = trimmed.match(/Scanner\s+(\w+)\s*=\s*new\s+Scanner\(System\.in\)\s*;/);
      if (scannerMatch) {
        const [_, varName] = scannerMatch;
        translated.push(currentIndent + `// Scanner ${varName} - use prompt() in browser or readline in Node.js`);
        continue;
      }
    }
    
    // Handle Scanner methods
    if (trimmed.includes('.nextInt()') || trimmed.includes('.nextDouble()') || trimmed.includes('.next()') || trimmed.includes('.nextLine()')) {
      if (trimmed.includes('.nextInt()')) {
        const intMatch = trimmed.match(/(\w+)\s*=\s*\w+\.nextInt\(\)\s*;/);
        if (intMatch) {
          const [_, varName] = intMatch;
          translated.push(currentIndent + `${varName} = parseInt(prompt("Enter an integer: "));`);
          continue;
        }
      }
      
      if (trimmed.includes('.nextDouble()')) {
        const doubleMatch = trimmed.match(/(\w+)\s*=\s*\w+\.nextDouble\(\)\s*;/);
        if (doubleMatch) {
          const [_, varName] = doubleMatch;
          translated.push(currentIndent + `${varName} = parseFloat(prompt("Enter a number: "));`);
          continue;
        }
      }
      
      if (trimmed.includes('.next()') || trimmed.includes('.nextLine()')) {
        const stringMatch = trimmed.match(/(\w+)\s*=\s*\w+\.next(?:Line)?\(\)\s*;/);
        if (stringMatch) {
          const [_, varName] = stringMatch;
          translated.push(currentIndent + `${varName} = prompt("Enter text: ");`);
          continue;
        }
      }
    }
    
    // Handle for loops
    if (trimmed.startsWith('for ')) {
      // Enhanced for loop (for-each)
      const forEachMatch = trimmed.match(/for\s*\(\s*(\w+)\s+(\w+)\s*:\s*(.+?)\s*\)\s*\{?/);
      if (forEachMatch) {
        const [_, type, varName, iterable] = forEachMatch;
        translated.push(currentIndent + `for (const ${varName} of ${iterable}) {`);
        indentation++;
        continue;
      }
      
      // Traditional for loop
      const forMatch = trimmed.match(/for\s*\((.+?)\)\s*\{?/);
      if (forMatch) {
        const [_, forContent] = forMatch;
        // Convert int i = 0 to let i = 0
        const convertedFor = forContent.replace(/\b(?:int|double|float)\s+(\w+)/g, 'let $1');
        translated.push(currentIndent + `for (${convertedFor}) {`);
        indentation++;
        continue;
      }
    }
    
    // Handle while loops
    if (trimmed.startsWith('while ')) {
      const whileMatch = trimmed.match(/while\s*\((.+?)\)\s*\{?/);
      if (whileMatch) {
        const [_, condition] = whileMatch;
        translated.push(currentIndent + `while (${condition}) {`);
        indentation++;
        continue;
      }
    }
    
    // Handle do-while loops
    if (trimmed.startsWith('do ') || trimmed === 'do') {
      translated.push(currentIndent + 'do {');
      indentation++;
      continue;
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ')) {
      const ifMatch = trimmed.match(/if\s*\((.+?)\)\s*\{?/);
      if (ifMatch) {
        const [_, condition] = ifMatch;
        translated.push(currentIndent + `if (${condition}) {`);
        indentation++;
        continue;
      }
    }
    
    // Handle else if statements
    if (trimmed.startsWith('else if ')) {
      const elseIfMatch = trimmed.match(/else\s+if\s*\((.+?)\)\s*\{?/);
      if (elseIfMatch) {
        const [_, condition] = elseIfMatch;
        translated.push(currentIndent + `else if (${condition}) {`);
        indentation++;
        continue;
      }
    }
    
    // Handle else statements
    if (trimmed === 'else {' || trimmed === 'else') {
      translated.push(currentIndent + 'else {');
      if (trimmed.endsWith('{')) {
        indentation++;
      }
      continue;
    }
    
    // Handle switch statements
    if (trimmed.startsWith('switch ')) {
      const switchMatch = trimmed.match(/switch\s*\((.+?)\)\s*\{?/);
      if (switchMatch) {
        const [_, expression] = switchMatch;
        translated.push(currentIndent + `switch (${expression}) {`);
        indentation++;
        continue;
      }
    }
    
    // Handle case statements
    if (trimmed.startsWith('case ')) {
      const caseMatch = trimmed.match(/case\s+(.+?):/);
      if (caseMatch) {
        const [_, value] = caseMatch;
        translated.push(currentIndent + `case ${value}:`);
        continue;
      }
    }
    
    // Handle default case
    if (trimmed === 'default:') {
      translated.push(currentIndent + 'default:');
      continue;
    }
    
    // Handle break statements
    if (trimmed === 'break;') {
      translated.push(currentIndent + 'break;');
      continue;
    }
    
    // Handle continue statements
    if (trimmed === 'continue;') {
      translated.push(currentIndent + 'continue;');
      continue;
    }
    
    // Handle return statements
    if (trimmed.startsWith('return ')) {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle array declarations
    const arrayMatch = trimmed.match(/(\w+)\[\]\s+(\w+)\s*=\s*new\s+\w+\[(.+?)\]\s*;/);
    if (arrayMatch) {
      const [_, type, varName, size] = arrayMatch;
      translated.push(currentIndent + `let ${varName} = new Array(${size});`);
      continue;
    }
    
    // Handle array initialization with values
    const arrayInitMatch = trimmed.match(/(\w+)\[\]\s+(\w+)\s*=\s*\{(.+?)\}\s*;/);
    if (arrayInitMatch) {
      const [_, type, varName, values] = arrayInitMatch;
      translated.push(currentIndent + `let ${varName} = [${values}];`);
      continue;
    }
    
    // Handle closing braces
    if (trimmed === '}') {
      indentation--;
      translated.push(' '.repeat(indentation * 2) + '}');
      continue;
    }
    
    // Handle try-catch blocks
    if (trimmed.startsWith('try ') || trimmed === 'try') {
      translated.push(currentIndent + 'try {');
      indentation++;
      continue;
    }
    
    if (trimmed.startsWith('catch ')) {
      const catchMatch = trimmed.match(/catch\s*\((.+?)\)\s*\{?/);
      if (catchMatch) {
        const [_, exception] = catchMatch;
        // Remove Java exception type, keep variable name
        const exceptionVar = exception.split(/\s+/).pop();
        translated.push(currentIndent + `catch (${exceptionVar}) {`);
        indentation++;
        continue;
      }
    }
    
    if (trimmed.startsWith('finally ') || trimmed === 'finally') {
      translated.push(currentIndent + 'finally {');
      indentation++;
      continue;
    }
    
    // Handle throw statements
    if (trimmed.startsWith('throw ')) {
      const throwMatch = trimmed.match(/throw\s+new\s+(\w+)\((.+?)\)\s*;/);
      if (throwMatch) {
        const [_, exceptionType, message] = throwMatch;
        translated.push(currentIndent + `throw new Error(${message});`);
        continue;
      }
      // Generic throw
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle generic assignments and expressions
    let modifiedLine = trimmed;
    
    // Convert .length() to .length
    modifiedLine = modifiedLine.replace(/\.length\(\)/g, '.length');
    
    // Convert .equals() to ===
    modifiedLine = modifiedLine.replace(/(\w+)\.equals\((.+?)\)/g, '$1 === $2');
    
    // Convert .charAt() to []
    modifiedLine = modifiedLine.replace(/(\w+)\.charAt\((.+?)\)/g, '$1[$2]');
    
    // Convert .substring() to .slice()
    modifiedLine = modifiedLine.replace(/\.substring\(/g, '.slice(');
    
    // Convert .indexOf() (already compatible)
    // Convert .toLowerCase() and .toUpperCase() (already compatible)
    
    // Convert System.exit() to process.exit() (Node.js) or comment for browser
    modifiedLine = modifiedLine.replace(/System\.exit\((.+?)\)/g, 'process.exit($1) // or return in browser');
    
    // Convert Integer.parseInt() to parseInt()
    modifiedLine = modifiedLine.replace(/Integer\.parseInt\(/g, 'parseInt(');
    
    // Convert Double.parseDouble() to parseFloat()
    modifiedLine = modifiedLine.replace(/Double\.parseDouble\(/g, 'parseFloat(');
    
    // Convert Math class methods (already mostly compatible)
    modifiedLine = modifiedLine.replace(/Math\.pow\(/g, 'Math.pow(');
    
    // Add the line
    translated.push(currentIndent + modifiedLine);
  }
  
  // Add closing braces for any remaining indentation
  while (indentation > 0) {
    indentation--;
    translated.push(' '.repeat(indentation * 2) + '}');
  }
  
  // Add main function call if main method was found
  if (hasMain) {
    translated.push('');
    translated.push('// Call main function');
    translated.push('main();');
  }
  
  return translated.join('\n');
};