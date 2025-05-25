import { TokenTypes } from "./Constants.js";

export class Token {
  constructor(type, value, line = 0, column = 0) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
}

export class LexicalAnalyzer {
  constructor(sourceCode) {
    this.source = sourceCode;
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
    
    return new Token(TokenTypes.NUMBER, parseFloat(value), this.line, this.column);
  }
  
  readString(quote) {
    let value = '';
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
          default: value += escaped;
        }
      } else {
        value += this.getCurrentChar();
      }
      this.advance();
    }
    
    if (this.getCurrentChar() === quote) {
      this.advance(); // Skip closing quote
    }
    
    return new Token(TokenTypes.STRING, value, this.line, this.column);
  }
  
  readIdentifier() {
    let value = '';
    
    while (this.getCurrentChar() && (/[a-zA-Z0-9_$]/.test(this.getCurrentChar()))) {
      value += this.getCurrentChar();
      this.advance();
    }
    
    const type = this.keywords.has(value) ? TokenTypes.KEYWORD : TokenTypes.IDENTIFIER;
    return new Token(type, value, this.line, this.column);
  }
  
  readComment() {
    let value = '';
    
    if (this.getCurrentChar() === '/' && this.peekChar() === '/') {
      // Single line comment
      while (this.getCurrentChar() && this.getCurrentChar() !== '\n') {
        value += this.getCurrentChar();
        this.advance();
      }
    } else if (this.getCurrentChar() === '/' && this.peekChar() === '*') {
      // Multi-line comment
      this.advance(); // Skip /
      this.advance(); // Skip *
      
      while (this.getCurrentChar()) {
        if (this.getCurrentChar() === '*' && this.peekChar() === '/') {
          this.advance(); // Skip *
          this.advance(); // Skip /
          break;
        }
        value += this.getCurrentChar();
        this.advance();
      }
    }
    
    return new Token(TokenTypes.COMMENT, value, this.line, this.column);
  }
  
  tokenize() {
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
        this.tokens.push(new Token(TokenTypes.NEWLINE, char, this.line, this.column));
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
      
      // Two-character operators
      const twoChar = char + (this.peekChar() || '');
      if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '=>', '===', '!=='].includes(twoChar)) {
        const type = ['==', '!=', '<=', '>=', '===', '!=='].includes(twoChar) ? TokenTypes.COMPARISON :
                    ['&&', '||'].includes(twoChar) ? TokenTypes.LOGICAL :
                    ['++', '--'].includes(twoChar) ? TokenTypes.UNARY :
                    '=>' === twoChar ? TokenTypes.ASSIGNMENT :
                    TokenTypes.ASSIGNMENT;
        
        this.tokens.push(new Token(type, twoChar, this.line, this.column));
        this.advance();
        this.advance();
        continue;
      }
      
      // Single character tokens
      switch (char) {
        case '(':
          this.tokens.push(new Token(TokenTypes.LPAREN, char, this.line, this.column));
          break;
        case ')':
          this.tokens.push(new Token(TokenTypes.RPAREN, char, this.line, this.column));
          break;
        case '{':
          this.tokens.push(new Token(TokenTypes.LBRACE, char, this.line, this.column));
          break;
        case '}':
          this.tokens.push(new Token(TokenTypes.RBRACE, char, this.line, this.column));
          break;
        case '[':
          this.tokens.push(new Token(TokenTypes.LBRACKET, char, this.line, this.column));
          break;
        case ']':
          this.tokens.push(new Token(TokenTypes.RBRACKET, char, this.line, this.column));
          break;
        case ';':
          this.tokens.push(new Token(TokenTypes.SEMICOLON, char, this.line, this.column));
          break;
        case ',':
          this.tokens.push(new Token(TokenTypes.COMMA, char, this.line, this.column));
          break;
        case '.':
          this.tokens.push(new Token(TokenTypes.DOT, char, this.line, this.column));
          break;
        case '=':
          this.tokens.push(new Token(TokenTypes.ASSIGNMENT, char, this.line, this.column));
          break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
          this.tokens.push(new Token(TokenTypes.ARITHMETIC, char, this.line, this.column));
          break;
        case '<':
        case '>':
          this.tokens.push(new Token(TokenTypes.COMPARISON, char, this.line, this.column));
          break;
        case '!':
          this.tokens.push(new Token(TokenTypes.UNARY, char, this.line, this.column));
          break;
        default:
          // Unknown character - could throw error or ignore
          break;
      }
      
      this.advance();
    }
    
    this.tokens.push(new Token(TokenTypes.EOF, null, this.line, this.column));
    return this.tokens;
  }
}

if (!TokenTypes) {
  throw new Error('TokenTypes not initialized');
}

if (!LexicalAnalyzer) {
  throw new Error('LexicalAnalyzer not initialized');
}