/**
 * JavaScript to Python code translator
 * Handles common syntax conversions between JavaScript and Python
 * 
 * @param {string} code - JavaScript code to be translated
 * @returns {string} - Python equivalent code
 */
export const jsToPython = (code) => {
  // Handle multiline code by processing it line by line
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let inFunction = false;
  let inClass = false;
  let inLoop = false;
  
  // Track for loops to handle range conversion
  let forLoopVars = {};
  
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
      translated.push(currentIndent + trimmed.replace('//', '#'));
      continue;
    }
    
    // Handle multiline comments
    if (trimmed.startsWith('/*')) {
      let commentText = trimmed.replace('/*', '"""').replace('*/', '"""');
      translated.push(currentIndent + commentText);
      continue;
    }
    
    // Handle imports
    if (trimmed.startsWith('import') || trimmed.includes('require(')) {
      let importLine;
      
      if (trimmed.includes('from')) {
        // ES6 named imports: import { func } from 'module'
        const matches = trimmed.match(/import\s+\{\s*(.+?)\s*\}\s+from\s+['"](.+?)['"]/);
        if (matches) {
          const [_, imports, module] = matches;
          importLine = `from ${module} import ${imports.split(',').map(i => i.trim()).join(', ')}`;
        }
      } else if (trimmed.match(/import\s+.+\s+from/)) {
        // ES6 default imports: import module from 'module'
        const matches = trimmed.match(/import\s+(.+?)\s+from\s+['"](.+?)['"]/);
        if (matches) {
          const [_, name, module] = matches;
          importLine = `import ${module.replace(/\.js$/, '')} as ${name}`;
        }
      } else if (trimmed.includes('require(')) {
        // CommonJS require: const module = require('module')
        const matches = trimmed.match(/(?:const|let|var)\s+(.+?)\s*=\s*require\(['"](.+?)['"]\)/);
        if (matches) {
          const [_, name, module] = matches;
          importLine = `import ${module.replace(/\.js$/, '')} as ${name}`;
        }
      } else {
        // Simple import: import 'module'
        const matches = trimmed.match(/import\s+['"](.+?)['"]/);
        if (matches) {
          const [_, module] = matches;
          importLine = `import ${module.replace(/\.js$/, '')}`;
        }
      }
      
      if (importLine) {
        translated.push(currentIndent + importLine);
      } else {
        // Fallback if we can't parse the import
        translated.push(currentIndent + '# TODO: Convert this import: ' + trimmed);
      }
      continue;
    }
    
    // Handle variable declarations
    if (/^(let|const|var)\s+/.test(trimmed)) {
      let pythonVar = trimmed
        .replace(/^(let|const|var)\s+/, '')
        .replace(/;$/, '');
      
      // Handle object destructuring
      if (pythonVar.includes('{') && pythonVar.includes('}')) {
        const matches = pythonVar.match(/\{(.+?)\}\s*=\s*(.+)/);
        if (matches) {
          const [_, vars, obj] = matches;
          const varList = vars.split(',').map(v => v.trim());
          varList.forEach(v => {
            translated.push(currentIndent + `${v} = ${obj}.get('${v}')`);
          });
          continue;
        }
      }
      
      // Handle array destructuring
      if (pythonVar.includes('[') && pythonVar.includes(']') && pythonVar.includes('=')) {
        const matches = pythonVar.match(/\[(.+?)\]\s*=\s*(.+)/);
        if (matches) {
          const [_, vars, arr] = matches;
          const varList = vars.split(',').map(v => v.trim());
          for (let j = 0; j < varList.length; j++) {
            translated.push(currentIndent + `${varList[j]} = ${arr}[${j}]`);
          }
          continue;
        }
      }
      
      // Normal variable declaration
      translated.push(currentIndent + pythonVar);
      continue;
    }
    
    // Convert console.log to print
    if (trimmed.includes('console.log(')) {
      let printStatement = trimmed.replace(/console\.log\((.*)\);?/, 'print($1)');
      translated.push(currentIndent + printStatement);
      continue;
    }
    
    // Convert string methods
    if (trimmed.includes('.indexOf(')) {
      trimmed = trimmed.replace(/\.indexOf\((.*?)\)/g, '.find($1)');
    }
    
    if (trimmed.includes('.length')) {
      trimmed = trimmed.replace(/\.length/g, '.__len__()');
    }
    
    // Convert array methods
    if (trimmed.includes('.push(')) {
      trimmed = trimmed.replace(/\.push\((.*?)\)/g, '.append($1)');
    }
    
    if (trimmed.includes('.map(')) {
      const mapMatch = trimmed.match(/(\w+)\.map\((.*?)\)/);
      if (mapMatch) {
        const [_, arr, func] = mapMatch;
        trimmed = trimmed.replace(/(\w+)\.map\((.*?)\)/, `[${func}(x) for x in ${arr}]`);
      }
    }
    
    if (trimmed.includes('.filter(')) {
      const filterMatch = trimmed.match(/(\w+)\.filter\((.*?)\)/);
      if (filterMatch) {
        const [_, arr, func] = filterMatch;
        trimmed = trimmed.replace(/(\w+)\.filter\((.*?)\)/, `[x for x in ${arr} if ${func}(x)]`);
      }
    }
    
    // Convert for loops
    const forLoopMatch = trimmed.match(/for\s*\(\s*(let|var|const)?\s*(\w+)\s*=\s*(\d+)\s*;\s*\2\s*(<|<=|>|>=)\s*([^;]+)\s*;\s*\2(\+\+|\-\-|[\+\-]=\s*\d+)\s*\)/);
    if (forLoopMatch) {
      const [_, declType, varName, start, comparison, end, increment] = forLoopMatch;
      
      let step = '1';
      if (increment === '++' || increment === '+=1') {
        step = '1';
      } else if (increment === '--' || increment === '-=1') {
        step = '-1';
      } else if (increment.includes('+=')) {
        step = increment.split('+=')[1].trim();
      } else if (increment.includes('-=')) {
        step = '-' + increment.split('-=')[1].trim();
      }
      
      let rangeEnd;
      if (comparison === '<') {
        rangeEnd = end;
      } else if (comparison === '<=') {
        rangeEnd = `${end} + 1`;
      } else if (comparison === '>') {
        step = '-' + step;
        rangeEnd = end;
      } else if (comparison === '>=') {
        step = '-' + step;
        rangeEnd = `${end} - 1`;
      }
      
      // Generate Python range-based for loop
      if (step === '1') {
        translated.push(currentIndent + `for ${varName} in range(${start}, ${rangeEnd}):`);
      } else {
        translated.push(currentIndent + `for ${varName} in range(${start}, ${rangeEnd}, ${step}):`);
      }
      
      indentation++;
      inLoop = true;
      continue;
    }
    
    // Convert for...of loops
    const forOfMatch = trimmed.match(/for\s*\(\s*(let|var|const)?\s*(\w+)\s+of\s+([^\)]+)\s*\)/);
    if (forOfMatch) {
      const [_, declType, varName, iterable] = forOfMatch;
      translated.push(currentIndent + `for ${varName} in ${iterable}:`);
      indentation++;
      inLoop = true;
      continue;
    }
    
    // Convert for...in loops
    const forInMatch = trimmed.match(/for\s*\(\s*(let|var|const)?\s*(\w+)\s+in\s+([^\)]+)\s*\)/);
    if (forInMatch) {
      const [_, declType, varName, obj] = forInMatch;
      translated.push(currentIndent + `for ${varName} in ${obj}.keys():`);
      indentation++;
      inLoop = true;
      continue;
    }
    
    // Convert if conditions
    const ifMatch = trimmed.match(/if\s*\((.*)\)\s*\{?/);
    if (ifMatch) {
      const condition = ifMatch[1]
        .replace(/===|==/g, '==')
        .replace(/!==/g, '!=')
        .replace(/&&/g, ' and ')
        .replace(/\\|\\|/g, ' or ')
        .replace(/!/g, ' not ');
      
      translated.push(currentIndent + `if ${condition}:`);
      indentation++;
      continue;
    }
    
    // Convert else if
    const elseIfMatch = trimmed.match(/}\s*else\s+if\s*\((.*)\)\s*\{?/ ) || trimmed.match(/else\s+if\s*\((.*)\)\s*\{?/);
    if (elseIfMatch) {
      const condition = elseIfMatch[1]
        .replace(/===|==/g, '==')
        .replace(/!==/g, '!=')
        .replace(/&&/g, ' and ')
        .replace(/\\|\\|/g, ' or ')
        .replace(/!/g, ' not ');
      
      translated.push(currentIndent + `elif ${condition}:`);
      indentation++;
      continue;
    }
    
    // Convert else
    if (trimmed.match(/}\s*else\s*\{?/) || trimmed === 'else {' || trimmed === 'else') {
      translated.push(currentIndent + 'else:');
      indentation++;
      continue;
    }
    
    // Handle function definitions
    const funcMatch = trimmed.match(/function\s+(\w+)\s*\((.*?)\)\s*\{?/) || 
                    trimmed.match(/(?:const|let|var)?\s*(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>\s*\{?/) ||
                    trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\((.*?)\)\s*\{?/);
    
    if (funcMatch) {
      const [_, name, params] = funcMatch;
      const paramsList = params.split(',').map(p => p.trim()).filter(p => p !== '');
      
      // Check for default parameters
      const pythonParams = paramsList.map(p => {
        const defaultMatch = p.match(/(\w+)\s*=\s*(.*)/);
        if (defaultMatch) {
          return `${defaultMatch[1]}=${defaultMatch[2]}`;
        }
        return p;
      }).join(', ');
      
      translated.push(currentIndent + `def ${name}(${pythonParams}):`);
      indentation++;
      inFunction = true;
      continue;
    }
    
    // Handle arrow functions with implicit return
    const arrowFuncImplicitMatch = trimmed.match(/(?:const|let|var)?\s*(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>\s*([^{].*)/);
    if (arrowFuncImplicitMatch) {
      const [_, name, params, body] = arrowFuncImplicitMatch;
      const paramsList = params.split(',').map(p => p.trim()).filter(p => p !== '');
      
      translated.push(currentIndent + `def ${name}(${paramsList.join(', ')}):`);
      translated.push(currentIndent + '    return ' + body.replace(/;$/, ''));
      continue;
    }
    
    // Handle class definitions
    const classMatch = trimmed.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?/);
    if (classMatch) {
      const [_, name, parent] = classMatch;
      if (parent) {
        translated.push(currentIndent + `class ${name}(${parent}):`);
      } else {
        translated.push(currentIndent + `class ${name}:`);
      }
      indentation++;
      inClass = true;
      continue;
    }
    
    // Handle class methods
    const classMethodMatch = trimmed.match(/(\w+)\s*\((.*?)\)\s*\{?/);
    if (inClass && classMethodMatch && !trimmed.includes('=')) {
      const [_, name, params] = classMethodMatch;
      const paramsList = params.split(',').map(p => p.trim()).filter(p => p !== '');
      
      // Add 'self' as first parameter if not constructor
      if (name === 'constructor') {
        translated.push(currentIndent + `def __init__(self, ${paramsList.join(', ')}):`);
      } else {
        translated.push(currentIndent + `def ${name}(self${paramsList.length > 0 ? ', ' + paramsList.join(', ') : ''}):`);
      }
      indentation++;
      continue;
    }
    
    // Handle this.x to self.x conversion
    if (trimmed.includes('this.')) {
      trimmed = trimmed.replace(/this\./g, 'self.');
    }
    
    // Handle returns
    if (trimmed.startsWith('return ')) {
      translated.push(currentIndent + trimmed.replace(/;$/, ''));
      continue;
    }
    
    // Handle export statements
    if (trimmed.startsWith('export ')) {
      if (trimmed.includes('export default')) {
        // Skip export default statements, handle them later
        continue;
      }
      
      if (trimmed.includes('export const') || trimmed.includes('export let') || trimmed.includes('export var')) {
        // Convert exported variables
        translated.push(currentIndent + trimmed
          .replace(/export\s+(const|let|var)\s+/, '')
          .replace(/;$/, ''));
        continue;
      }
      
      if (trimmed.includes('export {')) {
        // Skip export {...} statements, add them to __all__ at the end
        continue;
      }
      
      // Otherwise just skip the export keyword
      translated.push(currentIndent + trimmed.replace(/export\s+/, '').replace(/;$/, ''));
      continue;
    }
    
    // Handle closing braces for blocks (reduce indentation)
    if (trimmed === '}' || trimmed === '});' || trimmed === '})' || trimmed === '};') {
      if (indentation > 0) {
        indentation--;
      }
      
      // Add pass statement for empty blocks
      if (i > 0 && 
          (lines[i-1].trim().endsWith(':') || 
           lines[i-1].trim().endsWith('{') ||
           lines[i-1].trim().match(/\)\s*\{$/))) {
        translated.push(currentIndent + 'pass');
      }
      
      // Skip the line with closing brace
      continue;
    }
    
    // Handle try/catch
    if (trimmed === 'try {') {
      translated.push(currentIndent + 'try:');
      indentation++;
      continue;
    }
    
    if (trimmed.startsWith('catch')) {
      const errorVar = trimmed.match(/catch\s*\((\w+)\)/) ? 
        trimmed.match(/catch\s*\((\w+)\)/)[1] : 
        'e';
      translated.push(currentIndent + `except Exception as ${errorVar}:`);
      indentation++;
      continue;
    }
    
    if (trimmed === 'finally {') {
      translated.push(currentIndent + 'finally:');
      indentation++;
      continue;
    }
    
    // Handle throw
    if (trimmed.startsWith('throw ')) {
      translated.push(currentIndent + 'raise ' + trimmed.substring(6).replace(/;$/, ''));
      continue;
    }
    
    // Handle switch statements (convert to if-elif chain)
    if (trimmed.startsWith('switch')) {
      const switchVar = trimmed.match(/switch\s*\((.+?)\)/)[1];
      translated.push(currentIndent + `# Switch statement converted to if-elif chain`);
      translated.push(currentIndent + `_switch_var = ${switchVar}`);
      continue;
    }
    
    if (trimmed.startsWith('case ')) {
      const caseValue = trimmed.match(/case\s+(.+?):/)[1];
      if (translated[translated.length-1].includes('_switch_var')) {
        translated.push(currentIndent + `if _switch_var == ${caseValue}:`);
      } else {
        translated.push(currentIndent + `elif _switch_var == ${caseValue}:`);
      }
      indentation++;
      continue;
    }
    
    if (trimmed === 'default:') {
      translated.push(currentIndent + 'else:');
      indentation++;
      continue;
    }
    
    if (trimmed === 'break;' || trimmed === 'break') {
      // In Python, break is only valid inside loops, so we need to check context
      if (inLoop) {
        translated.push(currentIndent + 'break');
      } else {
        // In a switch statement context, we don't need break
        translated.push(currentIndent + 'pass  # break from switch statement');
      }
      continue;
    }
    
    // Handle await
    if (trimmed.startsWith('await ')) {
      translated.push(currentIndent + trimmed.replace(/;$/, ''));
      continue;
    }
    
    // Handle object literals
    if (trimmed.startsWith('{') && !trimmed.startsWith('{{')) {
      translated.push(currentIndent + '{');
      continue;
    }
    
    // Handle ternary operators
    const ternaryMatch = trimmed.match(/(.+?)\s*\?\s*(.+?)\s*:\s*(.+)/);
    if (ternaryMatch && !trimmed.startsWith('if') && !trimmed.includes('else:')) {
      const [_, condition, ifTrue, ifFalse] = ternaryMatch;
      translated.push(currentIndent + `${ifTrue.replace(/;$/, '')} if ${condition} else ${ifFalse.replace(/;$/, '')}`);
      continue;
    }
    
    // Generic line conversion - remove semicolons and handle JS style
    let pythonLine = trimmed.replace(/;$/, '');
    
    // Add proper indentation and append to translated code
    translated.push(currentIndent + pythonLine);
  }
  
  // Add __all__ exports list if needed
  const hasExports = code.includes('export ') || code.includes('module.exports');
  if (hasExports) {
    translated.push('\n# Exports');
    translated.push('__all__ = []');
  }
  
  // Handle default export
  if (code.includes('export default')) {
    const defaultMatch = code.match(/export\s+default\s+([^;]+)/);
    if (defaultMatch) {
      translated.push(`\n# Default export: ${defaultMatch[1]}`);
    }
  }
  
  return translated.join('\n');
}