import { translateCode as performTranslation } from '../services/translationService.js';
import { IntermediateInstruction } from '../services/compiler/intermediateCodeGenerator.js';

const MAX_CODE_LENGTH = 10000;
const VALID_LANGUAGES = new Set(['javascript', 'python', 'java', 'c']);

export const translateCode = async (req, res) => {
  const { sourceCode, fromLanguage, toLanguage } = req.body;
  
  // Validate payload size first
  if (sourceCode?.length > MAX_CODE_LENGTH) {
    return res.status(413).json({
      message: `Source code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
      errorCode: 'PAYLOAD_TOO_LARGE'
    });
  }

  // Validate required fields
  const errors = [];
  if (!sourceCode) errors.push('sourceCode');
  if (!fromLanguage) errors.push('fromLanguage');
  if (!toLanguage) errors.push('toLanguage');
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${errors.join(', ')}`,
      errorCode: 'MISSING_FIELDS'
    });
  }

  // Validate language formats
  if (fromLanguage === toLanguage) {
    return res.status(400).json({
      message: "Source and target languages must be different",
      errorCode: 'SAME_LANGUAGES'
    });
  }

  if (!VALID_LANGUAGES.has(fromLanguage.toLowerCase()) || !VALID_LANGUAGES.has(toLanguage.toLowerCase())) {
    return res.status(400).json({
      message: "Invalid language specification",
      errorCode: 'INVALID_LANGUAGE'
    });
  }

  try {
    const translatedCode = await performTranslation(sourceCode, fromLanguage.toLowerCase(), toLanguage.toLowerCase());
    
    return res.status(200).json({ 
      translatedCode,
      fromLanguage,
      toLanguage 
    });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      message: "Error during code translation",
      errorCode: 'TRANSLATION_FAILED',
      error: error.message
    });
  }
};