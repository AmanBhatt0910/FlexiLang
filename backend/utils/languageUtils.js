/**
 * Language Utilities for syntax transformations and code parsing
 */

/**
 * Language configuration for supported languages
 * Contains language-specific patterns and syntax information
 */
export const languageConfig = {
  javascript: {
    fileExtension: 'js',
    commentSyntax: {
      single: '//',
      multiStart: '/*',
      multiEnd: '*/'
    },
    loopSyntax: {
      for: 'for',
      while: 'while',
      forEach: 'forEach',
      map: 'map',
      filter: 'filter'
    },
    conditionalSyntax: {
      if: 'if',
      else: 'else',
      elseIf: 'else if',
      ternary: '? :'
    },
    variableDeclaration: ['let', 'const', 'var'],
    stringConcatenation: ['+', '${', '}', '`'],
    functionDefiniton: ['function', '=>']
  },
  python: {
    fileExtension: 'py',
    commentSyntax: {
      single: '#',
      multiStart: '"""',
      multiEnd: '"""'
    },
    loopSyntax: {
      for: 'for',
      while: 'while',
      forEach: '[for]',
      map: 'map',
      filter: 'filter'
    },
    conditionalSyntax: {
      if: 'if',
      else: 'else',
      elseIf: 'elif',
      ternary: 'if else'
    },
    variableDeclaration: [],
    stringConcatenation: ['+', 'f"', '"', "f'"],
    functionDefiniton: ['def']
  }
};

/**
 * Parse JavaScript AST (Abstract Syntax Tree) from source code
 * @param {string} code - JavaScript source code
 * @returns {Object} - AST representation of the code
 */
export const parseJavaScriptAST = (code) => {
  // This is a simplified version - in production, use a proper parser like Babel or Acorn
  const ast = {
    type: 'Program',
    body: []
  };
  
  // Very basic parsing for demonstration
  const lines = code.split('\n');
  let currentScope = ast.body;
  let scopeStack = [currentScope];
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('//')) {
      // Comment
      currentScope.push({
        type: 'Comment',
        value: trimmedLine.substring(2).trim()
      });
    } else if (trimmedLine.startsWith('function')) {
      // Function declaration
      const funcMatch = trimmedLine.match(/function\s+(\w+)\s*\((.*?)\)/);
      if (funcMatch) {
        const newFunc = {
          type: 'FunctionDeclaration',
          id: { name: funcMatch[1] },
          params: funcMatch[2].split(',').map(p => ({ name: p.trim() })),
          body: []
        };
        currentScope.push(newFunc);
        scopeStack.push(newFunc.body);
        currentScope = newFunc.body;
      }
    } else if (trimmedLine.startsWith('class')) {
      // Class declaration
      const classMatch = trimmedLine.match(/class\s+(\w+)/);
      if (classMatch) {
        const newClass = {
          type: 'ClassDeclaration',
          id: { name: classMatch[1] },
          methods: []
        };
        currentScope.push(newClass);
        scopeStack.push(newClass.methods);
        currentScope = newClass.methods;
      }
    } else if (trimmedLine.startsWith('if')) {
      // If statement
      const ifMatch = trimmedLine.match(/if\s*\((.*?)\)/);
      if (ifMatch) {
        const newIf = {
          type: 'IfStatement',
          test: { raw: ifMatch[1] },
          consequent: [],
          alternate: null
        };
        currentScope.push(newIf);
        scopeStack.push(newIf.consequent);
        currentScope = newIf.consequent;
      }
    } else if (trimmedLine === '}') {
      // Closing brace - pop scope
      if (scopeStack.length > 1) {
        scopeStack.pop();
        currentScope = scopeStack[scopeStack.length - 1];
      }
    } else if (trimmedLine.startsWith('var') || 
               trimmedLine.startsWith('let') || 
               trimmedLine.startsWith('const')) {
      // Variable declaration
      const varMatch = trimmedLine.match(/(var|let|const)\s+(\w+)\s*=\s*(.*?);?$/);
      if (varMatch) {
        currentScope.push({
          type: 'VariableDeclaration',
          kind: varMatch[1],
          declarations: [
            {
              id: { name: varMatch[2] },
              init: { raw: varMatch[3] }
            }
          ]
        });
      }
    } else if (trimmedLine.startsWith('return')) {
      // Return statement
      const returnMatch = trimmedLine.match(/return\s+(.*?);?$/);
      if (returnMatch) {
        currentScope.push({
          type: 'ReturnStatement',
          argument: { raw: returnMatch[1] }
        });
      }
    }
  });
  
  return ast;
};

/**
 * Generate Python code from a JavaScript AST
 * @param {Object} ast - JavaScript AST
 * @returns {string} - Python code
 */
