// /**
//  * Java to C code translator
//  * @param {string} code - Java code to be translated
//  * @returns {string} - C equivalent code
//  */
// export const javaToC = (code) => {
//   const lines = code.split('\n');
//   let translated = [];
//   let indentation = 0;
//   let lastIndent = 0;
//   let includes = new Set();
//   let hasMain = false;
  
//   // Add common C includes at the beginning
//   const addInclude = (header) => {
//     includes.add(header);
//   };
  
//   for (let i = 0; i < lines.length; i++) {
//     let line = lines[i];
//     let trimmed = line.trim();
//     let currentIndent = ' '.repeat(indentation * 4);
    
//     // Skip empty lines but preserve them
//     if (trimmed === '') {
//       translated.push('');
//       continue;
//     }
    
//     // Calculate current indentation level
//     const indent = line.search(/\S|$/);
    
//     // Detect indentation changes (closing braces)
//     if (i > 0 && indent < lastIndent && trimmed !== '}') {
//       const indentDiff = Math.floor((lastIndent - indent) / 4);
//       for (let j = 0; j < indentDiff; j++) {
//         indentation--;
//         translated.push(' '.repeat(indentation * 4) + '}');
//       }
//     }
//     lastIndent = indent;
    
//     // Handle single-line comments
//     if (trimmed.startsWith('//')) {
//       translated.push(currentIndent + trimmed);
//       continue;
//     }
    
//     // Handle multi-line comments
//     if (trimmed.startsWith('/*')) {
//       translated.push(currentIndent + trimmed);
//       continue;
//     }
    
//     // Handle package declarations (convert to comments)
//     if (trimmed.startsWith('package ')) {
//       translated.push(currentIndent + '// ' + trimmed);
//       continue;
//     }
    
//     // Handle imports
//     if (trimmed.startsWith('import ')) {
//       const importMatch = trimmed.match(/import\s+(?:static\s+)?(.+?);/);
//       if (importMatch) {
//         const importPath = importMatch[1];
        
//         // Map common Java imports to C includes
//         if (importPath.includes('java.util.Scanner')) {
//           addInclude('#include <stdio.h>');
//         } else if (importPath.includes('java.util.ArrayList') || importPath.includes('java.util.List')) {
//           translated.push(currentIndent + '// ArrayList equivalent would need custom implementation or use arrays');
//         } else if (importPath.includes('java.lang.Math')) {
//           addInclude('#include <math.h>');
//         } else if (importPath.includes('java.lang.String')) {
//           addInclude('#include <string.h>');
//         } else {
//           translated.push(currentIndent + '// ' + trimmed + ' - Manual conversion required');
//         }
//       }
//       continue;
//     }
    
//     // Handle class declarations
//     if (trimmed.startsWith('public class ') || trimmed.startsWith('class ')) {
//       const classMatch = trimmed.match(/(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+?))?\s*\{?/);
//       if (classMatch) {
//         const [_, className] = classMatch;
//         translated.push(currentIndent + `// Class: ${className}`);
//         if (trimmed.endsWith('{')) {
//           indentation++;
//         }
//         continue;
//       }
//     }
    
//     // Handle method declarations
//     if (trimmed.includes('(') && trimmed.includes(')') && (trimmed.includes('public') || trimmed.includes('private') || trimmed.includes('static'))) {
//       // Main method special case
//       if (trimmed.includes('public static void main')) {
//         addInclude('#include <stdio.h>');
//         translated.push(currentIndent + 'int main(int argc, char *argv[]) {');
//         hasMain = true;
//         indentation++;
//         continue;
//       }
      
//       // Regular method
//       const methodMatch = trimmed.match(/(?:(public|private|protected)\s+)?(?:(static)\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{?/);
//       if (methodMatch) {
//         const [_, access, staticMod, returnType, methodName, params] = methodMatch;
        
//         // Convert Java types to C types
//         const convertType = (type) => {
//           const typeMap = {
//             'int': 'int',
//             'double': 'double',
//             'float': 'float',
//             'boolean': 'int', // C uses int for boolean
//             'char': 'char',
//             'String': 'char*',
//             'void': 'void',
//             'long': 'long',
//             'short': 'short',
//             'byte': 'char'
//           };
//           return typeMap[type] || type;
//         };
        
