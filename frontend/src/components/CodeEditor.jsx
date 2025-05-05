'use client';

import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

const supportedLanguages = {
  javascript: Prism.languages.javascript,
  python: Prism.languages.python,
  java: Prism.languages.java,
  cpp: Prism.languages.cpp,
};

export default function CodeEditor({ code, setCode, language = 'javascript', placeholder }) {
  const prismLang = supportedLanguages[language] || Prism.languages.javascript;

  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <Editor
        value={code}
        onValueChange={setCode}
        highlight={(code) => Prism.highlight(code, prismLang, language)}
        padding={10}
        className="font-mono text-sm min-h-[200px] outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
