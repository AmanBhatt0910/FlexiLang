/**
 * JavaScript to C code translator
 * Handles common syntax conversions between JavaScript and C
 * 
 * @param {string} code - JavaScript code to be translated
 * @returns {string} - C equivalent code
 */
export const jsToC = (code) => {
  // Handle multiline code by processing it line by line
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let inFunction = false;
  let inMain = false;
  let braceDepth = 0;
  
  // Track variable declarations and their types
  let variables = new Map();
  let functionDeclarations = [];
  let includes = new Set(['#include <stdio.h>', '#include <stdlib.h>', '#include <string.h>']);
  
  // Add standard includes at the beginning
  translated.push('#include <stdio.h>');
  translated.push('#include <stdlib.h>');
  translated.push('#include <string.h>');
  translated.push('#include <stdbool.h>');
  translated.push('');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let spaces = line.search(/\S|$/);
    let currentIndent = ' '.repeat(indentation * 4);
    
    // Skip empty lines but preserve them
    if (trimmed === '') {
      translated.push('');
      continue;
    }
    
    // Handle comments
    if (trimmed.startsWith('//')) {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle multiline comments
    if (trimmed.startsWith('/*')) {
      translated.push(currentIndent + trimmed);
      continue;
    }
    
    // Handle imports (convert to includes)
    if (trimmed.startsWith('import') || trimmed.includes('require(')) {
      let includeLine;
      
      // Try to map common JS modules to C headers
      if (trimmed.includes('fs') || trimmed.includes('file')) {
        includes.add('#include <sys/stat.h>');
        includes.add('#include <fcntl.h>');
        translated.push(currentIndent + '// File system operations');
      } else if (trimmed.includes('math')) {
        includes.add('#include <math.h>');
        translated.push(currentIndent + '// Math operations');
      } else if (trimmed.includes('time')) {
        includes.add('#include <time.h>');
        translated.push(currentIndent + '// Time operations');
      } else {
        // Generic import comment
        translated.push(currentIndent + '// TODO: Convert this import: ' + trimmed);
      }
      continue;
    }
    
    // Handle variable declarations
    if (/^(let|const|var)\s+/.test(trimmed)) {
      let cVar = trimmed
        .replace(/^(let|const|var)\s+/, '')
        .replace(/;$/, '');
      
      // Handle object destructuring (convert to struct access)
      if (cVar.includes('{') && cVar.includes('}')) {
        const matches = cVar.match(/\{(.+?)\}\s*=\s*(.+)/);
        if (matches) {
          const [_, vars, obj] = matches;
          const varList = vars.split(',').map(v => v.trim());
          varList.forEach(v => {
            translated.push(currentIndent + `// TODO: Extract ${v} from ${obj}`);
            translated.push(currentIndent + `auto ${v} = ${obj}.${v}; // Struct member access`);
          });
          continue;
        }
      }
      
      // Handle array destructuring
      if (cVar.includes('[') && cVar.includes(']') && cVar.includes('=')) {
        const matches = cVar.match(/\[(.+?)\]\s*=\s*(.+)/);
        if (matches) {
          const [_, vars, arr] = matches;
          const varList = vars.split(',').map(v => v.trim());
          for (let j = 0; j < varList.length; j++) {
            translated.push(currentIndent + `auto ${varList[j]} = ${arr}[${j}];`);
          }
          continue;
        }
      }
      
      // Determine variable type from assignment
      let cType = 'auto'; // Default to auto for type inference
      
      if (cVar.includes('=')) {
        const [varName, value] = cVar.split('=').map(s => s.trim());
        
        // Type inference based on value
        if (value.match(/^[\d]+$/)) {
          cType = 'int';
        } else if (value.match(/^[\d]*\.[\d]+$/)) {
          cType = 'double';
        } else if (value.match(/^["'].*["']$/)) {
          cType = 'char*';
        } else if (value === 'true' || value === 'false') {
          cType = 'bool';
        } else if (value.includes('[') && value.includes(']')) {
          cType = 'auto'; // Array, let compiler deduce
        }
        
        variables.set(varName, cType);
        translated.push(currentIndent + `${cType} ${varName} = ${value};`);
      } else {
        // Declaration without initialization
        translated.push(currentIndent + `auto ${cVar};`);
      }
      continue;
    }
    
    // Convert console.log() to printf()
    if (trimmed.includes('console.log(')) {
      let printStatement = trimmed.replace(/console\.log\((.*)\);?/, (match, args) => {
        // Handle multiple arguments
        const argsList = args.split(',').map(arg => arg.trim());
        
        // Simple string literal
        if (argsList.length === 1 && argsList[0].match(/^["'].*["']$/)) {
          return `printf(${argsList[0]} "\\n");`;
        }
        
        // Multiple arguments - create format string
        let formatStr = '';
        let printArgs = [];
        
        argsList.forEach(arg => {
          if (arg.match(/^["'].*["']$/)) {
            formatStr += '%s';
            printArgs.push(arg);
          } else if (arg.match(/^[\d]+$/)) {
            formatStr += '%d';
            printArgs.push(arg);
          } else if (arg.match(/^[\d]*\.[\d]+$/)) {
            formatStr += '%.2f';
            printArgs.push(arg);
          } else {
            formatStr += '%s';
            printArgs.push(`/* ${arg} */`);
          }
          formatStr += ' ';
        });
        
        formatStr = formatStr.trim() + '\\n';
        return `printf("${formatStr}"${printArgs.length > 0 ? ', ' + printArgs.join(', ') : ''});`;
      });
      
      translated.push(currentIndent + printStatement);
      continue;
    }
    
    // Convert string methods
    if (trimmed.includes('.indexOf(')) {
      trimmed = trimmed.replace(/(\w+)\.indexOf\((.*?)\)/g, 'strstr($1, $2)');
    }
    
    if (trimmed.includes('.length')) {
      trimmed = trimmed.replace(/(\w+)\.length/g, 'strlen($1)');
    }
    
    if (trimmed.includes('.substring(')) {
      trimmed = trimmed.replace(/(\w+)\.substring\((.*?)\)/g, '/* TODO: substring($1, $2) */');
    }
    
    // Convert array methods
    if (trimmed.includes('.push(')) {
      translated.push(currentIndent + '// TODO: Implement dynamic array push operation');
      trimmed = trimmed.replace(/(\w+)\.push\((.*?)\)/g, '/* array_push($1, $2) */');
    }
    
    if (trimmed.includes('.pop()')) {
      trimmed = trimmed.replace(/(\w+)\.pop\(\)/g, '/* array_pop($1) */');
    }
    
    // Convert for loops
    const forLoopMatch = trimmed.match(/for\s*\(\s*(let|var|const)?\s*(\w+)\s*=\s*(\d+)\s*;\s*\2\s*(<|<=|>|>=)\s*([^;]+)\s*;\s*\2(\+\+|\-\-|[\+\-]=\s*\d+)\s*\)/);
    if (forLoopMatch) {
      const [_, declType, varName, start, comparison, end, increment] = forLoopMatch;
      
      let cIncrement;
      if (increment === '++') {
        cIncrement = `${varName}++`;
      } else if (increment === '--') {
        cIncrement = `${varName}--`;
      } else if (increment.includes('+=')) {
        const step = increment.split('+=')[1].trim();
        cIncrement = `${varName} += ${step}`;
      } else if (increment.includes('-=')) {
        const step = increment.split('-=')[1].trim();
        cIncrement = `${varName} -= ${step}`;
      }
      
      // Generate C for loop
      translated.push(currentIndent + `for (int ${varName} = ${start}; ${varName} ${comparison} ${end}; ${cIncrement}) {`);
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Convert for...of loops (convert to traditional for loop)
    const forOfMatch = trimmed.match(/for\s*\(\s*(let|var|const)?\s*(\w+)\s+of\s+([^\)]+)\s*\)/);
    if (forOfMatch) {
      const [_, declType, varName, iterable] = forOfMatch;
      translated.push(currentIndent + `// for...of converted to traditional for loop`);
      translated.push(currentIndent + `for (int i = 0; i < sizeof(${iterable})/sizeof(${iterable}[0]); i++) {`);
      translated.push(currentIndent + `    auto ${varName} = ${iterable}[i];`);
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Convert for...in loops (convert to iteration over keys)
    const forInMatch = trimmed.match(/for\s*\(\s*(let|var|const)?\s*(\w+)\s+in\s+([^\)]+)\s*\)/);
    if (forInMatch) {
      const [_, declType, varName, obj] = forInMatch;
      translated.push(currentIndent + `// TODO: Implement object key iteration`);
      translated.push(currentIndent + `/* for (${varName} in ${obj}) */ {`);
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Convert if conditions
    const ifMatch = trimmed.match(/if\s*\((.*)\)\s*\{?/);
    if (ifMatch) {
      const condition = ifMatch[1]
        .replace(/===|==/g, '==')
        .replace(/!==/g, '!=')
        .replace(/&&/g, ' && ')
        .replace(/\|\|/g, ' || ')
        .replace(/!/g, '!');
      
      translated.push(currentIndent + `if (${condition}) {`);
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Convert else if
    const elseIfMatch = trimmed.match(/}\s*else\s+if\s*\((.*)\)\s*\{?/) || trimmed.match(/else\s+if\s*\((.*)\)\s*\{?/);
    if (elseIfMatch) {
      const condition = elseIfMatch[1]
        .replace(/===|==/g, '==')
        .replace(/!==/g, '!=')
        .replace(/&&/g, ' && ')
        .replace(/\|\|/g, ' || ')
        .replace(/!/g, '!');
      
      // Close previous block if needed
      if (trimmed.startsWith('}')) {
        indentation--;
        braceDepth--;
        translated.push(currentIndent + `} else if (${condition}) {`);
      } else {
        translated.push(currentIndent + `else if (${condition}) {`);
      }
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Convert else
    if (trimmed.match(/}\s*else\s*\{?/) || trimmed === 'else {' || trimmed === 'else') {
      if (trimmed.startsWith('}')) {
        indentation--;
        braceDepth--;
        translated.push(currentIndent + '} else {');
      } else {
        translated.push(currentIndent + 'else {');
      }
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Handle function definitions
    const funcMatch = trimmed.match(/function\s+(\w+)\s*\((.*?)\)\s*\{?/) || 
                    trimmed.match(/(?:const|let|var)?\s*(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>\s*\{?/) ||
                    trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\((.*?)\)\s*\{?/);
    
    if (funcMatch) {
      const [_, name, params] = funcMatch;
      const paramsList = params.split(',').map(p => p.trim()).filter(p => p !== '');
      
      // Handle default parameters (C doesn't support them directly)
      const cParams = paramsList.map(p => {
        const defaultMatch = p.match(/(\w+)\s*=\s*(.*)/);
        if (defaultMatch) {
          translated.push(currentIndent + `// TODO: Handle default parameter: ${p}`);
          return `auto ${defaultMatch[1]} /* default: ${defaultMatch[2]} */`;
        }
        return `auto ${p}`;
      }).join(', ');
      
      // Store function declaration for later
      functionDeclarations.push(`auto ${name}(${cParams});`);
      
      if (name === 'main') {
        translated.push(currentIndent + `int main(${cParams.length > 0 ? cParams : 'void'}) {`);
        inMain = true;
      } else {
        translated.push(currentIndent + `auto ${name}(${cParams}) {`);
      }
      
      indentation++;
      braceDepth++;
      inFunction = true;
      continue;
    }
    
    // Handle arrow functions with implicit return
    const arrowFuncImplicitMatch = trimmed.match(/(?:const|let|var)?\s*(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>\s*([^{].*)/);
    if (arrowFuncImplicitMatch) {
      const [_, name, params, body] = arrowFuncImplicitMatch;
      const paramsList = params.split(',').map(p => p.trim()).filter(p => p !== '');
      const cParams = paramsList.map(p => `auto ${p}`).join(', ');
      
      translated.push(currentIndent + `auto ${name}(${cParams}) {`);
      translated.push(currentIndent + '    return ' + body.replace(/;$/, '') + ';');
      translated.push(currentIndent + '}');
      continue;
    }
    
    // Handle class definitions (convert to struct)
    const classMatch = trimmed.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?/);
    if (classMatch) {
      const [_, name, parent] = classMatch;
      
      if (parent) {
        translated.push(currentIndent + `struct ${name} : public ${parent} {`);
      } else {
        translated.push(currentIndent + `struct ${name} {`);
      }
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Handle class methods (convert to struct methods)
    const classMethodMatch = trimmed.match(/(\w+)\s*\((.*?)\)\s*\{?/);
    if (classMethodMatch && !trimmed.includes('=') && braceDepth > 0) {
      const [_, name, params] = classMethodMatch;
      const paramsList = params.split(',').map(p => p.trim()).filter(p => p !== '');
      const cParams = paramsList.map(p => `auto ${p}`).join(', ');
      
      if (name === 'constructor') {
        translated.push(currentIndent + `${name}(${cParams}) {`);
      } else {
        translated.push(currentIndent + `auto ${name}(${cParams}) {`);
      }
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Handle this.x (convert to member access)
    if (trimmed.includes('this.')) {
      trimmed = trimmed.replace(/this\./g, 'this->');
    }
    
    // Handle returns
    if (trimmed.startsWith('return ')) {
      let returnValue = trimmed.substring(7).replace(/;$/, '');
      translated.push(currentIndent + `return ${returnValue};`);
      continue;
    }
    
    // Handle export statements
    if (trimmed.startsWith('export ')) {
      if (trimmed.includes('export default')) {
        // Skip export default, handle in main or as comment
        translated.push(currentIndent + '// TODO: Handle export default');
        continue;
      }
      
      // Otherwise just skip the export keyword
      translated.push(currentIndent + trimmed.replace(/export\s+/, '').replace(/;$/, ';'));
      continue;
    }
    
    // Handle closing braces
    if (trimmed === '}' || trimmed === '});' || trimmed === '})' || trimmed === '};') {
      if (indentation > 0) {
        indentation--;
        braceDepth--;
      }
      translated.push(currentIndent + '}');
      continue;
    }
    
    // Handle try/catch
    if (trimmed === 'try {') {
      translated.push(currentIndent + 'try {');
      indentation++;
      braceDepth++;
      continue;
    }
    
    if (trimmed.startsWith('catch')) {
      const errorVar = trimmed.match(/catch\s*\((\w+)\)/) ? 
        trimmed.match(/catch\s*\((\w+)\)/)[1] : 
        'e';
      translated.push(currentIndent + `catch (const std::exception& ${errorVar}) {`);
      indentation++;
      braceDepth++;
      continue;
    }
    
    if (trimmed === 'finally {') {
      translated.push(currentIndent + '// TODO: C++ doesn\'t have finally, use RAII instead');
      translated.push(currentIndent + '{');
      indentation++;
      braceDepth++;
      continue;
    }
    
    // Handle throw
    if (trimmed.startsWith('throw ')) {
      translated.push(currentIndent + 'throw ' + trimmed.substring(6).replace(/;$/, '') + ';');
      continue;
    }
    
    // Handle switch statements
    if (trimmed.startsWith('switch')) {
      const switchVar = trimmed.match(/switch\s*\((.+?)\)/)[1];
      translated.push(currentIndent + `switch (${switchVar}) {`);
      indentation++;
      braceDepth++;
      continue;
    }
    
    if (trimmed.startsWith('case ')) {
      const caseValue = trimmed.match(/case\s+(.+?):/)[1];
      translated.push(currentIndent + `case ${caseValue}:`);
      continue;
    }
    
    if (trimmed === 'default:') {
      translated.push(currentIndent + 'default:');
      continue;
    }
    
    if (trimmed === 'break;' || trimmed === 'break') {
      translated.push(currentIndent + 'break;');
      continue;
    }
    
    // Handle ternary operators
    const ternaryMatch = trimmed.match(/(.+?)\s*\?\s*(.+?)\s*:\s*(.+)/);
    if (ternaryMatch && !trimmed.startsWith('case') && !trimmed.includes('default:')) {
      const [_, condition, ifTrue, ifFalse] = ternaryMatch;
      translated.push(currentIndent + `(${condition}) ? ${ifTrue.replace(/;$/, '')} : ${ifFalse.replace(/;$/, '')};`);
      continue;
    }
    
    // Generic line conversion - ensure semicolon at the end
    let cLine = trimmed;
    
    // Add semicolon if not present and not a control structure
    if (!cLine.endsWith(';') && 
        !cLine.endsWith('{') && 
        !cLine.endsWith('}') && 
        !cLine.includes('if (') && 
        !cLine.includes('for (') && 
        !cLine.includes('while (') && 
        !cLine.includes('case ') && 
        !cLine.includes('default:') &&
        !cLine.startsWith('//') &&
        !cLine.startsWith('/*') &&
        cLine !== '') {
      cLine += ';';
    }
    
    translated.push(currentIndent + cLine);
  }
  
  // Add main function if not present
  if (!inMain && !code.includes('function main') && !code.includes('main(')) {
    translated.push('\nint main() {');
    translated.push('    // TODO: Add main function implementation');
    translated.push('    return 0;');
    translated.push('}');
  } else if (inMain) {
    // Ensure main returns int
    if (!translated.some(line => line.includes('return'))) {
      translated.push('    return 0;');
    }
  }
  
  return translated.join('\n');
};