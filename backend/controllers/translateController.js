export const translateCode = (req, res) => {
  const { sourceCode, fromLanguage, toLanguage } = req.body;

  if (fromLanguage === 'javascript' && toLanguage === 'python') {
    const translatedCode = jsToPython(sourceCode);
    return res.status(200).json({ translatedCode });
  }

  return res.status(400).json({
    message: "Translation between the specified languages is not supported."
  });
};


// By GPT, Please study it (Sneha, Vartika, Tanisha)

function jsToPython(code) {
  const lines = code.split('\n');
  const translated = lines.map(line => {
    let trimmed = line.trim();

    // Convert variable declarations
    if (/^(let|const|var)\s+/.test(trimmed)) {
      return trimmed
        .replace(/(let|const|var)\s+/, '')
        .replace(/;/g, '');
    }

    // Convert console.log to print
    if (/console\.log\(/.test(trimmed)) {
      return trimmed.replace(/console\.log\((.*)\);?/, 'print($1)');
    }

    // If condition
    if (/if\s*\((.*)\)\s*\{?/.test(trimmed)) {
      const condition = trimmed.match(/if\s*\((.*)\)/)[1];
      return `if ${condition}:`;
    }

    // Else if
    if (/else if\s*\((.*)\)\s*\{?/.test(trimmed)) {
      const condition = trimmed.match(/else if\s*\((.*)\)/)[1];
      return `elif ${condition}:`;
    }

    // Else
    if (/else\s*\{?/.test(trimmed)) {
      return 'else:';
    }

    // Return unchanged
    return trimmed;
  });

  return translated.join('\n');
}