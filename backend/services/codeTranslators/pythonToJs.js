/**
 * Python to JavaScript code translator
 * @param {string} code - Python code to be translated
 * @returns {string} - JavaScript equivalent code
 */
export const pythonToJs = (code) => {
  // Basic implementation to be enhanced later
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let lastIndent = 0;
  
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
    
    // Detect indentation changes
    if (i > 0 && indent < lastIndent) {
      // Closing blocks
      const indentDiff = Math.floor((lastIndent - indent) / 4);
      for (let j = 0; j < indentDiff; j++) {
        indentation--;
        translated.push(' '.repeat(indentation * 2) + '}');
      }
    }
    lastIndent = indent;
    
    // Handle comments
    if (trimmed.startsWith('#')) {
      translated.push(currentIndent + trimmed.replace('#', '//'));
      continue;
    }
    
    // Handle imports
    if (trimmed.startsWith('import ')) {
      if (trimmed.includes(' as ')) {
        const matches = trimmed.match(/import\s+(.+?)\s+as\s+(.+)/);
        if (matches) {
          const [_, module, alias] = matches;
          translated.push(currentIndent + `import ${alias} from '${module}';`);
        }
      } else {
        const module = trimmed.replace('import ', '');
        translated.push(currentIndent + `import ${module} from '${module}';`);
      }
      continue;
    }
    
    if (trimmed.startsWith('from ')) {
      const matches = trimmed.match(/from\s+(.+?)\s+import\s+(.+)/);
      if (matches) {
        const [_, module, imports] = matches;
        if (imports === '*') {
          translated.push(currentIndent + `import * as ${module.split('.').pop()} from '${module}';`);
        } else {
          translated.push(currentIndent + `import { ${imports} } from '${module}';`);
        }
      }
      continue;
    }
    
    // Handle function definitions
    if (trimmed.startsWith('def ')) {
      const matches = trimmed.match(/def\s+(\w+)\s*\((.*?)\)\s*:/);
      if (matches) {
        const [_, name, params] = matches;
        // Handle self parameter for class methods
        const jsParams = params.startsWith('self') ? 
          params.replace('self', '').replace(/^\s*,\s*/, '') : 
          params;
        
        translated.push(currentIndent + `function ${name}(${jsParams}) {`);
        indentation++;
        continue;
      }
    }
    
    // Handle class definitions
    if (trimmed.startsWith('class ')) {
      const matches = trimmed.match(/class\s+(\w+)(?:\((.+?)\))?:/);
      if (matches) {
        const [_, name, parent] = matches;
        if (parent && parent !== 'object') {
          translated.push(currentIndent + `class ${name} extends ${parent} {`);
        } else {
          translated.push(currentIndent + `class ${name} {`);
        }
        indentation++;
        continue;
      }
    }
    
    // Handle constructor
    if (trimmed.startsWith('def __init__')) {
      const matches = trimmed.match(/def\s+__init__\s*\((.+?)\)\s*:/);
      if (matches) {
        const [_, params] = matches;
        const jsParams = params.replace('self', '').replace(/^\s*,\s*/, '');
        translated.push(currentIndent + `constructor(${jsParams}) {`);
        indentation++;
        continue;
      }
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ')) {
      const condition = trimmed.replace(/if\s+(.+?):/, '$1')
        .replace(/ and /g, ' && ')
        .replace(/ or /g, ' || ')
        .replace(/ not /g, ' !');
      
      translated.push(currentIndent + `if (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle elif statements
    if (trimmed.startsWith('elif ')) {
      const condition = trimmed.replace(/elif\s+(.+?):/, '$1')
        .replace(/ and /g, ' && ')
        .replace(/ or /g, ' || ')
        .replace(/ not /g, ' !');
      
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
        
        if (args.length === 1) {
          // range(end)
          translated.push(currentIndent + `for (let ${varName} = 0; ${varName} < ${args[0]}; ${varName}++) {`);
        } else if (args.length === 2) {
          // range(start, end)
          translated.push(currentIndent + `for (let ${varName} = ${args[0]}; ${varName} < ${args[1]}; ${varName}++) {`);
        } else if (args.length === 3) {
          // range(start, end, step)
          const stepOp = parseInt(args[2]) > 0 ? '<' : '>';
          const incOp = parseInt(args[2]) > 0 ? '+=' : '-=';
          translated.push(currentIndent + `for (let ${varName} = ${args[0]}; ${varName} ${stepOp} ${args[1]}; ${varName} ${incOp} Math.abs(${args[2]})) {`);
        }
      } else {
        // Handle iteration-based for loops
        const iterMatch = trimmed.match(/for\s+(\w+)\s+in\s+(.+?):/);
        if (iterMatch) {
          const [_, varName, iterable] = iterMatch;
          translated.push(currentIndent + `for (const ${varName} of ${iterable}) {`);
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
        .replace(/ not /g, ' !');
      
      translated.push(currentIndent + `while (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle print to console.log
    if (trimmed.startsWith('print(')) {
      translated.push(currentIndent + trimmed.replace(/print\((.*)\)/, 'console.log($1);'));
      continue;
    }
    
    // Handle return statements
    if (trimmed.startsWith('return ')) {
      translated.push(currentIndent + trimmed + ';');
      continue;
    }
    
    // Handle list comprehensions (basic support)
    const listCompMatch = trimmed.match(/(\w+)\s*=\s*\[(.*?)\s+for\s+(\w+)\s+in\s+(.+?)(?:\s+if\s+(.+?))?\]/);
    if (listCompMatch) {
      const [_, varName, expr, iterVar, iterable, condition] = listCompMatch;
      if (condition) {
        translated.push(currentIndent + `const ${varName} = ${iterable}.filter(${iterVar} => ${condition.replace(/ and /g, ' && ').replace(/ or /g, ' || ')}).map(${iterVar} => ${expr});`);
      } else {
        translated.push(currentIndent + `const ${varName} = ${iterable}.map(${iterVar} => ${expr});`);
      }
      continue;
    }
    
    // Handle try/except
    if (trimmed === 'try:') {
      translated.push(currentIndent + 'try {');
      indentation++;
      continue;
    }
    
    if (trimmed.startsWith('except ')) {
      const matches = trimmed.match(/except(?:\s+(\w+))?(?:\s+as\s+(\w+))?:/);
      if (matches) {
        const [_, exceptionType, varName] = matches;
        if (varName) {
          translated.push(currentIndent + `} catch (${varName}) {`);
        } else {
          translated.push(currentIndent + '} catch (e) {');
        }
      } else {
        translated.push(currentIndent + '} catch (e) {');
      }
      indentation++;
      continue;
    }
    
    if (trimmed === 'finally:') {
      translated.push(currentIndent + '} finally {');
      indentation++;
      continue;
    }
    
    // Handle dictionaries
    const dictMatch = trimmed.match(/(\w+)\s*=\s*\{(.+?)\}/);
    if (dictMatch) {
      translated.push(currentIndent + `const ${dictMatch[1]} = {${dictMatch[2]}};`);
      continue;
    }
    
    // Handle list/array creation
    const listMatch = trimmed.match(/(\w+)\s*=\s*\[(.+?)\]/);
    if (listMatch) {
      translated.push(currentIndent + `const ${listMatch[1]} = [${listMatch[2]}];`);
      continue;
    }
    
    // Handle variable assignment
    const assignMatch = trimmed.match(/(\w+)\s*=\s*(.+)/);
    if (assignMatch && !trimmed.includes('def ') && !trimmed.includes('class ')) {
      translated.push(currentIndent + `let ${assignMatch[1]} = ${assignMatch[2]};`);
      continue;
    }
    
    // Handle Python's len() to JavaScript's .length
    if (trimmed.includes('len(')) {
      let modifiedLine = trimmed.replace(/len\(([^)]+)\)/g, '$1.length');
      translated.push(currentIndent + modifiedLine + ';');
      continue;
    }
    
    // Generic line conversion - add semicolons to the end
    if (trimmed.length > 0 && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
      translated.push(currentIndent + trimmed + ';');
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
}