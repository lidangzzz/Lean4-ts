// Lean4 Lexer

import { Token, TokenType, KEYWORDS } from './tokens';

export class LexerError extends Error {
  constructor(message: string, public line: number, public column: number) {
    super(`${message} at line ${line}, column ${column}`);
    this.name = 'LexerError';
  }
}

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    this.tokens = [];
    this.pos = 0;
    this.line = 1;
    this.column = 1;

    while (!this.isAtEnd()) {
      this.scanToken();
    }

    this.addToken(TokenType.EOF, '');
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.pos];
  }

  private peekNext(): string {
    if (this.pos + 1 >= this.source.length) return '\0';
    return this.source[this.pos + 1];
  }

  private peekAhead(n: number): string {
    if (this.pos + n >= this.source.length) return '\0';
    return this.source[this.pos + n];
  }

  private advance(): string {
    const char = this.source[this.pos];
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.pos] !== expected) return false;
    this.advance();
    return true;
  }

  private addToken(type: TokenType, value: string, raw?: string): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - value.length,
      raw
    });
  }

  private scanToken(): void {
    const startLine = this.line;
    const startColumn = this.column;
    const char = this.advance();

    switch (char) {
      // Whitespace
      case ' ':
      case '\r':
      case '\t':
        break;

      case '\n':
        this.addToken(TokenType.NEWLINE, '\n');
        break;

      // Comments
      case '-':
        if (this.match('-')) {
          // Line comment
          if (this.peek() === '-') {
            // Doc comment
            this.advance();
            this.scanDocComment();
          } else {
            this.scanLineComment();
          }
        } else if (this.match('>')) {
          this.addToken(TokenType.ARROW, '->');
        } else {
          this.addToken(TokenType.MINUS, '-');
        }
        break;

      case '/':
        if (this.match('-')) {
          // Block comment start /-
          this.scanBlockComment();
        } else if (this.match('/')) {
          // Line comment
          this.scanLineComment();
        } else if (this.match('*')) {
          // C-style block comment
          this.scanCBlockComment();
        } else {
          this.addToken(TokenType.SLASH, '/');
        }
        break;

      // Operators
      case ':':
        if (this.match('=')) {
          this.addToken(TokenType.ASSIGN, ':=');
        } else if (this.match(':')) {
          this.addToken(TokenType.DCOLON, '::');
        } else {
          this.addToken(TokenType.COLON, ':');
        }
        break;

      case '=':
        if (this.match('>')) {
          this.addToken(TokenType.FAT_ARROW, '=>');
        } else if (this.match('=')) {
          this.addToken(TokenType.EQ, '==');
        } else {
          this.addToken(TokenType.EQ, '=');
        }
        break;

      case '<':
        if (this.match('-')) {
          this.addToken(TokenType.LARROW, '<-');
        } else if (this.match('=')) {
          this.addToken(TokenType.LE, '<=');
        } else if (this.match('<')) {
          this.addToken(TokenType.LANGLE, '<<');
        } else {
          this.addToken(TokenType.LT, '<');
        }
        break;

      case '>':
        if (this.match('=')) {
          this.addToken(TokenType.GE, '>=');
        } else if (this.match('>')) {
          this.addToken(TokenType.RANGLE, '>>');
        } else {
          this.addToken(TokenType.GT, '>');
        }
        break;

      case '!':
        if (this.match('=')) {
          this.addToken(TokenType.NE, '!=');
        } else {
          this.addToken(TokenType.BANG, '!');
        }
        break;

      case '#':
        this.addToken(TokenType.HASH, '#');
        break;

      case '@':
        this.addToken(TokenType.AT, '@');
        break;

      case '?':
        this.addToken(TokenType.QUESTION, '?');
        break;

      case '.':
        this.addToken(TokenType.DOT, '.');
        break;

      case ',':
        this.addToken(TokenType.COMMA, ',');
        break;

      case ';':
        this.addToken(TokenType.SEMI, ';');
        break;

      case '|':
        if (this.match('>')) {
          this.addToken(TokenType.PIPE_FWD, '|>');
        } else if (this.match('|')) {
          this.addToken(TokenType.OR, '||');
        } else {
          this.addToken(TokenType.PIPE, '|');
        }
        break;

      case '+':
        if (this.match('+')) {
          this.addToken(TokenType.APPEND, '++');
        } else {
          this.addToken(TokenType.PLUS, '+');
        }
        break;

      case '*':
        this.addToken(TokenType.STAR, '*');
        break;

      case '%':
        this.addToken(TokenType.PERCENT, '%');
        break;

      // Brackets
      case '(':
        this.addToken(TokenType.LPAREN, '(');
        break;

      case ')':
        this.addToken(TokenType.RPAREN, ')');
        break;

      case '{':
        this.addToken(TokenType.LBRACE, '{');
        break;

      case '}':
        this.addToken(TokenType.RBRACE, '}');
        break;

      case '[':
        this.addToken(TokenType.LBRACKET, '[');
        break;

      case ']':
        this.addToken(TokenType.RBRACKET, ']');
        break;

      case '&':
        if (this.match('&')) {
          this.addToken(TokenType.AND, '&&');
        } else {
          this.addToken(TokenType.LAND, '&');
        }
        break;

      // Strings
      case '"':
        this.scanString();
        break;

      // Characters
      case '\'':
        this.scanChar();
        break;

      // Unicode symbols (common in Lean4)
      case '←':
        this.addToken(TokenType.LARROW2, '←');
        break;
      case '→':
        this.addToken(TokenType.RARROW2, '→');
        break;
      case '↔':
        this.addToken(TokenType.LRARROW, '↔');
        break;
      case '∀':
        this.addToken(TokenType.FORALL2, '∀');
        break;
      case '∃':
        this.addToken(TokenType.EXISTS2, '∃');
        break;
      case 'λ':
        this.addToken(TokenType.LAMBDA, 'λ');
        break;
      case 'Π':
        this.addToken(TokenType.PI, 'Π');
        break;
      case 'Σ':
        this.addToken(TokenType.SUM, 'Σ');
        break;
      case '×':
        this.addToken(TokenType.MULTIPLIER, '×');
        break;
      case '≠':
        this.addToken(TokenType.NE, '≠');
        break;
      case '∧':
        this.addToken(TokenType.LAND, '∧');
        break;
      case '∨':
        this.addToken(TokenType.LOR, '∨');
        break;
      case '¬':
        this.addToken(TokenType.LNOT, '¬');
        break;
      case '∪':
        this.addToken(TokenType.UNION, '∪');
        break;
      case '∩':
        this.addToken(TokenType.INTER, '∩');
        break;
      case '⊆':
        this.addToken(TokenType.SUBSET, '⊆');
        break;
      case '∈':
        this.addToken(TokenType.IN2, '∈');
        break;
      case '∉':
        this.addToken(TokenType.NOTIN, '∉');
        break;
      case '∅':
        this.addToken(TokenType.EMPTYSET, '∅');
        break;
      case '«':
        this.addToken(TokenType.LDQUOTE, '«');
        break;
      case '»':
        this.addToken(TokenType.RDQUOTE, '»');
        break;

      default:
        // Handle unicode middle dot as a hole/placeholder (used in anonymous functions like · ++ ·)
        if (char === '·') {
          this.addToken(TokenType.HOLE, '·');
          break;
        }
        if (this.isDigit(char)) {
          this.scanNumber();
        } else if (this.isAlpha(char) || char === '_') {
          this.scanIdentifier();
        } else if (this.isUnicodeLetter(char)) {
          this.scanUnicodeIdentifier();
        } else {
          throw new LexerError(`Unexpected character: ${char}`, startLine, startColumn);
        }
        break;
    }
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char) || char === '_' || char === '\'' || char === '!';
  }

  private isUnicodeLetter(char: string): boolean {
    const code = char.codePointAt(0) || 0;
    // Basic check for Unicode letters (Greek, mathematical symbols used as identifiers)
    return code > 127 && !'→←∀∃λΠΣ×∧∨¬∪∩⊆∈∉∅«»≠'.includes(char);
  }

  private scanNumber(): void {
    let value = '';

    // Get the first digit that was already consumed by scanToken
    const startPos = this.pos - 1;
    value = this.source[startPos];

    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Handle decimal numbers
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance(); // consume '.'
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    // Handle scientific notation
    if (this.peek() === 'e' || this.peek() === 'E') {
      value += this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        value += this.advance();
      }
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    // Handle type suffixes (Nat, Int, Float, etc.)
    if (this.isAlpha(this.peek())) {
      // Type suffix like 42Nat, 3.14Float
      // For now, just consume as part of the number
    }

    this.addToken(TokenType.NUMBER, value);
  }

  private scanString(): void {
    let value = '';

    while (!this.isAtEnd() && this.peek() !== '"') {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.advance();
        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          case '0': value += '\0'; break;
          case 'x': {
            // Hex escape
            let hex = '';
            for (let i = 0; i < 2 && this.isHexDigit(this.peek()); i++) {
              hex += this.advance();
            }
            value += String.fromCharCode(parseInt(hex, 16));
            break;
          }
          case 'u': {
            // Unicode escape
            let hex = '';
            if (this.peek() === '{') {
              this.advance();
              while (!this.isAtEnd() && this.peek() !== '}') {
                hex += this.advance();
              }
              if (this.peek() === '}') this.advance();
            } else {
              for (let i = 0; i < 4 && this.isHexDigit(this.peek()); i++) {
                hex += this.advance();
              }
            }
            value += String.fromCodePoint(parseInt(hex, 16));
            break;
          }
          default:
            value += escaped;
        }
      } else {
        value += this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw new LexerError('Unterminated string', this.line, this.column);
    }

    this.advance(); // closing "
    this.addToken(TokenType.STRING, value);
  }

  private isHexDigit(char: string): boolean {
    return this.isDigit(char) || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F');
  }

  private scanChar(): void {
    let value = '';

    if (this.peek() === '\\') {
      this.advance();
      const escaped = this.advance();
      switch (escaped) {
        case 'n': value = '\n'; break;
        case 't': value = '\t'; break;
        case 'r': value = '\r'; break;
        case '\\': value = '\\'; break;
        case '\'': value = '\''; break;
        case '0': value = '\0'; break;
        default: value = escaped;
      }
    } else {
      value = this.advance();
    }

    if (this.peek() !== '\'') {
      throw new LexerError('Unterminated character literal', this.line, this.column);
    }

    this.advance(); // closing '
    this.addToken(TokenType.CHAR, value);
  }

  private scanIdentifier(): void {
    let value = '';

    // Get the first character that was already consumed by scanToken
    const startPos = this.pos - 1;
    value = this.source[startPos];

    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    // Handle scientific notation suffixes (like 'e' in 1e10)
    if (this.tokens.length > 0) {
      const lastToken = this.tokens[this.tokens.length - 1];
      if (lastToken.type === TokenType.NUMBER && (value === 'e' || value === 'E')) {
        // This is part of a number, not an identifier
        if (this.peek() === '+' || this.peek() === '-') {
          this.advance();
        }
        while (this.isDigit(this.peek())) {
          value += this.advance();
        }
        lastToken.value += value;
        lastToken.type = TokenType.NUMBER;
        return;
      }
    }

    const type = Object.prototype.hasOwnProperty.call(KEYWORDS, value) ? KEYWORDS[value] : TokenType.IDENT;
    this.addToken(type, value);
  }

  private scanUnicodeIdentifier(): void {
    let value = '';

    // Get the first character that was already consumed by scanToken
    const startPos = this.pos - 1;
    value = this.source[startPos];

    while (!this.isAtEnd()) {
      const char = this.peek();
      if (this.isAlphaNumeric(char) || this.isUnicodeLetter(char)) {
        value += this.advance();
      } else {
        break;
      }
    }

    const type = Object.prototype.hasOwnProperty.call(KEYWORDS, value) ? KEYWORDS[value] : TokenType.IDENT;
    this.addToken(type, value);
  }

  private scanLineComment(): void {
    let value = '';

    while (!this.isAtEnd() && this.peek() !== '\n') {
      value += this.advance();
    }

    this.addToken(TokenType.COMMENT, value.trim());
  }

  private scanDocComment(): void {
    let value = '';

    // Consume additional dashes
    while (this.peek() === '-') {
      value += this.advance();
    }

    // Read the rest of the doc comment
    while (!this.isAtEnd() && this.peek() !== '\n') {
      value += this.advance();
    }

    this.addToken(TokenType.DOCSTRING, value.trim());
  }

  private scanBlockComment(): void {
    let value = '';
    let depth = 1;

    while (!this.isAtEnd() && depth > 0) {
      if (this.peek() === '/' && this.peekNext() === '-') {
        value += this.advance() + this.advance();
        depth++;
      } else if (this.peek() === '-' && this.peekNext() === '/') {
        value += this.advance() + this.advance();
        depth--;
      } else {
        if (this.peek() === '\n') {
          this.line++;
          this.column = 1;
        }
        value += this.advance();
      }
    }

    this.addToken(TokenType.COMMENT, value.trim());
  }

  private scanCBlockComment(): void {
    let value = '';

    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance();
        this.advance();
        break;
      }
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      value += this.advance();
    }

    this.addToken(TokenType.COMMENT, value.trim());
  }
}

export function tokenize(source: string): Token[] {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}