//         const cReturnType = convertType(returnType);
//         const cParams = params.split(',').map(param => {
//           const parts = param.trim().split(/\s+/);
//           if (parts.length >= 2) {
//             const type = convertType(parts[0]);
//             const name = parts[1];
//             return `${type} ${name}`;
//           }
//           return param;
//         }).join(', ');
        
//         translated.push(currentIndent + `${cReturnType} ${methodName}(${cParams}) {`);
//         indentation++;
//         continue;
//       }
//     }
    
//     // Handle variable declarations
//     const varDeclMatch = trimmed.match(/^(int|double|float|boolean|char|String|long|short|byte)\s+(\w+)(?:\s*=\s*(.+?))?;/);
//     if (varDeclMatch) {
//       const [_, type, varName, value] = varDeclMatch;
//       const cType = type === 'String' ? 'char*' : (type === 'boolean' ? 'int' : type);
      
//       if (value) {
//         let cValue = value;
//         // Convert boolean literals
//         if (value === 'true') cValue = '1';
//         if (value === 'false') cValue = '0';
//         // Handle string literals
//         if (type === 'String' && !value.startsWith('"')) {
//           cValue = `"${value}"`;
//         }
//         translated.push(currentIndent + `${cType} ${varName} = ${cValue};`);
//       } else {
//         translated.push(currentIndent + `${cType} ${varName};`);
//       }
//       continue;
//     }
    
//     // Handle System.out.println and System.out.print
//     if (trimmed.includes('System.out.println') || trimmed.includes('System.out.print')) {
//       addInclude('#include <stdio.h>');
      
//       const printMatch = trimmed.match(/(System\.out\.print(?:ln)?)\s*\((.+?)\)\s*;/);
//       if (printMatch) {
//         const [_, method, content] = printMatch;
//         const isNewline = method.includes('println');
        
//         // Handle string concatenation with +
//         let formattedContent = content;
//         if (content.includes('+')) {
//           // Simple string concatenation handling
//           const parts = content.split('+').map(part => part.trim());
//           const stringParts = [];
//           const variables = [];
          
//           parts.forEach(part => {
//             if (part.startsWith('"') && part.endsWith('"')) {
//               stringParts.push(part.slice(1, -1));
//             } else {
//               stringParts.push('%d'); // Assume integer for simplicity
//               variables.push(part);
//             }
//           });
          
//           const formatString = `"${stringParts.join('')}${isNewline ? '\\n' : ''}"`;
//           if (variables.length > 0) {
//             formattedContent = `${formatString}, ${variables.join(', ')}`;
//           } else {
//             formattedContent = formatString;
//           }
//         } else {
//           // Single argument
//           if (isNewline && !content.includes('\\n')) {
//             if (content.startsWith('"') && content.endsWith('"')) {
//               formattedContent = content.slice(0, -1) + '\\n"';
//             } else {
//               formattedContent = `"%d\\n", ${content}`;
//             }
//           }
//         }
        
//         translated.push(currentIndent + `printf(${formattedContent});`);
//         continue;
//       }
//     }
    
//     // Handle Scanner input
//     if (trimmed.includes('Scanner') && trimmed.includes('new Scanner')) {
//       addInclude('#include <stdio.h>');
//       const scannerMatch = trimmed.match(/Scanner\s+(\w+)\s*=\s*new\s+Scanner\(System\.in\)\s*;/);
//       if (scannerMatch) {
//         const [_, varName] = scannerMatch;
//         translated.push(currentIndent + `// Scanner ${varName} - use scanf() for input`);
//         continue;
//       }
//     }
    
//     // Handle Scanner methods
//     if (trimmed.includes('.nextInt()') || trimmed.includes('.nextDouble()') || trimmed.includes('.next()')) {
//       addInclude('#include <stdio.h>');
      
//       if (trimmed.includes('.nextInt()')) {
//         const intMatch = trimmed.match(/(\w+)\s*=\s*\w+\.nextInt\(\)\s*;/);
//         if (intMatch) {
//           const [_, varName] = intMatch;
//           translated.push(currentIndent + `scanf("%d", &${varName});`);
//           continue;
//         }
//       }
      
//       if (trimmed.includes('.nextDouble()')) {
//         const doubleMatch = trimmed.match(/(\w+)\s*=\s*\w+\.nextDouble\(\)\s*;/);
//         if (doubleMatch) {
//           const [_, varName] = doubleMatch;
//           translated.push(currentIndent + `scanf("%lf", &${varName});`);
//           continue;
//         }
//       }
//     }
    
