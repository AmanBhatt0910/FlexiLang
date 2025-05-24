import { javaToJs, jsToPython, pythonToJs } from './codeTranslators/index.js';

export const translateCode = (sourceCode, fromLanguage, toLanguage) => {
  const translationKey = `${fromLanguage}To${capitalize(toLanguage)}`;
  console.log(translationKey);
  
  const translators = {
    javascriptToPython: jsToPython,
    pythonToJavascript: pythonToJs,
    javaToJavascript: javaToJs,
  };

  const translator = translators[translationKey];
  
  if (!translator) {
    throw new Error(`Translation from ${fromLanguage} to ${toLanguage} is not supported`);
  }
  
  return translator(sourceCode);
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);