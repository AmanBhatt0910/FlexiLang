import { CrossCompiler } from './compiler/compiler.js';
import { TokenTypes } from './compiler/TokenConstants.js';

// Initialize compiler with safety checks
const compiler = (() => {
  try {
    // Verify critical dependencies before compiler creation
    if (!TokenTypes || typeof TokenTypes !== 'object') {
      throw new Error('Failed to load TokenTypes');
    }
    
    if (!CrossCompiler) {
      throw new Error('Failed to load CrossCompiler');
    }

    const instance = new CrossCompiler();
    
    // Verify compiler initialization
    if (!instance.isConversionSupported || !instance.compile) {
      throw new Error('Compiler methods not properly initialized');
    }
    
    return instance;
  } catch (error) {
    console.error('COMPILER INITIALIZATION FAILED:', error);
    process.exit(1); // Critical failure, exit process
  }
})();

const sanitizeCode = (code) => {
  // Enhanced sanitization with length check
  if (typeof code !== 'string') return '';
  return code.slice(0, 10000) // Limit input size
    .replace(/[^\x20-\x7E]/g, '') // ASCII printable chars only
    .replace(/(`){3,}/g, '') // Remove code block markers
    .trim();
};

export const translateCode = (sourceCode, fromLanguage, toLanguage) => {
  try {
    // Validate input types
    if (typeof sourceCode !== 'string' || 
        typeof fromLanguage !== 'string' || 
        typeof toLanguage !== 'string') {
      throw new Error('Invalid input types');
    }

    const sanitizedCode = sanitizeCode(sourceCode);
    
    if (!sanitizedCode) {
      throw new Error("Input code empty after sanitization");
    }

    // Normalize language names
    const fromLang = fromLanguage.toLowerCase();
    const toLang = toLanguage.toLowerCase();

    const result = compiler.compile(sanitizedCode, fromLang, toLang);
    
    if (!result.success) {
      throw new Error(result.error || "Compilation failed without error message");
    }

    if (!result.targetCode?.trim()) {
      throw new Error("Generated empty target code");
    }

    return {
      code: result.targetCode,
      warnings: result.warnings || [],
      stats: {
        sourceLength: sanitizedCode.length,
        targetLength: result.targetCode.length,
        processingTime: result.processingTime || 0
      }
    };
  } catch (error) {
    console.error('Translation Failed:', {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3),
      input: {
        from: fromLanguage,
        to: toLanguage,
        codePreview: sourceCode?.slice(0, 50)
      }
    });
    throw new Error(`Translation failed: ${error.message}`);
  }
};

export const getSupportedLanguages = () => {
  try {
    return compiler.getSupportedLanguages() || {};
  } catch (error) {
    console.error('Language Support Check Failed:', error);
    return {};
  }
};