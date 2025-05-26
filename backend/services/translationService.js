import { CrossCompiler } from './compiler/compiler.js';
import { TokenTypes } from './compiler/tokenTypes.js';
import { NodeTypes } from './compiler/ast.js';
import { validateLexerDependencies } from './compiler/Lexer.js';
import { ASTNode } from './compiler/ast.js';
import { IntermediateInstruction, IntermediateCodeGenerator } from './compiler/intermediateCodeGenerator.js';

// Debug the imports immediately after importing
console.log('=== IMPORT DEBUG ===');
console.log('IntermediateInstruction type:', typeof IntermediateInstruction);
console.log('IntermediateCodeGenerator type:', typeof IntermediateCodeGenerator);
console.log('IntermediateInstruction:', IntermediateInstruction);
console.log('IntermediateCodeGenerator:', IntermediateCodeGenerator);

// Test creating an instance
try {
  const testInst = new IntermediateInstruction('TEST', 'arg1', 'arg2', 'result');
  console.log('IntermediateInstruction test instance created successfully:', testInst.toString());
} catch (error) {
  console.error('Failed to create IntermediateInstruction test instance:', error.message);
}

if (!global.NodeTypes) global.NodeTypes = NodeTypes;
if (!global.IntermediateInstruction) global.IntermediateInstruction = IntermediateInstruction;
if (!global.IntermediateCodeGenerator) global.IntermediateCodeGenerator = IntermediateCodeGenerator;

// Enhanced dependency validation
const validateDependencies = () => {
  const issues = [];

  if (!ASTNode?.prototype?.addChild) {
    issues.push('ASTNode prototype corrupted');
  }
  
  if (!NodeTypes?.PROGRAM) {
    issues.push('NodeTypes missing critical PROGRAM type');
  }

  // Add validation for intermediate code generator classes
  if (!IntermediateInstruction || typeof IntermediateInstruction !== 'function') {
    issues.push('IntermediateInstruction class not loaded properly');
  }
  
  if (!IntermediateCodeGenerator || typeof IntermediateCodeGenerator !== 'function') {
    issues.push('IntermediateCodeGenerator class not loaded properly');
  }

  console.log('AST NodeTypes:', NodeTypes);
  console.log('ASTNode prototype:', ASTNode?.prototype ? 'Valid' : 'Invalid');
  console.log('IntermediateInstruction available:', !!IntermediateInstruction);
  console.log('IntermediateCodeGenerator available:', !!IntermediateCodeGenerator);

  if (!ASTNode || typeof ASTNode !== 'function') {
    issues.push('ASTNode class not loaded');
  }
  
  if (!NodeTypes || typeof NodeTypes !== 'object') {
    issues.push('NodeTypes not loaded');
  } else {
    const requiredTypes = ['PROGRAM', 'VARIABLE_DECLARATION', 'CALL_EXPRESSION'];
    requiredTypes.forEach(type => {
      if (!NodeTypes[type]) issues.push(`Missing NodeType: ${type}`);
    });
  }

  // Check TokenTypes
  if (!TokenTypes || typeof TokenTypes !== 'object') {
    issues.push(`TokenTypes failed to load. Got: ${typeof TokenTypes}`);
  } else {
    const requiredTokens = [
      'NUMBER', 'STRING', 'BOOLEAN', 'NULL', 'UNDEFINED', 'IDENTIFIER', 
      'KEYWORD', 'ASSIGNMENT', 'ARITHMETIC', 'COMPARISON', 'LOGICAL', 
      'UNARY', 'SEMICOLON', 'COMMA', 'DOT', 'LPAREN', 'RPAREN', 
      'LBRACE', 'RBRACE', 'LBRACKET', 'RBRACKET', 'COMMENT', 
      'NEWLINE', 'EOF', 'WHITESPACE'
    ];
    
    for (const token of requiredTokens) {
      if (!TokenTypes[token]) {
        issues.push(`Missing TokenType: ${token}`);
      }
    }
  }
  
  // Check CrossCompiler
  if (!CrossCompiler || typeof CrossCompiler !== 'function') {
    issues.push(`CrossCompiler failed to load. Got: ${typeof CrossCompiler}`);
  }
  
  // Validate Lexer dependencies
  try {
    validateLexerDependencies();
  } catch (error) {
    issues.push(`Lexer validation failed: ${error.message}`);
  }
  
  return issues;
};