export const generatePythonFromAST = (ast) => {
  let pythonCode = '';
  let indentLevel = 0;
  
  const generateIndent = () => '    '.repeat(indentLevel);
  
  const processNode = (node) => {
    if (!node) return '';
    
    switch (node.type) {
      case 'Program':
        return node.body.map(processNode).join('\n');
        
      case 'Comment':
        return `${generateIndent()}# ${node.value}`;
        
      case 'FunctionDeclaration':
        indentLevel++;
        const body = node.body.map(processNode).join('\n');
        indentLevel--;
        return `${generateIndent()}def ${node.id.name}(${node.params.map(p => p.name).join(', ')}):\n${body || generateIndent() + '    pass'}`;
        
      case 'ClassDeclaration':
        indentLevel++;
        const methods = node.methods.map(processNode).join('\n\n');
        indentLevel--;
        return `${generateIndent()}class ${node.id.name}:\n${methods || generateIndent() + '    pass'}`;
        
      case 'IfStatement':
        indentLevel++;
        const consequent = node.consequent.map(processNode).join('\n');
        indentLevel--;
        return `${generateIndent()}if ${node.test.raw}:\n${consequent || generateIndent() + '    pass'}`;
        
      case 'VariableDeclaration':
        const declaration = node.declarations[0];
        return `${generateIndent()}${declaration.id.name} = ${declaration.init.raw}`;
        
      case 'ReturnStatement':
        return `${generateIndent()}return ${node.argument.raw}`;
        
      default:
        return `${generateIndent()}# Unsupported node type: ${node.type}`;
    }
  };
  
  pythonCode = processNode(ast);
  return pythonCode;
};

/**
 * Convert JavaScript code to Python code using AST transformation
 * This is a more sophisticated approach than string manipulation
 * 
 * @param {string} jsCode - JavaScript code
 * @returns {string} - Python code
 */
export const convertJsToPythonWithAST = (jsCode) => {
  const ast = parseJavaScriptAST(jsCode);
  return generatePythonFromAST(ast);
};

/**
 * Detect the programming language from code snippet
 * @param {string} code - Code snippet
 * @returns {string} - Detected language name
 */
export const detectLanguage = (code) => {
  // Simple heuristics for language detection
  if (code.includes('def ') && code.includes(':') && !code.includes('{')) {
    return 'python';
  }
  
  if (code.includes('function ') || code.includes('=>') || 
      code.includes('var ') || code.includes('let ') || code.includes('const ')) {
    return 'javascript';
  }
  
  if (code.includes('print(') && !code.includes('console.log(')) {
    return 'python';
  }
  
  if (code.includes('console.log(')) {
    return 'javascript';
  }
  
  // Default to JavaScript if we can't detect
  return 'javascript';
};

/**
 * Convert code comments from one language to another
 * @param {string} code - Source code
 * @param {string} fromLanguage - Source language
 * @param {string} toLanguage - Target language
 * @returns {string} - Code with converted comments
 */
export const convertComments = (code, fromLanguage, toLanguage) => {
  const fromConfig = languageConfig[fromLanguage];
  const toConfig = languageConfig[toLanguage];
  
  if (!fromConfig || !toConfig) {
    return code;
  }
  
  let result = code;
  
  // Convert single-line comments
  const singleLineCommentRegex = new RegExp(`${escapeRegExp(fromConfig.commentSyntax.single)}\\s*(.*)`, 'g');
  result = result.replace(singleLineCommentRegex, `${toConfig.commentSyntax.single} $1`);
  
  // Convert multi-line comments (simplified version)
  const multiLineCommentStart = new RegExp(escapeRegExp(fromConfig.commentSyntax.multiStart), 'g');
  const multiLineCommentEnd = new RegExp(escapeRegExp(fromConfig.commentSyntax.multiEnd), 'g');
  
  result = result.replace(multiLineCommentStart, toConfig.commentSyntax.multiStart);
  result = result.replace(multiLineCommentEnd, toConfig.commentSyntax.multiEnd);
  
  return result;
};

/**
 * Helper function to escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} - Escaped string for use in RegExp
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Save translation history to database
 * @param {string} userId - User ID
 * @param {string} fromLanguage - Source language
 * @param {string} toLanguage - Target language
 * @param {string} sourceCode - Original code
 * @param {string} translatedCode - Translated code
 */
export const saveTranslationHistory = async (userId, fromLanguage, toLanguage, sourceCode, translatedCode) => {
  try {
    // This would require User model imported
    // const user = await User.findById(userId);
    // if (user) {
    //   user.translationHistory.push({
    //     fromLanguage,
    //     toLanguage,
    //     timestamp: new Date()
    //   });
    //   await user.save();
    // }
    console.log(`Translation saved for user ${userId}: ${fromLanguage} -> ${toLanguage}`);
  } catch (error) {
    console.error('Error saving translation history:', error);
  }
};