//     // Handle for loops
//     if (trimmed.startsWith('for ')) {
//       // Enhanced for loop (for-each)
//       const forEachMatch = trimmed.match(/for\s*\(\s*(\w+)\s+(\w+)\s*:\s*(.+?)\s*\)\s*\{?/);
//       if (forEachMatch) {
//         const [_, type, varName, iterable] = forEachMatch;
//         translated.push(currentIndent + `// Enhanced for loop - manual conversion needed`);
//         translated.push(currentIndent + `// for (${type} ${varName} : ${iterable})`);
//         if (trimmed.endsWith('{')) {
//           indentation++;
//         }
//         continue;
//       }
      
//       // Traditional for loop
//       const forMatch = trimmed.match(/for\s*\((.+?)\)\s*\{?/);
//       if (forMatch) {
//         const [_, forContent] = forMatch;
//         translated.push(currentIndent + `for (${forContent}) {`);
//         indentation++;
//         continue;
//       }
//     }
    
//     // Handle while loops
//     if (trimmed.startsWith('while ')) {
//       const whileMatch = trimmed.match(/while\s*\((.+?)\)\s*\{?/);
//       if (whileMatch) {
//         const [_, condition] = whileMatch;
//         translated.push(currentIndent + `while (${condition}) {`);
//         indentation++;
//         continue;
//       }
//     }
    
//     // Handle if statements
//     if (trimmed.startsWith('if ')) {
//       const ifMatch = trimmed.match(/if\s*\((.+?)\)\s*\{?/);
//       if (ifMatch) {
//         const [_, condition] = ifMatch;
//         translated.push(currentIndent + `if (${condition}) {`);
//         indentation++;
//         continue;
//       }
//     }
    
//     // Handle else if statements
//     if (trimmed.startsWith('else if ')) {
//       const elseIfMatch = trimmed.match(/else\s+if\s*\((.+?)\)\s*\{?/);
//       if (elseIfMatch) {
//         const [_, condition] = elseIfMatch;
//         translated.push(currentIndent + `else if (${condition}) {`);
//         indentation++;
//         continue;
//       }
//     }
    
//     // Handle else statements
//     if (trimmed === 'else {' || trimmed === 'else') {
//       translated.push(currentIndent + 'else {');
//       if (trimmed.endsWith('{')) {
//         indentation++;
//       }
//       continue;
//     }
    
//     // Handle return statements
//     if (trimmed.startsWith('return ')) {
//       if (hasMain && trimmed === 'return;') {
//         translated.push(currentIndent + 'return 0;');
//       } else {
//         translated.push(currentIndent + trimmed);
//       }
//       continue;
//     }
    
//     // Handle array declarations
//     const arrayMatch = trimmed.match(/(\w+)\[\]\s+(\w+)\s*=\s*new\s+\w+\[(.+?)\]\s*;/);
//     if (arrayMatch) {
//       const [_, type, varName, size] = arrayMatch;
//       const cType = type === 'String' ? 'char*' : (type === 'boolean' ? 'int' : type);
//       translated.push(currentIndent + `${cType} ${varName}[${size}];`);
//       continue;
//     }
    
//     // Handle closing braces
//     if (trimmed === '}') {
//       indentation--;
//       translated.push(' '.repeat(indentation * 4) + '}');
//       continue;
//     }
    
//     // Handle generic assignments and expressions
//     let modifiedLine = trimmed;
    
//     // Convert boolean literals
//     modifiedLine = modifiedLine.replace(/\btrue\b/g, '1');
//     modifiedLine = modifiedLine.replace(/\bfalse\b/g, '0');
    
//     // Convert .length to sizeof or manual length tracking
//     modifiedLine = modifiedLine.replace(/(\w+)\.length/g, 'sizeof($1)/sizeof($1[0])');
    
//     // Add the line
//     translated.push(currentIndent + modifiedLine);
//   }
  
//   // Add closing braces for any remaining indentation
//   while (indentation > 0) {
//     indentation--;
//     translated.push(' '.repeat(indentation * 4) + '}');
//   }
  
//   // Prepend includes at the beginning
//   const includesList = Array.from(includes);
//   if (includesList.length > 0) {
//     translated.unshift('', ...includesList, '');
//   }
  
//   return translated.join('\n');
// };