// Initialize compiler with comprehensive safety checks
const compiler = (() => {
  try {
    console.log('Initializing compiler with dependency validation...');
    
    // Validate all dependencies first
    const dependencyIssues = validateDependencies();
    if (dependencyIssues.length > 0) {
      throw new Error(`Dependency validation failed: ${dependencyIssues.join(', ')}`);
    }
    
    console.log('All dependencies validated successfully');
    
    // Create compiler instance
    const instance = new CrossCompiler();
    
    // Verify compiler initialization
    if (!instance || typeof instance.compile !== 'function') {
      throw new Error('Compiler instance not properly initialized - missing compile method');
    }
    
    if (!instance.getSupportedLanguages || typeof instance.getSupportedLanguages !== 'function') {
      throw new Error('Compiler instance not properly initialized - missing getSupportedLanguages method');
    }
    
    console.log('Compiler initialized successfully');
    console.log('Supported languages:', instance.getSupportedLanguages());
    
    return instance;
    
  } catch (error) {
    console.error('COMPILER INITIALIZATION FAILED:', error.message);
    console.error('Available imports:', {
      CrossCompiler: typeof CrossCompiler,
      TokenTypes: typeof TokenTypes,
      TokenTypesKeys: TokenTypes ? Object.keys(TokenTypes).length : 'N/A',
      IntermediateInstruction: typeof IntermediateInstruction,
      IntermediateCodeGenerator: typeof IntermediateCodeGenerator
    });
    
    // In production, return null instead of exiting
    return null;
  }
})();

