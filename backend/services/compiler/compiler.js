import { LexicalAnalyzer } from './lexer.js';
import { SyntaxAnalyzer } from './parser.js';
import { SemanticAnalyzer } from './semanticAnalyzer.js';
import { IntermediateCodeGenerator } from './intermediateCodeGenerator.js';
import { CodeOptimizer } from './optimizer.js';
import { PythonCodeGenerator } from './generators/pythonGenerator.js';
import { JavaCodeGenerator } from './generators/javaGenerator.js';
// import { CGenerator  } from './generators/CGenerator.js';
import CGenerator from './generators/cGenerator.js';
import { JavaScriptGenerator } from './generators/javascriptGenerator.js';

export class CrossCompiler {
  constructor() {
    this.supportedLanguages = {
      javascript: ['python', 'java', 'c'],
      python: ['javascript', 'java', 'c'],
      java: ['python', 'javascript', 'c'],
      c: ['java', 'python', 'javascript']
    };
  }

  compile(sourceCode, fromLang, toLang) {
    if (!this.isConversionSupported(fromLang, toLang)) {
      return {
        success: false,
        error: `Unsupported conversion: ${fromLang} to ${toLang}`
      };
    }

    try {
      // Phase 1: Lexical Analysis
      const lexer = new LexicalAnalyzer(sourceCode);
      const tokens = lexer.tokenize();

      // Phase 2: Syntax Analysis
      const parser = new SyntaxAnalyzer(tokens);
      const ast = parser.parse();

      // Phase 3: Semantic Analysis
      const semanticAnalyzer = new SemanticAnalyzer(ast);
      const semanticResult = semanticAnalyzer.analyze();

      if (semanticResult.errors.length > 0) {
        return {
          success: false,
          error: semanticResult.errors.join(', ')
        };
      }

      // Phase 4: Intermediate Code Generation
      const icg = new IntermediateCodeGenerator(ast);
      const intermediateCode = icg.generate();

      // Phase 5: Code Optimization
      const optimizer = new CodeOptimizer(intermediateCode);
      const optimizedCode = optimizer.optimize();

      // Phase 6: Target Code Generation
      let targetCode;
      switch (toLang.toLowerCase()) {
        case 'python':
          targetCode = new PythonCodeGenerator(optimizedCode).generate();
          break;
        case 'java':
          targetCode = new JavaCodeGenerator(optimizedCode).generate();
          break;
        case 'c':
          targetCode = new CGenerator(optimizedCode).generate();
          break;
        case 'javascript':
          targetCode = new JavaScriptGenerator(optimizedCode).generate();
          break;
        default:
          throw new Error(`Unsupported target language: ${toLang}`);
      }

      return {
        success: true,
        targetCode,
        tokens,
        ast,
        intermediateCode,
        optimizedCode,
        symbolTable: semanticResult.symbolTable
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  isConversionSupported(from, to) {
    const normalizedFrom = from.toLowerCase();
    const normalizedTo = to.toLowerCase();
    return this.supportedLanguages[normalizedFrom]?.includes(normalizedTo);
  }
}