import { translateCode as performTranslation } from '../services/translationService.js';

export const translateCode = async (req, res) => {
  const { sourceCode, fromLanguage, toLanguage } = req.body;

  if (!sourceCode || !fromLanguage || !toLanguage) {
    return res.status(400).json({
      message: "Missing required fields: sourceCode, fromLanguage, or toLanguage"
    });
  }

  try {
    const translatedCode = performTranslation(sourceCode, fromLanguage, toLanguage);

    if(fromLanguage == toLanguage) {
      return res.status(500).json({
        message: "From and To Language are same"
      })
    }
    
    return res.status(200).json({ 
      translatedCode,
      fromLanguage,
      toLanguage 
    });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      message: "Error during code translation",
      error: error.message
    });
  }
};


