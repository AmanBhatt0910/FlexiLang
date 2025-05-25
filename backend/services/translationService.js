import { jsToJava, jsToC, jsToPython, pythonToJs, pythonToJava, pythonToC, javaToC, javaToPython, cToJava, cToPython, cToJS } from './codeTranslators/index.js';

export const translateCode = (sourceCode, fromLanguage, toLanguage) => {
  const translationKey = `${fromLanguage}To${capitalize(toLanguage)}`;
  console.log(translationKey);
  
  const translators = {
    javascriptToJava: jsToJava,
    javascriptToC: jsToC,
    javascriptToPython: jsToPython,
    pythonToJavascript: pythonToJs,
    pythonToJava: pythonToJava,
    pythonToC: pythonToC,
    javaToC: javaToC,
    javaToPython: javaToPython,
    javascriptToJava: jsToJava,
    cToJava: cToJava,
    cToPython: cToPython,
    cToJavascript: cToJS
  };

  const translator = translators[translationKey];
  
  if (!translator) {
    throw new Error(`Translation from ${fromLanguage} to ${toLanguage} is not supported`);
  }
  
  return translator(sourceCode);
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);