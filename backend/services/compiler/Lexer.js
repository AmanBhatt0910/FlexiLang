import { TokenTypes } from './tokenTypes.js';

export class Token {
  constructor(type, value, line = 0, column = 0) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `Token(${this.type}, ${this.value}, ${this.line}:${this.column})`;
  }
}

export class LexicalAnalyzer {
  constructor(sourceCode) {
    // Validate TokenTypes at runtime when the class is instantiated
    if (!TokenTypes || typeof TokenTypes !== 'object') {
      throw new Error('TokenTypes not properly loaded or initialized');
    }
    
    console.log(`Lexer initialized with TokenTypes: ${Object.keys(TokenTypes).length} types available`);
    this.source = sourceCode.trim();
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    
    // Language keywords
    this.keywords = new Set([
      'function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do',
      'switch', 'case', 'default', 'break', 'continue', 'return', 'try', 'catch',
      'finally', 'throw', 'class', 'extends', 'import', 'export', 'from',
      'async', 'await', 'true', 'false', 'null', 'undefined', 'new', 'this',
      'super', 'static', 'public', 'private', 'protected', 'abstract', 'interface'
    ]);
  }
  
  getCurrentChar() {
    if (this.position >= this.source.length) return null;
    return this.source[this.position];
  }
  
  peekChar(offset = 1) {
    const pos = this.position + offset;
    if (pos >= this.source.length) return null;
    return this.source[pos];
  }
  