const sanitizeCode = (code) => {
  // Enhanced sanitization with comprehensive validation
  if (typeof code !== 'string') {
    console.warn('Invalid code type provided:', typeof code);
    return '';
  }
  
  if (code.length === 0) {
    return '';
  }
  
  if (code.length > 100000) { // 100KB limit
    console.warn('Code exceeds maximum length, truncating');
    code = code.slice(0, 100000);
  }
  
  return code
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // Allow printable ASCII + common whitespace
    .replace(/(`){3,}/g, '```') // Normalize code block markers
    .replace(/\r\n/g, '\n') // Normalize line endings
    .trim();
};

export const translateCode = async (sourceCode, fromLanguage, toLanguage) => {
  const startTime = Date.now();

  console.log('Available NodeTypes:', Object.keys(NodeTypes).length, 'types');
  if (!NodeTypes.VARIABLE_DECLARATION) {
    throw new Error('Critical NodeTypes missing in compilation context');
  }

  // Debug intermediate code classes at the point of use
  console.log('=== RUNTIME DEBUG ===');
  console.log('IntermediateInstruction at runtime:', typeof IntermediateInstruction);
  console.log('IntermediateCodeGenerator at runtime:', typeof IntermediateCodeGenerator);
  console.log('global.IntermediateInstruction:', typeof global.IntermediateInstruction);
  
  // Try to access from different scopes
  const LocalIntermediateInstruction = IntermediateInstruction || global.IntermediateInstruction;
  const LocalIntermediateCodeGenerator = IntermediateCodeGenerator || global.IntermediateCodeGenerator;
  
  console.log('LocalIntermediateInstruction:', typeof LocalIntermediateInstruction);
  console.log('LocalIntermediateCodeGenerator:', typeof LocalIntermediateCodeGenerator);
  
  try {
    // Pre-flight checks
    if (!compiler) {
      throw new Error('Compiler not initialized - check server startup logs for dependency issues');
    }

    // Validate input parameters
    if (typeof sourceCode !== 'string') {
      throw new Error(`Invalid sourceCode type: expected string, got ${typeof sourceCode}`);
    }
    
    if (typeof fromLanguage !== 'string') {
      throw new Error(`Invalid fromLanguage type: expected string, got ${typeof fromLanguage}`);
    }
    
    if (typeof toLanguage !== 'string') {
      throw new Error(`Invalid toLanguage type: expected string, got ${typeof toLanguage}`);
    }

    // Sanitize and validate input
    const sanitizedCode = sanitizeCode(sourceCode);
    
    if (!sanitizedCode || sanitizedCode.length === 0) {
      throw new Error("Source code is empty or invalid after sanitization");
    }

    if (sanitizedCode.length < 3) {
      throw new Error("Source code too short to be meaningful");
    }

    // Normalize and validate languages
    const fromLang = fromLanguage.toLowerCase().trim();
    const toLang = toLanguage.toLowerCase().trim();
    
    if (!fromLang || !toLang) {
      throw new Error("Language parameters cannot be empty");
    }

    // Check if conversion is supported
    if (!compiler.isConversionSupported(fromLang, toLang)) {
      const supportedLangs = compiler.getSupportedLanguages();
      throw new Error(
        `Unsupported conversion: ${fromLang} to ${toLang}. ` +
        `Supported combinations: ${JSON.stringify(supportedLangs)}`
      );
    }

    console.log(`Starting translation: ${fromLang} -> ${toLang} (${sanitizedCode.length} chars)`);

    // Perform compilation with proper TokenTypes validation
    if (!TokenTypes || typeof TokenTypes !== 'object') {
      throw new Error('TokenTypes not available for compilation');
    }

    console.log('TokenTypes available for compilation:', Object.keys(TokenTypes).length, 'tokens');
    
    // Test creating IntermediateInstruction before compilation
    try {
      const testInstruction = new (LocalIntermediateInstruction || IntermediateInstruction)('TEST', 'a', 'b', 'result');
      console.log('Pre-compilation test instruction created:', testInstruction.toString());
    } catch (testError) {
      console.error('Failed to create test instruction:', testError.message);
      throw new Error(`IntermediateInstruction class not accessible: ${testError.message}`);
    }
    
    const result = await compiler.compile(sanitizedCode, fromLang, toLang);
    
    if (result instanceof Promise) {
      throw new Error("Compiler returned promise instead of result - missing async handling");
    }

    if (!result) {
      throw new Error("Compiler returned null result");
    }
    
    if (!result.success) {
      throw new Error(result.error || "Compilation failed without specific error message");
    }

    if (!result.targetCode || typeof result.targetCode !== 'string') {
      throw new Error("Compiler did not generate valid target code");
    }

    if (!result.targetCode.trim()) {
      throw new Error("Generated target code is empty");
    }

    const processingTime = Date.now() - startTime;
    console.log(`Translation completed successfully in ${processingTime}ms`);

    return {
      code: result.targetCode,
      warnings: result.warnings || [],
      stats: {
        sourceLength: sanitizedCode.length,
        targetLength: result.targetCode.length,
        processingTime: processingTime,
        tokensGenerated: result.tokens ? result.tokens.length : 0
      },
      metadata: {
        fromLanguage: fromLang,
        toLanguage: toLang,
        hasAST: !!result.ast,
        hasSymbolTable: !!result.symbolTable
      }
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('Translation Failed:', {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5), // Limit stack trace
      input: {
        from: fromLanguage,
        to: toLanguage,
        codeLength: sourceCode?.length || 0,
        codePreview: sourceCode?.slice(0, 100) || 'N/A'
      },
      system: {
        compilerStatus: compiler ? 'available' : 'not available',
        tokenTypesStatus: TokenTypes ? 'loaded' : 'not loaded',
        tokenTypesCount: TokenTypes ? Object.keys(TokenTypes).length : 0,
        processingTime: processingTime,
        intermediateInstructionStatus: typeof IntermediateInstruction,
        intermediateCodeGeneratorStatus: typeof IntermediateCodeGenerator
      }
    });
    
    // Re-throw with enhanced error message
    throw new Error(`Translation failed: ${error.message}`);
  }
};

export const getSupportedLanguages = () => {
  try {
    if (!compiler) {
      console.warn('Compiler not available for language support check');
      return { 
        error: 'Compiler not initialized',
        available: false,
        message: 'Check server logs for initialization errors'
      };
    }
    
    const languages = compiler.getSupportedLanguages();
    return {
      available: true,
      languages: languages,
      total: Object.keys(languages).length
    };
    
  } catch (error) {
    console.error('Language Support Check Failed:', error);
    return {
      error: error.message,
      available: false,
      languages: {}
    };
  }
};

// Health check function for monitoring
export const getServiceHealth = () => {
  const health = {
    timestamp: new Date().toISOString(),
    compiler: !!compiler,
    tokenTypes: !!TokenTypes,
    intermediateInstruction: !!IntermediateInstruction,
    intermediateCodeGenerator: !!IntermediateCodeGenerator,
    status: 'unknown'
  };
  
  if (!compiler) {
    health.status = 'error';
    health.message = 'Compiler not initialized';
  } else if (!TokenTypes) {
    health.status = 'error';
    health.message = 'TokenTypes not loaded';
  } else if (!IntermediateInstruction) {
    health.status = 'error';
    health.message = 'IntermediateInstruction not loaded';
  } else if (!IntermediateCodeGenerator) {
    health.status = 'error';
    health.message = 'IntermediateCodeGenerator not loaded';
  } else {
    try {
      const languages = compiler.getSupportedLanguages();
      health.status = 'healthy';
      health.supportedLanguages = Object.keys(languages).length;
      health.message = 'All systems operational';
    } catch (error) {
      health.status = 'degraded';
      health.message = `Compiler available but getSupportedLanguages failed: ${error.message}`;
    }
  }
  
  return health;
};