/**
 * Java to Python code translator
 * @param {string} code - Java code to be translated
 * @returns {string} - Python equivalent code
 */
export const javaToPython = (code) => {
  const lines = code.split('\n');
  let translated = [];
  let indentation = 0;
  let lastIndent = 0;
  let imports = new Set();
  let hasMain = false;
  let inClass = false;
  let className = '';
  
  // Add Python imports at the beginning
  const addImport = (importStatement) => {
    imports.add(importStatement);
  };
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let currentIndent = '    '.repeat(indentation); // Python uses 4 spaces
    
    // Skip empty lines but preserve them
    if (trimmed === '') {
      translated.push('');
      continue;
    }
    
    // Calculate current indentation level
    const indent = line.search(/\S|$/);
    
    // Detect indentation changes (closing braces in Java)
    if (i > 0 && indent < lastIndent && trimmed !== '}') {
      const indentDiff = Math.floor((lastIndent - indent) / 4);
      indentation -= indentDiff;
    }
    lastIndent = indent;
    
    // Handle single-line comments
    if (trimmed.startsWith('//')) {
      translated.push(currentIndent + '#' + trimmed.substring(2));
      continue;
    }
    
    // Handle multi-line comments (convert to Python docstrings or # comments)
    if (trimmed.startsWith('/*')) {
      if (trimmed.endsWith('*/')) {
        // Single line /* comment */
        const content = trimmed.substring(2, trimmed.length - 2);
        translated.push(currentIndent + '#' + content);
      } else {
        // Multi-line comment start
        translated.push(currentIndent + '"""');
        translated.push(currentIndent + trimmed.substring(2));
      }
      continue;
    }
    
    if (trimmed.endsWith('*/')) {
      translated.push(currentIndent + trimmed.substring(0, trimmed.length - 2));
      translated.push(currentIndent + '"""');
      continue;
    }
    
    // Handle package declarations (convert to comments)
    if (trimmed.startsWith('package ')) {
      translated.push(currentIndent + '# ' + trimmed);
      continue;
    }
    
    // Handle imports
    if (trimmed.startsWith('import ')) {
      const importMatch = trimmed.match(/import\s+(?:static\s+)?(.+?);/);
      if (importMatch) {
        const importPath = importMatch[1];
        
        // Map common Java imports to Python imports
        if (importPath.includes('java.util.Scanner')) {
          translated.push(currentIndent + '# Scanner functionality built into Python input()');
        } else if (importPath.includes('java.util.ArrayList') || importPath.includes('java.util.List')) {
          translated.push(currentIndent + '# ArrayList equivalent is Python list []');
        } else if (importPath.includes('java.lang.Math')) {
          addImport('import math');
        } else if (importPath.includes('java.lang.String')) {
          translated.push(currentIndent + '# String functionality built into Python');
        } else if (importPath.includes('java.util.Random')) {
          addImport('import random');
        } else if (importPath.includes('java.io')) {
          translated.push(currentIndent + '# File I/O: use built-in open() function');
        } else {
          translated.push(currentIndent + '# ' + trimmed + ' - Manual conversion required');
        }
      }
      continue;
    }
    
    // Handle class declarations
    if (trimmed.startsWith('public class ') || trimmed.startsWith('class ')) {
      const classMatch = trimmed.match(/(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+?))?\s*\{?/);
      if (classMatch) {
        const [_, name, parent, interfaces] = classMatch;
        className = name;
        inClass = true;
        
        if (parent) {
          translated.push(currentIndent + `class ${name}(${parent}):`);
        } else {
          translated.push(currentIndent + `class ${name}:`);
        }
        
        if (interfaces) {
          translated.push(currentIndent + `    # Implements: ${interfaces}`);
        }
        
        indentation++;
        continue;
      }
    }
    
    // Handle method declarations
    if (trimmed.includes('(') && trimmed.includes(')') && (trimmed.includes('public') || trimmed.includes('private') || trimmed.includes('static'))) {
      // Main method special case
      if (trimmed.includes('public static void main')) {
        hasMain = true;
        translated.push(currentIndent + 'def main():');
        indentation++;
        continue;
      }
      
      // Constructor
      if (trimmed.includes(`public ${className}(`) || trimmed.includes(`${className}(`)) {
        const constructorMatch = trimmed.match(/(?:public\s+)?(\w+)\s*\(([^)]*)\)\s*\{?/);
        if (constructorMatch) {
          const [_, name, params] = constructorMatch;
          const pythonParams = convertParameters(params);
          translated.push(currentIndent + `def __init__(self${pythonParams ? ', ' + pythonParams : ''}):`);
          indentation++;
          continue;
        }
      }
      
      // Regular method
      const methodMatch = trimmed.match(/(?:(public|private|protected)\s+)?(?:(static)\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{?/);
      if (methodMatch) {
        const [_, access, staticMod, returnType, methodName, params] = methodMatch;
        
        const pythonParams = convertParameters(params);
        const selfParam = staticMod ? '' : 'self';
        const allParams = [selfParam, pythonParams].filter(p => p).join(', ');
        
        if (staticMod) {
          translated.push(currentIndent + '@staticmethod');
          translated.push(currentIndent + `def ${methodName}(${pythonParams}):`);
        } else if (inClass) {
          translated.push(currentIndent + `def ${methodName}(${allParams}):`);
        } else {
          translated.push(currentIndent + `def ${methodName}(${pythonParams}):`);
        }
        
        indentation++;
        continue;
      }
    }
    
    // Handle variable declarations
    const varDeclMatch = trimmed.match(/^(int|double|float|boolean|char|String|long|short|byte)\s+(\w+)(?:\s*=\s*(.+?))?;/);
    if (varDeclMatch) {
      const [_, type, varName, value] = varDeclMatch;
      
      if (value) {
        let pythonValue = value;
        // Convert boolean literals
        if (value === 'true') pythonValue = 'True';
        if (value === 'false') pythonValue = 'False';
        // Convert null
        if (value === 'null') pythonValue = 'None';
        
        translated.push(currentIndent + `${varName} = ${pythonValue}`);
      } else {
        // Python doesn't require variable declaration, but we can initialize with None
        const defaultValue = getDefaultValue(type);
        translated.push(currentIndent + `${varName} = ${defaultValue}`);
      }
      continue;
    }
    
    // Handle System.out.println and System.out.print
    if (trimmed.includes('System.out.println') || trimmed.includes('System.out.print')) {
      const printMatch = trimmed.match(/(System\.out\.print(?:ln)?)\s*\((.+?)\)\s*;/);
      if (printMatch) {
        const [_, method, content] = printMatch;
        const isNewline = method.includes('println');
        
        // Handle string concatenation with +
        let formattedContent = content;
        if (content.includes('+')) {
          // Convert Java string concatenation to Python f-string or format
          formattedContent = convertStringConcatenation(content);
        }
        
        if (isNewline) {
          translated.push(currentIndent + `print(${formattedContent})`);
        } else {
          translated.push(currentIndent + `print(${formattedContent}, end='')`);
        }
        continue;
      }
    }
    
    // Handle Scanner input
    if (trimmed.includes('Scanner') && trimmed.includes('new Scanner')) {
      const scannerMatch = trimmed.match(/Scanner\s+(\w+)\s*=\s*new\s+Scanner\(System\.in\)\s*;/);
      if (scannerMatch) {
        const [_, varName] = scannerMatch;
        translated.push(currentIndent + `# Scanner ${varName} - use input() for user input`);
        continue;
      }
    }
    
    // Handle Scanner methods
    if (trimmed.includes('.nextInt()')) {
      const intMatch = trimmed.match(/(\w+)\s*=\s*\w+\.nextInt\(\)\s*;/);
      if (intMatch) {
        const [_, varName] = intMatch;
        translated.push(currentIndent + `${varName} = int(input())`);
        continue;
      }
    }
    
    if (trimmed.includes('.nextDouble()') || trimmed.includes('.nextFloat()')) {
      const doubleMatch = trimmed.match(/(\w+)\s*=\s*\w+\.next(?:Double|Float)\(\)\s*;/);
      if (doubleMatch) {
        const [_, varName] = doubleMatch;
        translated.push(currentIndent + `${varName} = float(input())`);
        continue;
      }
    }
    
    if (trimmed.includes('.next()')) {
      const stringMatch = trimmed.match(/(\w+)\s*=\s*\w+\.next\(\)\s*;/);
      if (stringMatch) {
        const [_, varName] = stringMatch;
        translated.push(currentIndent + `${varName} = input()`);
        continue;
      }
    }
    
    // Handle for loops
    if (trimmed.startsWith('for ')) {
      // Enhanced for loop (for-each)
      const forEachMatch = trimmed.match(/for\s*\(\s*(\w+)\s+(\w+)\s*:\s*(.+?)\s*\)\s*\{?/);
      if (forEachMatch) {
        const [_, type, varName, iterable] = forEachMatch;
        translated.push(currentIndent + `for ${varName} in ${iterable}:`);
        indentation++;
        continue;
      }
      
      // Traditional for loop
      const forMatch = trimmed.match(/for\s*\(\s*(.+?)\s*;\s*(.+?)\s*;\s*(.+?)\s*\)\s*\{?/);
      if (forMatch) {
        const [_, init, condition, increment] = forMatch;
        
        // Try to convert to Python range if it's a simple counter loop
        const simpleLoop = convertSimpleForLoop(init, condition, increment);
        if (simpleLoop) {
          translated.push(currentIndent + simpleLoop);
        } else {
          // Complex for loop - convert to while loop
          translated.push(currentIndent + init);
          translated.push(currentIndent + `while ${condition}:`);
          // increment will be added at the end of the loop body
        }
        indentation++;
        continue;
      }
    }
    
    // Handle while loops
    if (trimmed.startsWith('while ')) {
      const whileMatch = trimmed.match(/while\s*\((.+?)\)\s*\{?/);
      if (whileMatch) {
        const [_, condition] = whileMatch;
        let pythonCondition = convertCondition(condition);
        translated.push(currentIndent + `while ${pythonCondition}:`);
        indentation++;
        continue;
      }
    }
    
    // Handle if statements
    if (trimmed.startsWith('if ')) {
      const ifMatch = trimmed.match(/if\s*\((.+?)\)\s*\{?/);
      if (ifMatch) {
        const [_, condition] = ifMatch;
        let pythonCondition = convertCondition(condition);
        translated.push(currentIndent + `if ${pythonCondition}:`);
        indentation++;
        continue;
      }
    }
    
    // Handle else if statements
    if (trimmed.startsWith('else if ')) {
      const elseIfMatch = trimmed.match(/else\s+if\s*\((.+?)\)\s*\{?/);
      if (elseIfMatch) {
        const [_, condition] = elseIfMatch;
        let pythonCondition = convertCondition(condition);
        translated.push(currentIndent + `elif ${pythonCondition}:`);
        indentation++;
        continue;
      }
    }
    
    // Handle else statements
    if (trimmed === 'else {' || trimmed === 'else') {
      translated.push(currentIndent + 'else:');
      indentation++;
      continue;
    }
    
    // Handle return statements
    if (trimmed.startsWith('return ')) {
      let returnValue = trimmed.substring(7, trimmed.length - 1); // Remove 'return ' and ';'
      if (returnValue === '') {
        translated.push(currentIndent + 'return');
      } else {
        // Convert boolean literals
        returnValue = returnValue.replace(/\btrue\b/g, 'True');
        returnValue = returnValue.replace(/\bfalse\b/g, 'False');
        returnValue = returnValue.replace(/\bnull\b/g, 'None');
        translated.push(currentIndent + `return ${returnValue}`);
      }
      continue;
    }
    
    // Handle array declarations
    const arrayMatch = trimmed.match(/(\w+)\[\]\s+(\w+)\s*=\s*new\s+\w+\[(.+?)\]\s*;/);
    if (arrayMatch) {
      const [_, type, varName, size] = arrayMatch;
      const defaultValue = getArrayDefaultValue(type);
      translated.push(currentIndent + `${varName} = [${defaultValue}] * ${size}`);
      continue;
    }
    
    // Handle array initialization with values
    const arrayInitMatch = trimmed.match(/(\w+)\[\]\s+(\w+)\s*=\s*\{(.+?)\}\s*;/);
    if (arrayInitMatch) {
      const [_, type, varName, values] = arrayInitMatch;
      translated.push(currentIndent + `${varName} = [${values}]`);
      continue;
    }
    
    // Handle closing braces - Python doesn't need them, just decrease indentation
    if (trimmed === '}') {
      indentation--;
      continue;
    }
    
    // Handle generic assignments and expressions
    let modifiedLine = trimmed;
    
    // Convert boolean literals
    modifiedLine = modifiedLine.replace(/\btrue\b/g, 'True');
    modifiedLine = modifiedLine.replace(/\bfalse\b/g, 'False');
    modifiedLine = modifiedLine.replace(/\bnull\b/g, 'None');
    
    // Convert .length to len()
    modifiedLine = modifiedLine.replace(/(\w+)\.length/g, 'len($1)');
    
    // Convert && and || to and/or
    modifiedLine = modifiedLine.replace(/&&/g, ' and ');
    modifiedLine = modifiedLine.replace(/\|\|/g, ' or ');
    modifiedLine = modifiedLine.replace(/!/g, 'not ');
    
    // Remove semicolons
    modifiedLine = modifiedLine.replace(/;$/, '');
    
    // Add the line
    if (modifiedLine.trim()) {
      translated.push(currentIndent + modifiedLine);
    }
  }
  
  // Add main execution block if main method exists
  if (hasMain) {
    translated.push('');
    translated.push('if __name__ == "__main__":');
    translated.push('    main()');
  }
  
  // Prepend imports at the beginning
  const importsList = Array.from(imports);
  if (importsList.length > 0) {
    translated.unshift('', ...importsList, '');
  }
  
  return translated.join('\n');
};

// Helper functions
function convertParameters(params) {
  if (!params || params.trim() === '') return '';
  
  return params.split(',').map(param => {
    const parts = param.trim().split(/\s+/);
    if (parts.length >= 2) {
      return parts[parts.length - 1]; // Just return parameter name
    }
    return param.trim();
  }).join(', ');
}

function getDefaultValue(type) {
  const defaults = {
    'int': '0',
    'double': '0.0',
    'float': '0.0',
    'boolean': 'False',
    'char': "''",
    'String': '""',
    'long': '0',
    'short': '0',
    'byte': '0'
  };
  return defaults[type] || 'None';
}

function getArrayDefaultValue(type) {
  const defaults = {
    'int': '0',
    'double': '0.0',
    'float': '0.0',
    'boolean': 'False',
    'char': "''",
    'String': '""',
    'long': '0',
    'short': '0',
    'byte': '0'
  };
  return defaults[type] || 'None';
}

function convertStringConcatenation(content) {
  // Simple conversion of Java string concatenation to Python
  // For more complex cases, this would need enhancement
  return content.replace(/\s*\+\s*/g, ' + ');
}

function convertCondition(condition) {
  let pythonCondition = condition;
  
  // Convert boolean literals
  pythonCondition = pythonCondition.replace(/\btrue\b/g, 'True');
  pythonCondition = pythonCondition.replace(/\bfalse\b/g, 'False');
  pythonCondition = pythonCondition.replace(/\bnull\b/g, 'None');
  
  // Convert logical operators
  pythonCondition = pythonCondition.replace(/&&/g, ' and ');
  pythonCondition = pythonCondition.replace(/\|\|/g, ' or ');
  pythonCondition = pythonCondition.replace(/!/g, 'not ');
  
  return pythonCondition;
}

function convertSimpleForLoop(init, condition, increment) {
  // Try to detect simple counter loops like: for(int i = 0; i < 10; i++)
  const initMatch = init.match(/(?:int\s+)?(\w+)\s*=\s*(\d+)/);
  const condMatch = condition.match(/(\w+)\s*<\s*(\w+|\d+)/);
  const incMatch = increment.match(/(\w+)\+\+/);
  
  if (initMatch && condMatch && incMatch) {
    const [_, initVar, initVal] = initMatch;
    const [__, condVar, condVal] = condMatch;
    const [___, incVar] = incMatch;
    
    if (initVar === condVar && condVar === incVar) {
      return `for ${initVar} in range(${initVal}, ${condVal}):`;
    }
  }
  
  return null;
}