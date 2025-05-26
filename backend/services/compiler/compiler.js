import { TokenTypes } from './tokenTypes.js';
import { LexicalAnalyzer } from './Lexer.js';
import { SyntaxAnalyzer } from './parser.js';
import { SemanticAnalyzer } from './semanticAnalyzer.js';
import { IntermediateCodeGenerator } from './intermediateCodeGenerator.js';
import { CodeOptimizer } from './optimizer.js';
import { PythonCodeGenerator } from './generators/pythonGenerator.js';
import { JavaCodeGenerator } from './generators/javaGenerator.js';
import { CGenerator } from './generators/CGenerator.js';
import { JavaScriptGenerator } from './generators/javascriptGenerator.js';
import { ASTNode, NodeTypes } from './ast.js';

export class CrossCompiler {
  constructor() {
    if (!NodeTypes) throw new Error('NodeTypes dependency missing');
    if (!TokenTypes) throw new Error('TokenTypes dependency missing');
    
    this.supportedLanguages = this.buildLanguageSupportMatrix();
    this.validateGenerators();
  }

  buildLanguageSupportMatrix() {
    return {
      javascript: ['python', 'java', 'c'],
      python: ['javascript', 'java', 'c'],
      java: ['python', 'javascript', 'c'],
      c: ['java', 'python', 'javascript']
    };
  }

  validateGenerators() {
    const requiredGenerators = [
      PythonCodeGenerator,
      JavaCodeGenerator,
      CGenerator,
      JavaScriptGenerator
    ];
    
    requiredGenerators.forEach(Generator => {
      if (!Generator || typeof Generator.prototype.generate !== 'function') {
        throw new Error(`Invalid code generator: ${Generator.name}`);
      }
    });
  }

  async compile(sourceCode, fromLang, toLang) {
    try {
      console.log(`Starting compilation from ${fromLang} to ${toLang}`);
      
      // Validate input parameters
      if (typeof sourceCode !== 'string') {
        throw new Error('Invalid source code format');
      }

      // Phase 1: Lexical Analysis
      const lexer = new LexicalAnalyzer(sourceCode);
      const tokens = await lexer.tokenize();

      // Phase 2: Syntax Analysis
      const parser = new SyntaxAnalyzer(tokens);
      const ast = await parser.parse();

      // Phase 3: Semantic Analysis
      const semanticAnalyzer = new SemanticAnalyzer(ast);
      const semanticResult = await semanticAnalyzer.analyze();

      if (semanticResult.errors.length > 0) {
        return this.formatError('Semantic errors', semanticResult.errors);
      }

      // Phase 4: Intermediate Code Generation
      const icg = new IntermediateCodeGenerator(ast);
      const intermediateCode = await icg.generate();

      // Phase 5: Code Optimization
      const optimizer = new CodeOptimizer(intermediateCode);
      const optimizedCode = await optimizer.optimize();

      // Phase 6: Target Code Generation
      const targetCode = await this.generateTargetCode(optimizedCode, toLang);

      return {
        success: true,
        targetCode,
        tokens,
        ast: this.sanitizeAST(ast),
        intermediateCode,
        optimizedCode,
        symbolTable: semanticResult.symbolTable
      };

    } catch (error) {
      return this.formatError('Compilation error', error.message);
    }
  }

  async generateTargetCode(optimizedCode, targetLang) {
    const lang = targetLang.toLowerCase();
    
    const generators = {
      python: PythonCodeGenerator,
      java: JavaCodeGenerator,
      c: CGenerator,
      javascript: JavaScriptGenerator
    };

    if (!generators[lang]) {
      throw new Error(`Unsupported target language: ${targetLang}`);
    }

    const generator = new generators[lang](optimizedCode);
    return generator.generate();
  }

  sanitizeAST(ast) {
    // Remove circular references and sensitive data
    return JSON.parse(JSON.stringify(ast, (key, value) => {
      if (key === 'parent') return undefined;
      if (key === 'context') return undefined;
      return value;
    }));
  }

  formatError(type, message) {
    return {
      success: false,
      errorType: type,
      error: Array.isArray(message) ? message.join('; ') : message,
      timestamp: new Date().toISOString()
    };
  }

  getSupportedLanguages() {
    return JSON.parse(JSON.stringify(this.supportedLanguages));
  }

  isConversionSupported(from, to) {
    const normalizedFrom = from.toLowerCase();
    const normalizedTo = to.toLowerCase();
    return this.supportedLanguages[normalizedFrom]?.includes(normalizedTo);
  }
}