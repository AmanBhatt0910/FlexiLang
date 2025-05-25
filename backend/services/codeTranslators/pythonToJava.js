/**
 * Python to Java code translator
 * @param {string} code - Python code to be translated
 * @returns {string} - Java equivalent code
 */
export const pythonToJava = (code) => {
  // Basic implementation to be enhanced later
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let lastIndent = 0;
  let inClass = false;
  let className = '';
  let hasMainMethod = false;
  
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
    
    // Handle imports
    if (trimmed.startsWith('import ')) {
      if (trimmed.includes(' as ')) {
        const matches = trimmed.match(/import\s+(.+?)\s+as\s+(.+)/);
        if (matches) {
          const [_, module, alias] = matches;
          // Java doesn't have direct import aliasing, add comment
          translated.push(currentIndent + `// import ${module} as ${alias}`);
          translated.push(currentIndent + `import ${module}.*;`);
        }
      } else {
        const module = trimmed.replace('import ', '');
        translated.push(currentIndent + `import ${module}.*;`);
      }
      continue;
    }
    
    if (trimmed.startsWith('from ')) {
      const matches = trimmed.match(/from\s+(.+?)\s+import\s+(.+)/);
      if (matches) {
        const [_, module, imports] = matches;
        if (imports === '*') {
          translated.push(currentIndent + `import ${module}.*;`);
        } else {
          const importList = imports.split(',').map(imp => imp.trim());
          importList.forEach(imp => {
            translated.push(currentIndent + `import ${module}.${imp};`);
          });
        }
      }
      continue;
    }
    
    // Handle function definitions
    if (trimmed.startsWith('def ')) {
      const matches = trimmed.match(/def\s+(\w+)\s*\((.*?)\)\s*:/);
      if (matches) {
        const [_, name, params] = matches;
        
        // Check if this is a main function
        if (name === 'main' && !inClass) {
          hasMainMethod = true;
          translated.push(currentIndent + `public static void main(String[] args) {`);
        } else {
          // Handle self parameter for class methods
          const javaParams = params.startsWith('self') ? 
            params.replace('self', '').replace(/^\s*,\s*/, '') : 
            params;
          
          // Convert Python parameters to Java (basic type inference)
          const convertedParams = javaParams.split(',').map(param => {
            const trimmedParam = param.trim();
            if (trimmedParam === '') return '';
            // Basic type inference - could be enhanced
            return `Object ${trimmedParam}`;
          }).filter(p => p !== '').join(', ');
          
          const methodModifier = inClass ? 'public' : 'public static';
          translated.push(currentIndent + `${methodModifier} Object ${name}(${convertedParams}) {`);
        }
        indentation++;
        continue;
      }
    }
    
    // Handle class definitions
    if (trimmed.startsWith('class ')) {
      const matches = trimmed.match(/class\s+(\w+)(?:\((.+?)\))?:/);
      if (matches) {
        const [_, name, parent] = matches;
        className = name;
        inClass = true;
        
        if (parent && parent !== 'object') {
          translated.push(currentIndent + `public class ${name} extends ${parent} {`);
        } else {
          translated.push(currentIndent + `public class ${name} {`);
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
        const javaParams = params.replace('self', '').replace(/^\s*,\s*/, '');
        
        // Convert parameters to Java format
        const convertedParams = javaParams.split(',').map(param => {
          const trimmedParam = param.trim();
          if (trimmedParam === '') return '';
          return `Object ${trimmedParam}`;
        }).filter(p => p !== '').join(', ');
        
        translated.push(currentIndent + `public ${className}(${convertedParams}) {`);
        indentation++;
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
        .replace(/ is not /g, ' != ');
      
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
        .replace(/ is not /g, ' != ');
      
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
          translated.push(currentIndent + `for (int ${varName} = 0; ${varName} < ${args[0]}; ${varName}++) {`);
        } else if (args.length === 2) {
          // range(start, end)
          translated.push(currentIndent + `for (int ${varName} = ${args[0]}; ${varName} < ${args[1]}; ${varName}++) {`);
        } else if (args.length === 3) {
          // range(start, end, step)
          const stepOp = parseInt(args[2]) > 0 ? '<' : '>';
          const incOp = parseInt(args[2]) > 0 ? '+=' : '-=';
          translated.push(currentIndent + `for (int ${varName} = ${args[0]}; ${varName} ${stepOp} ${args[1]}; ${varName} ${incOp} Math.abs(${args[2]})) {`);
        }
      } else {
        // Handle iteration-based for loops
        const iterMatch = trimmed.match(/for\s+(\w+)\s+in\s+(.+?):/);
        if (iterMatch) {
          const [_, varName, iterable] = iterMatch;
          translated.push(currentIndent + `for (Object ${varName} : ${iterable}) {`);
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
        .replace(/ is not /g, ' != ');
      
      translated.push(currentIndent + `while (${condition}) {`);
      indentation++;
      continue;
    }
    
    // Handle print to System.out.println
    if (trimmed.startsWith('print(')) {
      translated.push(currentIndent + trimmed.replace(/print\((.*)\)/, 'System.out.println($1);'));
      continue;
    }
    
    // Handle return statements
    if (trimmed.startsWith('return ')) {
      translated.push(currentIndent + trimmed + ';');
      continue;
    }
    
    // Handle list comprehensions (convert to Stream API)
    const listCompMatch = trimmed.match(/(\w+)\s*=\s*\[(.*?)\s+for\s+(\w+)\s+in\s+(.+?)(?:\s+if\s+(.+?))?\]/);
    if (listCompMatch) {
      const [_, varName, expr, iterVar, iterable, condition] = listCompMatch;
      if (condition) {
        const javaCondition = condition.replace(/ and /g, ' && ').replace(/ or /g, ' || ');
        translated.push(currentIndent + `List<Object> ${varName} = ${iterable}.stream()`);
        translated.push(currentIndent + `    .filter(${iterVar} -> ${javaCondition})`);
        translated.push(currentIndent + `    .map(${iterVar} -> ${expr})`);
        translated.push(currentIndent + `    .collect(Collectors.toList());`);
      } else {
        translated.push(currentIndent + `List<Object> ${varName} = ${iterable}.stream()`);
        translated.push(currentIndent + `    .map(${iterVar} -> ${expr})`);
        translated.push(currentIndent + `    .collect(Collectors.toList());`);
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
        const catchType = exceptionType || 'Exception';
        const catchVar = varName || 'e';
        translated.push(currentIndent + `} catch (${catchType} ${catchVar}) {`);
      } else {
        translated.push(currentIndent + '} catch (Exception e) {');
      }
      indentation++;
      continue;
    }
    
    if (trimmed === 'finally:') {
      translated.push(currentIndent + '} finally {');
      indentation++;
      continue;
    }
    
    // Handle dictionaries (convert to HashMap)
    const dictMatch = trimmed.match(/(\w+)\s*=\s*\{(.+?)\}/);
    if (dictMatch) {
      const [_, varName, content] = dictMatch;
      translated.push(currentIndent + `Map<Object, Object> ${varName} = new HashMap<>();`);
      // Parse key-value pairs and add them
      const pairs = content.split(',');
      pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim());
        if (key && value) {
          translated.push(currentIndent + `${varName}.put(${key}, ${value});`);
        }
      });
      continue;
    }
    
    // Handle list/array creation
    const listMatch = trimmed.match(/(\w+)\s*=\s*\[(.+?)\]/);
    if (listMatch) {
      const [_, varName, content] = listMatch;
      translated.push(currentIndent + `List<Object> ${varName} = Arrays.asList(${content});`);
      continue;
    }
    
    // Handle variable assignment
    const assignMatch = trimmed.match(/(\w+)\s*=\s*(.+)/);
    if (assignMatch && !trimmed.includes('def ') && !trimmed.includes('class ')) {
      const [_, varName, value] = assignMatch;
      // Basic type inference
      if (value.match(/^\d+$/)) {
        translated.push(currentIndent + `int ${varName} = ${value};`);
      } else if (value.match(/^\d+\.\d+$/)) {
        translated.push(currentIndent + `double ${varName} = ${value};`);
      } else if (value.match(/^["'].*["']$/)) {
        translated.push(currentIndent + `String ${varName} = ${value};`);
      } else if (value === 'True' || value === 'False') {
        const javaValue = value === 'True' ? 'true' : 'false';
        translated.push(currentIndent + `boolean ${varName} = ${javaValue};`);
      } else {
        translated.push(currentIndent + `Object ${varName} = ${value};`);
      }
      continue;
    }
    
    // Handle Python's len() to Java's .length or .size()
    if (trimmed.includes('len(')) {
      let modifiedLine = trimmed.replace(/len\(([^)]+)\)/g, '$1.length'); // For arrays
      // Could also be .size() for collections, but we'll default to .length
      translated.push(currentIndent + modifiedLine + ';');
      continue;
    }
    
    // Handle Python boolean values
    let modifiedLine = trimmed
      .replace(/True/g, 'true')
      .replace(/False/g, 'false')
      .replace(/None/g, 'null');
    
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
  
  // If we created a class but no main method was found, wrap in a basic class structure
  if (!inClass && !hasMainMethod && translated.length > 0) {
    const imports = [
      'import java.util.*;',
      'import java.util.stream.Collectors;',
      ''
    ];
    const classWrapper = [
      'public class PythonTranslated {',
      ...translated.map(line => '    ' + line),
      '}'
    ];
    return [...imports, ...classWrapper].join('\n');
  }
  
  // Add necessary imports at the beginning
  const needsImports = translated.some(line => 
    line.includes('List<') || 
    line.includes('Map<') || 
    line.includes('HashMap') || 
    line.includes('Arrays.asList') ||
    line.includes('Collectors.toList')
  );
  
  if (needsImports) {
    const imports = [
      'import java.util.*;',
      'import java.util.stream.Collectors;',
      ''
    ];
    return [...imports, ...translated].join('\n');
  }
  
  return translated.join('\n');
};