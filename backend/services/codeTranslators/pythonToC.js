/**
 * Python to C code translator
 * @param {string} code - Python code to be translated
 * @returns {string} - C equivalent code
 */
export const pythonToC = (code) => {
  // Basic implementation to be enhanced later
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let lastIndent = 0;
  let inFunction = false;
  let hasMainFunction = false;
  let declaredVars = new Set();
  let functionDeclarations = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let currentIndent = ' '.repeat(indentation * 4);
    
    // Skip empty lines but preserve them
    if (trimmed === '') {
      translated.push('');
      continue;
    }
    
    // Calculate current indentation level
    const indent = line.search(/\S|$/);
    
    // Detect indentation changes
    if (i > 0 && indent < lastIndent) {
      // Closing blocks
      const indentDiff = Math.floor((lastIndent - indent) / 4);
      for (let j = 0; j < indentDiff; j++) {
        indentation--;
        translated.push(' '.repeat(indentation * 4) + '}');
      }
    }
    lastIndent = indent;
    
    // Handle comments
    if (trimmed.startsWith('#')) {
      translated.push(currentIndent + trimmed.replace('#', '//'));
      continue;
    }
    
    // Handle imports (convert to C includes)
    if (trimmed.startsWith('import ')) {
      const module = trimmed.replace('import ', '').trim();
      if (module === 'math') {
        translated.push('#include <math.h>');
      } else if (module === 'sys') {
        translated.push('#include <stdlib.h>');
      } else if (module === 'os') {
        translated.push('#include <unistd.h>');
      } else if (module.includes('random')) {
        translated.push('#include <stdlib.h>');
        translated.push('#include <time.h>');
      } else {
        translated.push(`// import ${module} - no direct C equivalent`);
      }
      continue;
    }
    
    if (trimmed.startsWith('from ')) {
      const matches = trimmed.match(/from\s+(.+?)\s+import\s+(.+)/);
      if (matches) {
        const [_, module, imports] = matches;
        if (module === 'math') {
          translated.push('#include <math.h>');
        } else {
          translated.push(`// from ${module} import ${imports} - no direct C equivalent`);
        }
      }
      continue;
    }
    
    // Handle function definitions
    if (trimmed.startsWith('def ')) {
      const matches = trimmed.match(/def\s+(\w+)\s*\((.*?)\)\s*:/);
      if (matches) {
        const [_, name, params] = matches;
        inFunction = true;
        
        // Check if this is a main function
        if (name === 'main') {
          hasMainFunction = true;
          if (params.trim() === '') {
            translated.push(currentIndent + `int main() {`);
          } else {
            translated.push(currentIndent + `int main(int argc, char *argv[]) {`);
          }
        } else {
          // Convert Python parameters to C (basic type inference)
          const convertedParams = params.split(',').map(param => {
            const trimmedParam = param.trim();
            if (trimmedParam === '') return '';
            // Default to int for simplicity - could be enhanced with type hints
            return `int ${trimmedParam}`;
          }).filter(p => p !== '').join(', ');
          
          // Default return type to int - could be enhanced
          const functionSig = `int ${name}(${convertedParams})`;
          functionDeclarations.push(functionSig + ';');
          translated.push(currentIndent + functionSig + ' {');
        }
        indentation++;
        continue;
      }
    }
    
    // Handle class definitions (convert to structs)
    if (trimmed.startsWith('class ')) {
      const matches = trimmed.match(/class\s+(\w+)(?:\((.+?)\))?:/);
      if (matches) {
        const [_, name] = matches;
        translated.push(currentIndent + `typedef struct {`);
        translated.push(currentIndent + `    // Add struct members here`);
        translated.push(currentIndent + `} ${name};`);
        translated.push('');
        continue;
      }
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ')) {
      const condition = trimmed.replace(/if\s+(.+?):/, '$1')
        .replace(/ and /g, ' && ')
        .replace(/ or /g, ' || ')
        .replace(/ not /g, ' !')
        .replace(/ is /g, ' == ')
        .replace(/ is not /g, ' != ')
        .replace(/True/g, '1')
        .replace(/False/g, '0');
      
      translated.push(currentIndent + `if (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle elif statements
    if (trimmed.startsWith('elif ')) {
      const condition = trimmed.replace(/elif\s+(.+?):/, '$1')
        .replace(/ and /g, ' && ')
        .replace(/ or /g, ' || ')
        .replace(/ not /g, ' !')
        .replace(/ is /g, ' == ')
        .replace(/ is not /g, ' != ')
        .replace(/True/g, '1')
        .replace(/False/g, '0');
      
      translated.push(currentIndent + `} else if (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle else statements
    if (trimmed === 'else:') {
      translated.push(currentIndent + '} else {');
      indentation++;
      continue;
    }
    
    // Handle for loops
    if (trimmed.startsWith('for ')) {
      // Handle range-based for loops
      const rangeMatch = trimmed.match(/for\s+(\w+)\s+in\s+range\((.+?)\):/);
      if (rangeMatch) {
        const [_, varName, rangeArgs] = rangeMatch;
        const args = rangeArgs.split(',').map(arg => arg.trim());
        
        if (!declaredVars.has(varName)) {
          translated.push(currentIndent + `int ${varName};`);
          declaredVars.add(varName);
        }
        
        if (args.length === 1) {
          // range(end)
          translated.push(currentIndent + `for (${varName} = 0; ${varName} < ${args[0]}; ${varName}++) {`);
        } else if (args.length === 2) {
          // range(start, end)
          translated.push(currentIndent + `for (${varName} = ${args[0]}; ${varName} < ${args[1]}; ${varName}++) {`);
        } else if (args.length === 3) {
          // range(start, end, step)
          const stepOp = parseInt(args[2]) > 0 ? '<' : '>';
          const stepVal = Math.abs(parseInt(args[2]));
          translated.push(currentIndent + `for (${varName} = ${args[0]}; ${varName} ${stepOp} ${args[1]}; ${varName} += ${args[2]}) {`);
        }
      } else {
        // Handle iteration over arrays (basic implementation)
        const iterMatch = trimmed.match(/for\s+(\w+)\s+in\s+(.+?):/);
        if (iterMatch) {
          const [_, varName, iterable] = iterMatch;
          translated.push(currentIndent + `// for ${varName} in ${iterable} - manual iteration needed`);
          translated.push(currentIndent + `{`);
        }
      }
      indentation++;
      continue;
    }
    
    // Handle while loops
    if (trimmed.startsWith('while ')) {
      const condition = trimmed.replace(/while\s+(.+?):/, '$1')
        .replace(/ and /g, ' && ')
        .replace(/ or /g, ' || ')
        .replace(/ not /g, ' !')
        .replace(/ is /g, ' == ')
        .replace(/ is not /g, ' != ')
        .replace(/True/g, '1')
        .replace(/False/g, '0');
      
      translated.push(currentIndent + `while (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle print to printf
    if (trimmed.startsWith('print(')) {
      const content = trimmed.match(/print\((.*)\)/)?.[1] || '';
      if (content.startsWith('"') || content.startsWith("'")) {
        // String literal
        const cleanContent = content.replace(/^['"]|['"]$/g, '');
        translated.push(currentIndent + `printf("${cleanContent}\\n");`);
      } else {
        // Variable or expression - assume integer for simplicity
        translated.push(currentIndent + `printf("%d\\n", ${content});`);
      }
      continue;
    }
    
    // Handle return statements
    if (trimmed.startsWith('return ')) {
      const returnValue = trimmed.replace('return ', '');
      if (returnValue === 'True') {
        translated.push(currentIndent + 'return 1;');
      } else if (returnValue === 'False') {
        translated.push(currentIndent + 'return 0;');
      } else if (returnValue === 'None' || returnValue === '') {
        translated.push(currentIndent + 'return;');
      } else {
        translated.push(currentIndent + `return ${returnValue};`);
      }
      continue;
    }
    
    // Handle list/array creation
    const listMatch = trimmed.match(/(\w+)\s*=\s*\[(.+?)\]/);
    if (listMatch) {
      const [_, varName, content] = listMatch;
      const elements = content.split(',').map(e => e.trim());
      const arraySize = elements.length;
      
      translated.push(currentIndent + `int ${varName}[${arraySize}] = {${content}};`);
      declaredVars.add(varName);
      continue;
    }
    
    // Handle variable assignment
    const assignMatch = trimmed.match(/(\w+)\s*=\s*(.+)/);
    if (assignMatch && !trimmed.includes('def ') && !trimmed.includes('class ')) {
      const [_, varName, value] = assignMatch;
      
      if (!declaredVars.has(varName)) {
        // Basic type inference
        if (value.match(/^\d+$/)) {
          translated.push(currentIndent + `int ${varName} = ${value};`);
        } else if (value.match(/^\d+\.\d+$/)) {
          translated.push(currentIndent + `double ${varName} = ${value};`);
        } else if (value.match(/^["'].*["']$/)) {
          const stringContent = value.replace(/^['"]|['"]$/g, '');
          translated.push(currentIndent + `char ${varName}[] = "${stringContent}";`);
        } else if (value === 'True') {
          translated.push(currentIndent + `int ${varName} = 1;`);
        } else if (value === 'False') {
          translated.push(currentIndent + `int ${varName} = 0;`);
        } else if (value === 'None') {
          translated.push(currentIndent + `void *${varName} = NULL;`);
        } else {
          translated.push(currentIndent + `int ${varName} = ${value};`);
        }
        declaredVars.add(varName);
      } else {
        // Variable already declared, just assign
        let cValue = value;
        if (value === 'True') cValue = '1';
        else if (value === 'False') cValue = '0';
        else if (value === 'None') cValue = 'NULL';
        
        translated.push(currentIndent + `${varName} = ${cValue};`);
      }
      continue;
    }
    
    // Handle Python's len() to C array size (basic implementation)
    if (trimmed.includes('len(')) {
      let modifiedLine = trimmed.replace(/len\(([^)]+)\)/g, 'sizeof($1)/sizeof($1[0])');
      translated.push(currentIndent + modifiedLine + ';');
      continue;
    }
    
    // Handle try/except (convert to basic error handling)
    if (trimmed === 'try:') {
      translated.push(currentIndent + '// try block - manual error handling needed');
      translated.push(currentIndent + '{');
      indentation++;
      continue;
    }
    
    if (trimmed.startsWith('except ')) {
      translated.push(currentIndent + '// except block - manual error handling needed');
      indentation++;
      continue;
    }
    
    // Handle Python boolean values and None
    let modifiedLine = trimmed
      .replace(/True/g, '1')
      .replace(/False/g, '0')
      .replace(/None/g, 'NULL');
    
    // Generic line conversion - add semicolons to the end
    if (modifiedLine.length > 0 && !modifiedLine.endsWith(';') && !modifiedLine.endsWith('{') && !modifiedLine.endsWith('}')) {
      translated.push(currentIndent + modifiedLine + ';');
    } else {
      translated.push(currentIndent + modifiedLine);
    }
  }
  
  // Add closing braces for any remaining indentation
  while (indentation > 0) {
    indentation--;
    translated.push(' '.repeat(indentation * 4) + '}');
  }
  
  // Build the complete C program
  const includes = [
    '#include <stdio.h>',
    '#include <stdlib.h>',
    '#include <string.h>'
  ];
  
  // Add additional includes if needed
  const needsMath = translated.some(line => line.includes('math.h'));
  if (needsMath && !includes.includes('#include <math.h>')) {
    includes.push('#include <math.h>');
  }
  
  const result = [];
  
  // Add includes
  result.push(...includes);
  result.push('');
  
  // Add function declarations if any
  if (functionDeclarations.length > 0) {
    result.push(...functionDeclarations);
    result.push('');
  }
  
  // Add the translated code
  result.push(...translated);
  
  // If no main function was found, wrap the code in main
  if (!hasMainFunction && translated.length > 0) {
    const mainWrapper = [
      'int main() {',
      ...translated.map(line => '    ' + line),
      '    return 0;',
      '}'
    ];
    return [...includes, '', ...mainWrapper].join('\n');
  }
  
  return result.join('\n');
};