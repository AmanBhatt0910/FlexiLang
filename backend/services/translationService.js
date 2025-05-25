import { CrossCompiler } from './compiler/compiler.js';

const compiler = new CrossCompiler();

const sanitizeCode = (code) => code.replace(/[^\x20-\x7E]/g, '');

export const translateCode = (sourceCode, fromLanguage, toLanguage) => {
  const sanitizedCode = sanitizeCode(sourceCode);
  
  if (!sanitizedCode.trim()) {
    throw new Error("Empty code after sanitization");
  }

  const result = compiler.compile(sanitizedCode, fromLanguage, toLanguage);
  
  if (!result.success || !result.targetCode) {
    throw new Error(result.error || "Unknown compilation error");
  }

  return result.targetCode;
};

export const getSupportedLanguages = () => compiler.getSupportedLanguages();