  advance() {
    if (this.position < this.source.length) {
      if (this.source[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }
  
  skipWhitespace() {
    while (this.getCurrentChar() && /\s/.test(this.getCurrentChar()) && this.getCurrentChar() !== '\n') {
      this.advance();
    }
  }
  
  readNumber() {
    let value = '';
    let hasDecimal = false;
    
    while (this.getCurrentChar() && (/\d/.test(this.getCurrentChar()) || this.getCurrentChar() === '.')) {
      if (this.getCurrentChar() === '.') {
        if (hasDecimal) break;
        hasDecimal = true;
      }
      value += this.getCurrentChar();
      this.advance();
    }
    
    return new Token(TokenTypes.NUMBER, hasDecimal ? parseFloat(value) : parseInt(value), this.line, this.column);
  }
  
  readString(quote) {
    let value = '';
    const startLine = this.line;
    const startColumn = this.column;
    this.advance(); // Skip opening quote
    
    while (this.getCurrentChar() && this.getCurrentChar() !== quote) {
      if (this.getCurrentChar() === '\\') {
        this.advance();
        const escaped = this.getCurrentChar();
        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          case "'": value += "'"; break;
          case '`': value += '`'; break;
          default: value += escaped || '';
        }
      } else {
        value += this.getCurrentChar();
      }
      this.advance();
    }
    
    if (this.getCurrentChar() === quote) {
      this.advance(); // Skip closing quote
    }
    
    return new Token(TokenTypes.STRING, value, startLine, startColumn);
  }
  
  readIdentifier() {
    let value = '';
    const startLine = this.line;
    const startColumn = this.column;
    
    while (this.getCurrentChar() && (/[a-zA-Z0-9_$]/.test(this.getCurrentChar()))) {
      value += this.getCurrentChar();
      this.advance();
    }
    
    // Check for boolean literals
    if (value === 'true' || value === 'false') {
      return new Token(TokenTypes.BOOLEAN, value === 'true', startLine, startColumn);
    }
    
    // Check for null and undefined
    if (value === 'null') {
      return new Token(TokenTypes.NULL, null, startLine, startColumn);
    }
    
    if (value === 'undefined') {
      return new Token(TokenTypes.UNDEFINED, undefined, startLine, startColumn);
    }
    
    const type = this.keywords.has(value) ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
    return new Token(type, value, startLine, startColumn);
  }
  
  readComment() {
    let value = '';
    const startLine = this.line;
    const startColumn = this.column;
    
    if (this.getCurrentChar() === '/' && this.peekChar() === '/') {
      // Single line comment
      value += '//';
      this.advance(); this.advance();
      
      while (this.getCurrentChar() && this.getCurrentChar() !== '\n') {
        value += this.getCurrentChar();
        this.advance();
      }
    } else if (this.getCurrentChar() === '/' && this.peekChar() === '*') {
      // Multi-line comment
      value += '/*';
      this.advance(); // Skip /
      this.advance(); // Skip *
      
      while (this.getCurrentChar()) {
        if (this.getCurrentChar() === '*' && this.peekChar() === '/') {
          value += '*/';
          this.advance(); // Skip *
          this.advance(); // Skip /
          break;
        }
        value += this.getCurrentChar();
        this.advance();
      }
    }
    
    return new Token(TokenTypes.COMMENT, value, startLine, startColumn);
  }
  
  async tokenize() {
    console.log(`Starting tokenization of ${this.source.length} characters`);
    
    while (this.position < this.source.length) {
      const char = this.getCurrentChar();
      
      if (!char) break;
      
      // Skip whitespace
      if (/\s/.test(char) && char !== '\n') {
        this.skipWhitespace();
        continue;
      }
      
      // Newlines
      if (char === '\n') {
        this.tokens.push(new Token(TokenTypes.NEWLINE, '\\n', this.line, this.column));
        this.advance();
        continue;
      }
      
      // Numbers
      if (/\d/.test(char)) {
        this.tokens.push(this.readNumber());
        continue;
      }
      
      // Strings
      if (char === '"' || char === "'" || char === '`') {
        this.tokens.push(this.readString(char));
        continue;
      }
      
      // Comments
      if (char === '/' && (this.peekChar() === '/' || this.peekChar() === '*')) {
        this.tokens.push(this.readComment());
        continue;
      }
      
      // Identifiers and keywords
      if (/[a-zA-Z_$]/.test(char)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }
      
      // Three-character operators
      const threeChar = char + (this.peekChar() || '') + (this.peekChar(2) || '');
      if (['===', '!=='].includes(threeChar)) {
        this.tokens.push(new Token(TokenTypes.COMPARISON, threeChar, this.line, this.column));
        this.advance(); this.advance(); this.advance();
        continue;
      }
      
      // Two-character operators
      const twoChar = char + (this.peekChar() || '');
      if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '=>', '<<', '>>', '**'].includes(twoChar)) {
        let type;
        if (['==', '!=', '<=', '>='].includes(twoChar)) {
          type = TokenTypes.COMPARISON;
        } else if (['&&', '||'].includes(twoChar)) {
          type = TokenTypes.LOGICAL;
        } else if (['++', '--'].includes(twoChar)) {
          type = TokenTypes.UNARY;
        } else if (['+=', '-=', '*=', '/=', '%=', '=>'].includes(twoChar)) {
          type = TokenTypes.ASSIGNMENT;
        } else if (['<<', '>>', '**'].includes(twoChar)) {
          type = TokenTypes.ARITHMETIC;
        } else {
          type = TokenTypes.ASSIGNMENT;
        }
        
        this.tokens.push(new Token(type, twoChar, this.line, this.column));
        this.advance(); this.advance();
        continue;
      }
      
      // Single character tokens
      const startLine = this.line;
      const startColumn = this.column;
      
      switch (char) {
        case '(':
          this.tokens.push(new Token(TokenTypes.LPAREN, char, startLine, startColumn));
          break;
        case ')':
          this.tokens.push(new Token(TokenTypes.RPAREN, char, startLine, startColumn));
          break;
        case '{':
          this.tokens.push(new Token(TokenTypes.LBRACE, char, startLine, startColumn));
          break;
        case '}':
          this.tokens.push(new Token(TokenTypes.RBRACE, char, startLine, startColumn));
          break;
        case '[':
          this.tokens.push(new Token(TokenTypes.LBRACKET, char, startLine, startColumn));
          break;
        case ']':
          this.tokens.push(new Token(TokenTypes.RBRACKET, char, startLine, startColumn));
          break;
        case ';':
          this.tokens.push(new Token(TokenTypes.SEMICOLON, char, startLine, startColumn));
          break;
        case ',':
          this.tokens.push(new Token(TokenTypes.COMMA, char, startLine, startColumn));
          break;
        case '.':
          this.tokens.push(new Token(TokenTypes.DOT, char, startLine, startColumn));
          break;
        case '=':
          this.tokens.push(new Token(TokenTypes.ASSIGNMENT, char, startLine, startColumn));
          break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
          this.tokens.push(new Token(TokenTypes.ARITHMETIC, char, startLine, startColumn));
          break;
        case '<':
        case '>':
          this.tokens.push(new Token(TokenTypes.COMPARISON, char, startLine, startColumn));
          break;
        case '!':
          this.tokens.push(new Token(TokenTypes.UNARY, char, startLine, startColumn));
          break;
        case '&':
        case '|':
          this.tokens.push(new Token(TokenTypes.LOGICAL, char, startLine, startColumn));
          break;
        case '?':
          this.tokens.push(new Token(TokenTypes.LOGICAL, char, startLine, startColumn));
          break;
        case ':':
          this.tokens.push(new Token(TokenTypes.ASSIGNMENT, char, startLine, startColumn));
          break;
        default:
          console.warn(`Unknown character encountered: '${char}' at line ${this.line}, column ${this.column}`);
          break;
      }
      
      this.advance();
    }
    
    this.tokens.push(new Token(TokenTypes.EOF, null, this.line, this.column));
    
    console.log(`Tokenization completed. Generated ${this.tokens.length} tokens`);
    console.log('Token summary:', this.getTokenSummary());
    
    return this.tokens;
  }
  
  getTokenSummary() {
    const summary = {};
    this.tokens.forEach(token => {
      summary[token.type] = (summary[token.type] || 0) + 1;
    });
    return summary;
  }
  
  // Static method to validate module loading
  static validateDependencies() {
    if (!TokenTypes || typeof TokenTypes !== 'object') {
      throw new Error('TokenTypes not properly loaded - check TokenConstants.js');
    }
    
    const requiredTokens = [
      'NUMBER', 'STRING', 'BOOLEAN', 'NULL', 'UNDEFINED', 'IDENTIFIER', 
      'KEYWORD', 'ASSIGNMENT', 'ARITHMETIC', 'COMPARISON', 'LOGICAL', 
      'UNARY', 'SEMICOLON', 'COMMA', 'DOT', 'LPAREN', 'RPAREN', 
      'LBRACE', 'RBRACE', 'LBRACKET', 'RBRACKET', 'COMMENT', 
      'NEWLINE', 'EOF', 'WHITESPACE'
    ];
    
    for (const token of requiredTokens) {
      if (!TokenTypes[token]) {
        throw new Error(`Missing required TokenType: ${token}`);
      }
    }
    
    return true;
  }
}

// Export a validation function that can be called after module loading
export const validateLexerDependencies = () => {
  return LexicalAnalyzer.validateDependencies();
};