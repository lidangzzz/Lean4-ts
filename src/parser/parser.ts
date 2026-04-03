// Lean4 Parser

import { Token, TokenType } from '../lexer/tokens';
import { tokenize } from '../lexer/lexer';
import * as AST from './ast';

export class ParseError extends Error {
  constructor(message: string, public token: Token) {
    super(`${message} at line ${token.line}, column ${token.column}`);
    this.name = 'ParseError';
  }
}

export class Parser {
  private tokens: Token[] = [];
  private pos: number = 0;
  // Map from constructor name to inductive type name (for .name resolution)
  private inductiveCtors: Map<string, string> = new Map();
  // Track if we're parsing a single-line expression (to stop at newlines in lambda bodies)
  private singleLineMode: boolean = false;
  private singleLineStart: number = 0;
  // Track minimum indentation level for the current expression context
  // Used to stop parsing when we see a token at or before this column after a newline
  private minIndentColumn: number = 0;

  parse(source: string): AST.Module {
    this.tokens = tokenize(source);
    this.pos = 0;
    this.inductiveCtors = new Map();

    // First pass: collect inductive type constructors for .name resolution
    this.collectInductiveCtors();

    // Reset for main parsing
    this.pos = 0;

    const decls: AST.Decl[] = [];

    while (!this.isAtEnd()) {
      this.skipNewlines();
      if (this.isAtEnd()) break;

      const decl = this.parseDecl();
      if (decl) {
        decls.push(decl);
      }
    }

    return AST.module_(decls);
  }

  // First pass to collect inductive constructors
  private collectInductiveCtors(): void {
    let savedPos = this.pos;

    while (!this.isAtEnd()) {
      this.skipNewlines();
      if (this.isAtEnd()) break;

      if (this.match(TokenType.INDUCTIVE)) {
        // Get type name
        const typeName = this.check(TokenType.IDENT) ? this.advance().value : '';

        // Skip params/type annotation until we hit 'where'
        while (!this.checkAny(TokenType.WHERE, TokenType.EOF)) {
          this.advance();
        }

        // Skip 'where'
        if (this.match(TokenType.WHERE)) {
          // skip
        }

        // Parse constructors - skip newlines between constructors
        while (true) {
          this.skipNewlines();
          if (!this.match(TokenType.PIPE)) break;

          if (this.check(TokenType.IDENT) || this.isKeywordAsIdent()) {
            const ctorName = this.advance().value;
            // Register this constructor with its type
            this.inductiveCtors.set(ctorName, typeName);
            this.inductiveCtors.set(`${typeName}.${ctorName}`, typeName);

            // Skip rest of constructor definition until PIPE, NEWLINE, or EOF
            while (!this.checkAny(TokenType.PIPE, TokenType.EOF, TokenType.NEWLINE)) {
              this.advance();
            }
          }
        }
      } else {
        this.advance();
      }
    }

    // Restore position
    this.pos = savedPos;
  }

  private isAtEnd(): boolean {
    return this.current().type === TokenType.EOF;
  }

  private current(): Token {
    return this.tokens[this.pos] || this.tokens[this.tokens.length - 1];
  }

  private peek(offset: number = 0): Token {
    const idx = this.pos + offset;
    return this.tokens[idx] || this.tokens[this.tokens.length - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.pos++;
    }
    return this.tokens[this.pos - 1];
  }

  private check(type: TokenType): boolean {
    return this.current().type === type;
  }

  private checkAny(...types: TokenType[]): boolean {
    return types.includes(this.current().type);
  }

  // Check if current token is a keyword that can be used as an identifier (for constructor names)
  private isKeywordAsIdent(): boolean {
    const t = this.current().type;
    return t === TokenType.VARIABLE || t === TokenType.RETURN || t === TokenType.IN ||
           t === TokenType.WHERE || t === TokenType.WITH || t === TokenType.THEN ||
           t === TokenType.ELSE || t === TokenType.TYPE || t === TokenType.SORT ||
           t === TokenType.PROP || t === TokenType.HAVE || t === TokenType.SHOW ||
           t === TokenType.CLASS || t === TokenType.STRUCTURE || t === TokenType.FUN ||
           t === TokenType.MATCH || t === TokenType.IF || t === TokenType.LET ||
           t === TokenType.DO || t === TokenType.FORALL || t === TokenType.FORALL2 ||
           t === TokenType.EXISTS || t === TokenType.EXISTS2;
  }

  // Check if token at offset is a keyword that can be used as an identifier
  private isKeywordAsIdentAt(offset: number): boolean {
    const token = this.peek(offset);
    const t = token.type;
    return t === TokenType.VARIABLE || t === TokenType.RETURN || t === TokenType.IN ||
           t === TokenType.WHERE || t === TokenType.WITH || t === TokenType.THEN ||
           t === TokenType.ELSE || t === TokenType.TYPE || t === TokenType.SORT ||
           t === TokenType.PROP || t === TokenType.HAVE || t === TokenType.SHOW ||
           t === TokenType.CLASS || t === TokenType.STRUCTURE || t === TokenType.FUN ||
           t === TokenType.MATCH || t === TokenType.IF || t === TokenType.LET ||
           t === TokenType.DO || t === TokenType.FORALL || t === TokenType.FORALL2 ||
           t === TokenType.EXISTS || t === TokenType.EXISTS2;
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private expect(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new ParseError(message, this.current());
  }

  private skipNewlines(): void {
    while (this.match(TokenType.NEWLINE)) {}
  }

  private skipNewlinesAndComments(): void {
    while (this.match(TokenType.NEWLINE) || this.match(TokenType.COMMENT) || this.match(TokenType.DOCSTRING)) {}
  }

  // Skip termination_by and decreasing_by blocks (we don't fully support them yet)
  private skipTerminationAndDecreasingBlocks(): void {
    this.skipNewlinesAndComments();

    // Skip termination_by block
    if (this.check(TokenType.IDENT) && this.current().value === 'termination_by') {
      this.advance(); // consume 'termination_by'
      this.skipNewlinesAndComments();

      // Skip until we hit decreasing_by or a new definition/declaration
      while (!this.isAtEnd() &&
             !(this.check(TokenType.IDENT) && this.current().value === 'decreasing_by') &&
             !this.checkAny(TokenType.DEF, TokenType.THEOREM, TokenType.AXIOM, TokenType.CONSTANT,
                           TokenType.INDUCTIVE, TokenType.STRUCTURE, TokenType.CLASS, TokenType.INSTANCE,
                           TokenType.NAMESPACE, TokenType.END, TokenType.VARIABLE, TokenType.UNIVERSAL,
                           TokenType.IMPORT, TokenType.OPEN, TokenType.PRIVATE, TokenType.PROTECTED)) {
        this.advance();
        this.skipNewlinesAndComments();
      }
    }

    this.skipNewlinesAndComments();

    // Skip decreasing_by block
    if (this.check(TokenType.IDENT) && this.current().value === 'decreasing_by') {
      this.advance(); // consume 'decreasing_by'
      this.skipNewlinesAndComments();

      // Skip until we hit a new definition/declaration
      while (!this.isAtEnd() &&
             !this.checkAny(TokenType.DEF, TokenType.THEOREM, TokenType.AXIOM, TokenType.CONSTANT,
                           TokenType.INDUCTIVE, TokenType.STRUCTURE, TokenType.CLASS, TokenType.INSTANCE,
                           TokenType.NAMESPACE, TokenType.END, TokenType.VARIABLE, TokenType.UNIVERSAL,
                           TokenType.IMPORT, TokenType.OPEN, TokenType.PRIVATE, TokenType.PROTECTED)) {
        this.advance();
        this.skipNewlinesAndComments();
      }
    }
  }

  private loc(): AST.SourceLocation {
    const token = this.current();
    return { line: token.line, column: token.column };
  }

  private prev(): Token {
    return this.tokens[this.pos - 1];
  }

  // Declarations
  private parseDecl(): AST.Decl | null {
    this.skipNewlinesAndComments();

    // Check for docstring
    let docstring: string | undefined;
    if (this.check(TokenType.DOCSTRING)) {
      docstring = this.advance().value;
      this.skipNewlinesAndComments();
    }

    // Check for modifiers
    let isPrivate = false;
    let isProtected = false;
    let isPartial = false;

    if (this.match(TokenType.PRIVATE)) {
      isPrivate = true;
      this.skipNewlinesAndComments();
    } else if (this.match(TokenType.PROTECTED)) {
      isProtected = true;
      this.skipNewlinesAndComments();
    }

    // Check for partial modifier
    if (this.match(TokenType.PARTIAL)) {
      isPartial = true;
      this.skipNewlinesAndComments();
    }

    switch (this.current().type) {
      case TokenType.DEF:
        return this.parseDef(docstring, isPrivate, isProtected, isPartial);
      case TokenType.THEOREM:
        return this.parseTheorem(docstring);
      case TokenType.AXIOM:
        return this.parseAxiom(docstring);
      case TokenType.CONSTANT:
        return this.parseConstant(docstring);
      case TokenType.INDUCTIVE:
        return this.parseInductive(docstring);
      case TokenType.STRUCTURE:
        return this.parseStructure(docstring);
      case TokenType.CLASS:
        return this.parseClass(docstring);
      case TokenType.INSTANCE:
        return this.parseInstance(docstring);
      case TokenType.NAMESPACE:
        return this.parseNamespace();
      case TokenType.END:
        return null;
      case TokenType.VARIABLE:
        return this.parseVariable();
      case TokenType.UNIVERSAL:
        return this.parseUniverse();
      case TokenType.IMPORT:
        return this.parseImport();
      case TokenType.OPEN:
        return this.parseOpen();
      default:
        // Try to parse as expression statement or skip
        if (this.current().type !== TokenType.EOF) {
          this.advance();
        }
        return null;
    }
  }

  private parseDef(docstring?: string, isPrivate: boolean = false, isProtected: boolean = false, isPartial: boolean = false): AST.DefDecl {
    this.expect(TokenType.DEF, "Expected 'def'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    // Parse parameters - can be binders or patterns for pattern-matching style
    const params = this.parseBinders();
    this.skipNewlinesAndComments();

    let type: AST.Expr | undefined;
    if (this.match(TokenType.COLON)) {
      this.skipNewlinesAndComments();
      type = this.parseExpr();
      this.skipNewlinesAndComments();
    }

    // Check for pattern-matching style definition (with | patterns)
    if (this.match(TokenType.PIPE)) {
      // Pattern-matching style definition
      const cases: { patterns: AST.Pattern[], body: AST.Expr }[] = [];
      // Track the starting column of the pattern-matching block for indentation-aware parsing
      const patternStartColumn = this.current().column;

      do {
        this.skipNewlinesAndComments();
        const patterns: AST.Pattern[] = [];

        // Parse patterns until we hit =>
        while (!this.checkAny(TokenType.FAT_ARROW, TokenType.ARROW)) {
          const pattern = this.parsePattern();
          patterns.push(pattern);
          this.skipNewlinesAndComments();
          // Skip comma between patterns
          if (this.match(TokenType.COMMA)) {
            this.skipNewlinesAndComments();
          }
          if (this.checkAny(TokenType.FAT_ARROW, TokenType.ARROW)) break;
        }

        // Consume =>
        if (this.match(TokenType.FAT_ARROW) || this.match(TokenType.ARROW)) {
          this.skipNewlinesAndComments();
        }

        // Use indent-aware parsing for the body
        const body = this.parseExprWithIndentStop(patternStartColumn);
        cases.push({ patterns, body });
        this.skipNewlinesAndComments();
      } while (this.match(TokenType.PIPE));

      // Convert pattern-matching definition to a match expression
      // def f | p1 => e1 | p2 => e2  =>  def f := fun args => match args with | p1 => e1 | p2 => e2
      if (cases.length > 0) {
        // Create a function with pattern matching
        let value: AST.Expr;
        if (params.length > 0 || cases[0].patterns.length > 0) {
          // Build match expression
          const matchCases: AST.MatchCase[] = cases.map((c, idx) => ({
            pattern: c.patterns.length === 1 ? c.patterns[0] : { kind: 'tuple', elements: c.patterns, loc: this.loc() },
            body: c.body,
            loc: this.loc()
          }));

          // For pattern-matching defs, the patterns are on the parameters
          // Create a tuple match if multiple patterns
          if (cases[0].patterns.length === 1) {
            // Single parameter match
            const paramName = params.length > 0 ? params[0].name : '_arg';
            value = {
              kind: 'fun',
              params: params.length > 0 ? params : [{ name: paramName, type: undefined, implicit: false, instImplicit: false, strictImplicit: false }],
              body: {
                kind: 'match',
                scrutinee: { kind: 'ident', name: paramName, loc: this.loc() },
                cases: matchCases,
                loc: this.loc()
              },
              loc: this.loc()
            };
          } else {
            // Multiple parameters - create nested lambdas
            const paramNames = params.length > 0 ? params.map(p => p.name) : cases[0].patterns.map((_, i) => `_arg${i}`);
            value = {
              kind: 'fun',
              params: params.length > 0 ? params : paramNames.map(n => ({ name: n, type: undefined, implicit: false, instImplicit: false, strictImplicit: false })),
              body: {
                kind: 'match',
                scrutinee: paramNames.length === 1
                  ? { kind: 'ident', name: paramNames[0], loc: this.loc() }
                  : { kind: 'tuple', elements: paramNames.map(n => ({ kind: 'ident', name: n, loc: this.loc() })), loc: this.loc() },
                cases: matchCases,
                loc: this.loc()
              },
              loc: this.loc()
            };
          }
        } else {
          value = cases[0].body;
        }

        this.skipTerminationAndDecreasingBlocks();
        return {
          kind: 'def',
          name,
          params: [],
          type,
          value,
          recursive: false,
          docstring,
          private: isPrivate,
          protected: isProtected,
          loc: this.loc()
        };
      }
    }

    this.expect(TokenType.ASSIGN, "Expected ':='");
    this.skipNewlinesAndComments();

    const value = this.parseExpr();

    this.skipTerminationAndDecreasingBlocks();
    return {
      kind: 'def',
      name,
      params,
      type,
      value,
      recursive: false,
      docstring,
      private: isPrivate,
      protected: isProtected,
      loc: this.loc()
    };
  }

  private parseTheorem(docstring?: string): AST.TheoremDecl {
    this.expect(TokenType.THEOREM, "Expected 'theorem'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    const params = this.parseBinders();
    this.skipNewlinesAndComments();

    this.expect(TokenType.COLON, "Expected ':'");
    this.skipNewlinesAndComments();

    const type = this.parseExpr();
    this.skipNewlinesAndComments();

    this.expect(TokenType.ASSIGN, "Expected ':='");
    this.skipNewlinesAndComments();

    const proof = this.parseExpr();

    return {
      kind: 'theorem',
      name,
      params,
      type,
      proof,
      docstring,
      loc: this.loc()
    };
  }

  private parseAxiom(docstring?: string): AST.AxiomDecl {
    this.expect(TokenType.AXIOM, "Expected 'axiom'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    const params = this.parseBinders();
    this.skipNewlinesAndComments();

    this.expect(TokenType.COLON, "Expected ':'");
    this.skipNewlinesAndComments();

    const type = this.parseExpr();

    return {
      kind: 'axiom',
      name,
      params,
      type,
      docstring,
      loc: this.loc()
    };
  }

  private parseConstant(docstring?: string): AST.ConstantDecl {
    this.expect(TokenType.CONSTANT, "Expected 'constant'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    const params = this.parseBinders();
    this.skipNewlinesAndComments();

    this.expect(TokenType.COLON, "Expected ':'");
    this.skipNewlinesAndComments();

    const type = this.parseExpr();

    return {
      kind: 'constant',
      name,
      params,
      type,
      docstring,
      loc: this.loc()
    };
  }

  private parseInductive(docstring?: string): AST.InductiveDecl {
    this.expect(TokenType.INDUCTIVE, "Expected 'inductive'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    const params = this.parseBinders();
    this.skipNewlinesAndComments();

    let type: AST.Expr | undefined;
    if (this.match(TokenType.COLON)) {
      this.skipNewlinesAndComments();
      type = this.parseExpr();
      this.skipNewlinesAndComments();
    }

    if (this.match(TokenType.WHERE)) {
      this.skipNewlinesAndComments();
    }

    const ctors: AST.Constructor[] = [];

    while (!this.isAtEnd() && !this.checkAny(TokenType.END, TokenType.NAMESPACE, TokenType.DEF, TokenType.THEOREM, TokenType.INDUCTIVE, TokenType.STRUCTURE)) {
      this.skipNewlinesAndComments();
      if (this.isAtEnd()) break;

      let ctorDocstring: string | undefined;
      if (this.check(TokenType.DOCSTRING)) {
        ctorDocstring = this.advance().value;
        this.skipNewlinesAndComments();
      }

      if (this.match(TokenType.PIPE)) {
        this.skipNewlinesAndComments();
        // Constructor name can be an identifier or a keyword (like 'fun', 'variable', etc.)
        let ctorName: string;
        if (this.check(TokenType.IDENT)) {
          ctorName = this.advance().value;
        } else if (this.checkAny(
          TokenType.FUN, TokenType.MATCH, TokenType.IF, TokenType.LET, TokenType.DO,
          TokenType.FORALL, TokenType.FORALL2, TokenType.EXISTS, TokenType.EXISTS2,
          TokenType.VARIABLE, TokenType.RETURN, TokenType.IN, TokenType.WHERE,
          TokenType.WITH, TokenType.THEN, TokenType.ELSE, TokenType.TYPE, TokenType.SORT,
          TokenType.PROP, TokenType.HAVE, TokenType.SHOW, TokenType.CLASS, TokenType.STRUCTURE
        )) {
          ctorName = this.advance().value;
        } else {
          throw new ParseError("Expected constructor name", this.current());
        }
        this.skipNewlinesAndComments();

        const ctorParams: AST.Binder[] = [];
        let ctorType: AST.Expr | undefined;

        // Parse constructor arguments
        while (!this.check(TokenType.NEWLINE) && !this.check(TokenType.PIPE) && !this.isAtEnd() &&
               !this.check(TokenType.END) && !this.check(TokenType.DEF)) {
          if (this.check(TokenType.COLON)) {
            this.advance();
            this.skipNewlinesAndComments();
            ctorType = this.parseExpr();
            break;
          } else {
            const param = this.parseBinder();
            if (param) {
              ctorParams.push(param);
            } else {
              break;
            }
          }
          this.skipNewlinesAndComments();
        }

        ctors.push({
          name: ctorName,
          params: ctorParams,
          type: ctorType,
          docstring: ctorDocstring
        });
      } else {
        break;
      }
    }

    return {
      kind: 'inductive',
      name,
      params,
      type,
      ctors,
      docstring,
      loc: this.loc()
    };
  }

  private parseStructure(docstring?: string): AST.StructureDecl {
    this.expect(TokenType.STRUCTURE, "Expected 'structure'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    const params = this.parseBinders();
    this.skipNewlinesAndComments();

    let extends_: string[] | undefined;
    if (this.match(TokenType.EXTENDS)) {
      this.skipNewlinesAndComments();
      extends_ = [];
      do {
        extends_.push(this.expect(TokenType.IDENT, "Expected identifier").value);
        this.skipNewlinesAndComments();
      } while (this.match(TokenType.COMMA));
    }

    if (this.match(TokenType.WHERE)) {
      this.skipNewlinesAndComments();
    }

    const fields: AST.Field[] = [];

    while (!this.isAtEnd() && !this.checkAny(TokenType.END, TokenType.NAMESPACE, TokenType.DEF, TokenType.THEOREM, TokenType.INDUCTIVE, TokenType.STRUCTURE)) {
      this.skipNewlinesAndComments();
      if (this.isAtEnd()) break;

      let fieldDocstring: string | undefined;
      if (this.check(TokenType.DOCSTRING)) {
        fieldDocstring = this.advance().value;
        this.skipNewlinesAndComments();
      }

      if (this.check(TokenType.IDENT)) {
        const fieldName = this.advance().value;
        this.skipNewlinesAndComments();

        this.expect(TokenType.COLON, "Expected ':'");
        this.skipNewlinesAndComments();

        const fieldType = this.parseExpr();
        this.skipNewlinesAndComments();

        let fieldDefault: AST.Expr | undefined;
        if (this.match(TokenType.ASSIGN)) {
          this.skipNewlinesAndComments();
          fieldDefault = this.parseExpr();
        }

        fields.push({
          name: fieldName,
          type: fieldType,
          default: fieldDefault,
          docstring: fieldDocstring
        });
      } else {
        break;
      }
    }

    return {
      kind: 'structure',
      name,
      params,
      extends: extends_,
      fields,
      docstring,
      loc: this.loc()
    };
  }

  private parseClass(docstring?: string): AST.ClassDecl {
    this.expect(TokenType.CLASS, "Expected 'class'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    const params = this.parseBinders();
    this.skipNewlinesAndComments();

    let extends_: string[] | undefined;
    if (this.current().value === 'extends') {
      this.advance();
      this.skipNewlinesAndComments();
      extends_ = [];
      do {
        extends_.push(this.expect(TokenType.IDENT, "Expected identifier").value);
        this.skipNewlinesAndComments();
      } while (this.match(TokenType.COMMA));
    }

    if (this.match(TokenType.WHERE)) {
      this.skipNewlinesAndComments();
    }

    const fields: AST.Field[] = [];

    while (!this.isAtEnd() && !this.checkAny(TokenType.END, TokenType.NAMESPACE, TokenType.DEF)) {
      this.skipNewlinesAndComments();
      if (this.isAtEnd()) break;

      let fieldDocstring: string | undefined;
      if (this.check(TokenType.DOCSTRING)) {
        fieldDocstring = this.advance().value;
        this.skipNewlinesAndComments();
      }

      if (this.check(TokenType.IDENT)) {
        const fieldName = this.advance().value;
        this.skipNewlinesAndComments();

        this.expect(TokenType.COLON, "Expected ':'");
        this.skipNewlinesAndComments();

        const fieldType = this.parseExpr();

        fields.push({
          name: fieldName,
          type: fieldType,
          docstring: fieldDocstring
        });
      } else {
        break;
      }
    }

    return {
      kind: 'class',
      name,
      params,
      extends: extends_,
      fields,
      docstring,
      loc: this.loc()
    };
  }

  private parseInstance(docstring?: string): AST.InstanceDecl {
    this.expect(TokenType.INSTANCE, "Expected 'instance'");
    this.skipNewlinesAndComments();

    let name: string | undefined;
    if (this.check(TokenType.IDENT)) {
      name = this.advance().value;
      this.skipNewlinesAndComments();
    }

    const params = this.parseBinders();
    this.skipNewlinesAndComments();

    this.expect(TokenType.COLON, "Expected ':'");
    this.skipNewlinesAndComments();

    const type = this.parseExpr();
    this.skipNewlinesAndComments();

    // Check for 'where' syntax (instance : Type where field := value ...)
    if (this.match(TokenType.WHERE)) {
      this.skipNewlinesAndComments();

      const fields: { name: string; value: AST.Expr }[] = [];

      while (!this.isAtEnd() && !this.checkAny(TokenType.END, TokenType.NAMESPACE, TokenType.DEF, TokenType.THEOREM, TokenType.INSTANCE, TokenType.INDUCTIVE, TokenType.STRUCTURE, TokenType.CLASS)) {
        this.skipNewlinesAndComments();
        if (this.isAtEnd()) break;

        if (this.check(TokenType.IDENT)) {
          const fieldName = this.advance().value;
          this.skipNewlinesAndComments();

          this.expect(TokenType.ASSIGN, "Expected ':='");
          this.skipNewlinesAndComments();

          const fieldValue = this.parseExpr();
          this.skipNewlinesAndComments();

          fields.push({ name: fieldName, value: fieldValue });
        } else {
          break;
        }
      }

      // Create a struct literal as the value
      const value: AST.Expr = { kind: 'structLit', fields, loc: this.loc() };

      return {
        kind: 'instance',
        name,
        params,
        type,
        value,
        priority: 0,
        docstring,
        loc: this.loc()
      };
    }

    // Otherwise expect ':=' syntax
    this.expect(TokenType.ASSIGN, "Expected ':='");
    this.skipNewlinesAndComments();

    const value = this.parseExpr();

    return {
      kind: 'instance',
      name,
      params,
      type,
      value,
      priority: 0,
      docstring,
      loc: this.loc()
    };
  }

  private parseNamespace(): AST.NamespaceDecl {
    this.expect(TokenType.NAMESPACE, "Expected 'namespace'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    const decls: AST.Decl[] = [];

    while (!this.isAtEnd() && !this.check(TokenType.END)) {
      const decl = this.parseDecl();
      if (decl) {
        decls.push(decl);
      }
      this.skipNewlinesAndComments();
    }

    if (this.check(TokenType.END)) {
      this.advance();
    }

    return {
      kind: 'namespace',
      name,
      decls,
      loc: this.loc()
    };
  }

  private parseVariable(): AST.VariableDecl {
    this.expect(TokenType.VARIABLE, "Expected 'variable'");
    this.skipNewlinesAndComments();

    const name = this.expect(TokenType.IDENT, "Expected identifier").value;
    this.skipNewlinesAndComments();

    this.expect(TokenType.COLON, "Expected ':'");
    this.skipNewlinesAndComments();

    const type = this.parseExpr();

    return {
      kind: 'variable',
      name,
      type,
      loc: this.loc()
    };
  }

  private parseUniverse(): AST.UniverseDecl {
    this.expect(TokenType.UNIVERSAL, "Expected 'universe'");
    this.skipNewlinesAndComments();

    const names: string[] = [];
    do {
      names.push(this.expect(TokenType.IDENT, "Expected identifier").value);
      this.skipNewlinesAndComments();
    } while (this.match(TokenType.COMMA));

    return {
      kind: 'universe',
      names,
      loc: this.loc()
    };
  }

  private parseImport(): AST.ImportDecl {
    this.expect(TokenType.IMPORT, "Expected 'import'");
    this.skipNewlinesAndComments();

    const module = this.expect(TokenType.IDENT, "Expected module name").value;

    return {
      kind: 'import',
      module,
      loc: this.loc()
    };
  }

  private parseOpen(): AST.OpenDecl {
    this.expect(TokenType.OPEN, "Expected 'open'");
    this.skipNewlinesAndComments();

    const namespace = this.expect(TokenType.IDENT, "Expected namespace").value;

    return {
      kind: 'open',
      namespace,
      loc: this.loc()
    };
  }

  // Binders
  private parseBinders(): AST.Binder[] {
    const binders: AST.Binder[] = [];

    while (true) {
      this.skipNewlinesAndComments();
      const group = this.parseBindersGroup();
      if (group.length === 0) break;
      binders.push(...group);
    }

    return binders;
  }

  private parseBinder(): AST.Binder | null {
    const binders = this.parseBindersGroup();
    return binders.length > 0 ? binders[0] : null;
  }

  // Parse a group of binders, handling shared types like (x y : Nat)
  private parseBindersGroup(): AST.Binder[] {
    this.skipNewlinesAndComments();

    // Explicit binder (x : T) or (x y : T) or (_ : T)
    if (this.match(TokenType.LPAREN)) {
      this.skipNewlinesAndComments();
      const names: string[] = [];

      // Parse all identifiers (or underscores) before the colon
      while (this.check(TokenType.IDENT) || this.check(TokenType.HOLE)) {
        const token = this.advance();
        names.push(token.value === '_' ? '_' : token.value);
        this.skipNewlinesAndComments();
      }

      let type: AST.Expr | undefined;
      if (this.match(TokenType.COLON)) {
        this.skipNewlinesAndComments();
        type = this.parseExpr();
      }

      this.expect(TokenType.RPAREN, "Expected ')'");

      // Create a binder for each name with the same type
      return names.map(name => ({ name, type, implicit: false, instImplicit: false, strictImplicit: false }));
    }

    // Implicit binder {x : T} or {x y : T}
    if (this.match(TokenType.LBRACE)) {
      this.skipNewlinesAndComments();
      const names: string[] = [];

      while (this.check(TokenType.IDENT) || this.check(TokenType.HOLE)) {
        const token = this.advance();
        names.push(token.value === '_' ? '_' : token.value);
        this.skipNewlinesAndComments();
      }

      let type: AST.Expr | undefined;
      if (this.match(TokenType.COLON)) {
        this.skipNewlinesAndComments();
        type = this.parseExpr();
      }

      this.expect(TokenType.RBRACE, "Expected '}'");
      return names.map(name => ({ name, type, implicit: true, instImplicit: false, strictImplicit: false }));
    }

    // Instance binder [x : T] or [x y : T]
    if (this.match(TokenType.LBRACKET)) {
      this.skipNewlinesAndComments();
      const names: string[] = [];

      while (this.check(TokenType.IDENT) || this.check(TokenType.HOLE)) {
        const token = this.advance();
        names.push(token.value === '_' ? '_' : token.value);
        this.skipNewlinesAndComments();
      }

      let type: AST.Expr | undefined;
      if (this.match(TokenType.COLON)) {
        this.skipNewlinesAndComments();
        type = this.parseExpr();
      }

      this.expect(TokenType.RBRACKET, "Expected ']'");
      return names.map(name => ({ name, type, implicit: false, instImplicit: true, strictImplicit: false }));
    }

    // Simple identifier (type inferred)
    if (this.check(TokenType.IDENT)) {
      // Check if next token suggests this is not a binder
      const next = this.peek(1);
      if (next.type === TokenType.COLON && this.peek(2).type !== TokenType.IDENT) {
        return [];
      }

      const name = this.advance().value;
      return [{ name, type: undefined, implicit: false, instImplicit: false, strictImplicit: false }];
    }

    // Simple underscore/hole (type inferred) - used as wildcard parameter
    if (this.check(TokenType.HOLE)) {
      this.advance();
      return [{ name: '_', type: undefined, implicit: false, instImplicit: false, strictImplicit: false }];
    }

    return [];
  }

  // Expressions
  private parseExpr(): AST.Expr {
    let left = this.parseImpliesExpr();

    // Handle pipe forward operator |>
    while (this.match(TokenType.PIPE_FWD)) {
      this.skipNewlinesAndComments();

      // Check for |>.field pattern (pipe to method call)
      if (this.match(TokenType.DOT)) {
        this.skipNewlinesAndComments();
        // Get the method name
        const methodName = this.expect(TokenType.IDENT, "Expected method name after |>.b").value;
        // Create a field access on left, then parse any additional arguments
        let methodExpr: AST.Expr = {
          kind: 'fieldAccess',
          object: left,
          field: methodName,
          loc: this.loc()
        };

        // Parse any arguments to the method
        while (this.checkAny(TokenType.LPAREN, TokenType.LBRACKET, TokenType.IDENT, TokenType.NUMBER, TokenType.STRING, TokenType.FUN, TokenType.LAMBDA)) {
          const arg = this.parseArg();
          if (!arg) break;
          methodExpr = AST.app(methodExpr, arg.expr, !arg.implicit, this.loc());
        }

        left = methodExpr;
      } else {
        const right = this.parseImpliesExpr();
        // x |> f is equivalent to f x
        left = AST.app(right, left, true, this.loc());
      }
    }

    return left;
  }

  // Parse expression but stop when hitting a line at or before minColumn
  private parseExprWithIndentStop(minColumn: number): AST.Expr {
    const prevMinIndent = this.minIndentColumn;
    this.minIndentColumn = minColumn;
    try {
      return this.parseExprIndentAware();
    } finally {
      this.minIndentColumn = prevMinIndent;
    }
  }

  // Expression parsing that respects minIndentColumn
  private parseExprIndentAware(): AST.Expr {
    let left = this.parseImpliesExprIndentAware();

    // Handle pipe forward operator |>
    while (this.match(TokenType.PIPE_FWD)) {
      if (this.shouldStopAtIndent()) break;
      this.skipNewlinesAndComments();

      if (this.match(TokenType.DOT)) {
        this.skipNewlinesAndComments();
        const methodName = this.expect(TokenType.IDENT, "Expected method name after |>.b").value;
        let methodExpr: AST.Expr = {
          kind: 'fieldAccess',
          object: left,
          field: methodName,
          loc: this.loc()
        };

        while (this.checkAny(TokenType.LPAREN, TokenType.LBRACKET, TokenType.IDENT, TokenType.NUMBER, TokenType.STRING, TokenType.FUN, TokenType.LAMBDA)) {
          if (this.shouldStopAtIndent()) break;
          const arg = this.parseArg();
          if (!arg) break;
          methodExpr = AST.app(methodExpr, arg.expr, !arg.implicit, this.loc());
        }

        left = methodExpr;
      } else {
        const right = this.parseImpliesExprIndentAware();
        left = AST.app(right, left, true, this.loc());
      }
    }

    return left;
  }

  // Check if we should stop parsing due to indentation
  private shouldStopAtIndent(): boolean {
    // Stop if current token is at or before the minimum indent column
    return this.current().column <= this.minIndentColumn && this.minIndentColumn > 0;
  }

  private parseImpliesExprIndentAware(): AST.Expr {
    let left = this.parseOrExprIndentAware();

    while ((this.match(TokenType.RARROW2) || this.match(TokenType.ARROW)) && !this.shouldStopAtIndent()) {
      const right = this.parseOrExprIndentAware();
      left = AST.binOp('implies', left, right, this.loc());
    }

    return left;
  }

  private parseOrExprIndentAware(): AST.Expr {
    let left = this.parseAndExprIndentAware();

    while ((this.match(TokenType.LOR) || this.match(TokenType.OR)) && !this.shouldStopAtIndent()) {
      if (this.shouldStopAtIndent()) break;
      this.skipNewlinesAndComments();
      const right = this.parseAndExprIndentAware();
      left = AST.binOp('or', left, right, this.loc());
    }

    return left;
  }

  private parseAndExprIndentAware(): AST.Expr {
    let left = this.parseComparisonExprIndentAware();

    while ((this.match(TokenType.LAND) || this.match(TokenType.AND)) && !this.shouldStopAtIndent()) {
      if (this.shouldStopAtIndent()) break;
      this.skipNewlinesAndComments();
      const right = this.parseComparisonExprIndentAware();
      left = AST.binOp('and', left, right, this.loc());
    }

    return left;
  }

  private parseComparisonExprIndentAware(): AST.Expr {
    let left = this.parseAddExprIndentAware();

    while (!this.shouldStopAtIndent()) {
      let op: AST.BinaryOp | null = null;

      if (this.match(TokenType.EQ)) op = 'eq';
      else if (this.match(TokenType.NE)) op = 'ne';
      else if (this.match(TokenType.LT)) op = 'lt';
      else if (this.match(TokenType.LE)) op = 'le';
      else if (this.match(TokenType.GT)) op = 'gt';
      else if (this.match(TokenType.GE)) op = 'ge';
      else if (this.current().value === '==') {
        this.advance();
        op = 'eq';
      }

      if (!op) break;

      if (this.shouldStopAtIndent()) break;
      this.skipNewlinesAndComments();
      const right = this.parseAddExprIndentAware();
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseAddExprIndentAware(): AST.Expr {
    let left = this.parseMulExprIndentAware();

    while ((this.check(TokenType.PLUS) || this.check(TokenType.MINUS) || this.check(TokenType.APPEND) || this.check(TokenType.DCOLON)) && !this.shouldStopAtIndent()) {
      let op: AST.BinaryOp;
      const tokenType = this.advance().type;
      if (tokenType === TokenType.PLUS) {
        op = 'add';
      } else if (tokenType === TokenType.MINUS) {
        op = 'sub';
      } else if (tokenType === TokenType.DCOLON) {
        op = 'cons';
      } else {
        op = 'append';
      }
      if (this.shouldStopAtIndent()) {
        // Put the token back
        this.pos--;
        break;
      }
      this.skipNewlinesAndComments();
      const right = tokenType === TokenType.DCOLON ? this.parseAddExprIndentAware() : this.parseMulExprIndentAware();
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseMulExprIndentAware(): AST.Expr {
    let left = this.parseUnaryExprIndentAware();

    while ((this.check(TokenType.STAR) || this.check(TokenType.SLASH) || this.check(TokenType.PERCENT) || this.check(TokenType.MULTIPLIER)) && !this.shouldStopAtIndent()) {
      let op: AST.BinaryOp;
      const tokenType = this.advance().type;
      switch (tokenType) {
        case TokenType.STAR: op = 'mul'; break;
        case TokenType.SLASH: op = 'div'; break;
        case TokenType.MULTIPLIER: op = 'mul'; break;
        default: op = 'mod';
      }
      if (this.shouldStopAtIndent()) {
        this.pos--;
        break;
      }
      this.skipNewlinesAndComments();
      const right = this.parseUnaryExprIndentAware();
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseUnaryExprIndentAware(): AST.Expr {
    if ((this.match(TokenType.BANG) || this.match(TokenType.LNOT)) && !this.shouldStopAtIndent()) {
      const operand = this.parseUnaryExprIndentAware();
      return AST.unaryOp('not', operand, this.loc());
    }

    if (this.match(TokenType.MINUS) && !this.shouldStopAtIndent()) {
      const operand = this.parseUnaryExprIndentAware();
      return AST.unaryOp('neg', operand, this.loc());
    }

    return this.parseAppExprIndentAware();
  }

  private parseAppExprIndentAware(): AST.Expr {
    let expr = this.parsePrimaryExprIndentAware();

    if (expr.kind === 'literal') {
      if (this.match(TokenType.DOT) && !this.shouldStopAtIndent()) {
        if (this.check(TokenType.IDENT)) {
          const field = this.advance().value;
          return {
            kind: 'fieldAccess',
            object: expr,
            field,
            loc: this.loc()
          };
        }
        if (this.check(TokenType.NUMBER)) {
          const field = this.advance().value;
          return {
            kind: 'fieldAccess',
            object: expr,
            field,
            loc: this.loc()
          };
        }
      }
      return expr;
    }

    // Handle field access and application for non-literal expressions
    while (!this.isAtEnd() && !this.shouldStopAtIndent()) {
      this.skipNewlinesAndComments();

      if (this.match(TokenType.DOT)) {
        // Check if this is an enum constructor argument (.red, .black)
        // If the next identifier starts with lowercase and is a known constructor,
        // treat it as an argument, not field access
        if (this.check(TokenType.IDENT)) {
          const nextIdent = this.peek(0).value;
          if (nextIdent[0] === nextIdent[0].toLowerCase() && this.inductiveCtors.has(nextIdent)) {
            // This is an enum constructor - treat as argument
            const ctorName = this.advance().value;
            const typeName = this.inductiveCtors.get(ctorName);
            const arg = typeName ? AST.ident(`${typeName}.${ctorName}`, this.loc()) : AST.ident(ctorName, this.loc());
            expr = AST.app(expr, arg, true, this.loc());
            continue;
          }
        }

        // Field access - handle IDENT or keywords that can be used as field names
        if (this.check(TokenType.IDENT) || this.isKeywordAsIdent()) {
          const field = this.advance().value;
          expr = {
            kind: 'fieldAccess',
            object: expr,
            field,
            loc: this.loc()
          };
        } else if (this.check(TokenType.NUMBER)) {
          const field = this.advance().value;
          expr = {
            kind: 'fieldAccess',
            object: expr,
            field,
            loc: this.loc()
          };
        } else {
          break;
        }
      } else {
        // Function application
        const arg = this.parseArgIndentAware();
        if (!arg) break;
        expr = AST.app(expr, arg.expr, !arg.implicit, this.loc());
      }
    }

    return expr;
  }

  private parseArgIndentAware(): { expr: AST.Expr; implicit: boolean } | null {
    if (this.shouldStopAtIndent()) return null;
    return this.parseArg();
  }

  private parsePrimaryExprIndentAware(): AST.Expr {
    // Delegate to parsePrimaryExpr but with indent awareness
    return this.parsePrimaryExpr();
  }

  private parseImpliesExpr(): AST.Expr {
    let left = this.parseOrExpr();

    while (this.match(TokenType.RARROW2) || this.match(TokenType.ARROW)) {
      const right = this.parseOrExpr();
      left = AST.binOp('implies', left, right, this.loc());
    }

    return left;
  }

  private parseOrExpr(): AST.Expr {
    let left = this.parseAndExpr();

    while (this.match(TokenType.LOR) || this.match(TokenType.OR)) {
      // Skip newlines after operator for multiline expressions
      this.skipNewlinesAndComments();
      const right = this.parseAndExpr();
      left = AST.binOp('or', left, right, this.loc());
    }

    return left;
  }

  private parseAndExpr(): AST.Expr {
    let left = this.parseComparisonExpr();

    while (this.match(TokenType.LAND) || this.match(TokenType.AND)) {
      // Skip newlines after operator for multiline expressions
      this.skipNewlinesAndComments();
      const right = this.parseComparisonExpr();
      left = AST.binOp('and', left, right, this.loc());
    }

    return left;
  }

  private parseComparisonExpr(): AST.Expr {
    let left = this.parseAddExpr();

    while (true) {
      let op: AST.BinaryOp | null = null;

      if (this.match(TokenType.EQ)) op = 'eq';
      else if (this.match(TokenType.NE)) op = 'ne';
      else if (this.match(TokenType.LT)) op = 'lt';
      else if (this.match(TokenType.LE)) op = 'le';
      else if (this.match(TokenType.GT)) op = 'gt';
      else if (this.match(TokenType.GE)) op = 'ge';
      else if (this.current().value === '==') {
        this.advance();
        op = 'eq';
      }

      if (!op) break;

      // Skip newlines after operator for multiline expressions
      this.skipNewlinesAndComments();
      const right = this.parseAddExpr();
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseAddExpr(): AST.Expr {
    let left = this.parseMulExpr();

    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS) || this.check(TokenType.APPEND) || this.check(TokenType.DCOLON)) {
      let op: AST.BinaryOp;
      const tokenType = this.advance().type;
      if (tokenType === TokenType.PLUS) {
        op = 'add';
      } else if (tokenType === TokenType.MINUS) {
        op = 'sub';
      } else if (tokenType === TokenType.DCOLON) {
        op = 'cons';
      } else {
        op = 'append';
      }
      // Skip newlines after operator for multiline expressions
      this.skipNewlinesAndComments();
      // For :: (cons), use right associativity - parse at same level
      const right = tokenType === TokenType.DCOLON ? this.parseAddExpr() : this.parseMulExpr();
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseMulExpr(): AST.Expr {
    let left = this.parseUnaryExpr();

    while (this.check(TokenType.STAR) || this.check(TokenType.SLASH) || this.check(TokenType.PERCENT) || this.check(TokenType.MULTIPLIER)) {
      let op: AST.BinaryOp;
      const tokenType = this.advance().type;
      switch (tokenType) {
        case TokenType.STAR: op = 'mul'; break;
        case TokenType.SLASH: op = 'div'; break;
        case TokenType.MULTIPLIER:
          // Product type (×) - treat as pair/tuple construction
          op = 'mul'; break;
        default: op = 'mod';
      }
      // Skip newlines after operator for multiline expressions
      this.skipNewlinesAndComments();
      const right = this.parseUnaryExpr();
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseUnaryExpr(): AST.Expr {
    if (this.match(TokenType.BANG) || this.match(TokenType.LNOT)) {
      const operand = this.parseUnaryExpr();
      return AST.unaryOp('not', operand, this.loc());
    }

    if (this.match(TokenType.MINUS)) {
      const operand = this.parseUnaryExpr();
      return AST.unaryOp('neg', operand, this.loc());
    }

    return this.parseAppExpr();
  }

  private parseAppExpr(): AST.Expr {
    let expr = this.parsePrimaryExpr();

    // Literals cannot be applied to arguments, but can have field access
    if (expr.kind === 'literal') {
      // Check for field access on literals (e.g., "hello".length)
      if (this.match(TokenType.DOT)) {
        if (this.check(TokenType.IDENT)) {
          const field = this.advance().value;
          return {
            kind: 'fieldAccess',
            object: expr,
            field,
            loc: this.loc()
          };
        }
        if (this.check(TokenType.NUMBER)) {
          const field = this.advance().value;
          return {
            kind: 'fieldAccess',
            object: expr,
            field,
            loc: this.loc()
          };
        }
      }
      return expr;
    }

    while (true) {
      this.skipNewlinesAndComments();

      if (this.match(TokenType.DOT)) {
        // Check if this is an enum constructor argument (.red, .black)
        // If the next identifier starts with lowercase and is a known constructor,
        // treat it as an argument, not field access
        if (this.check(TokenType.IDENT)) {
          const nextIdent = this.peek(0).value;
          if (nextIdent[0] === nextIdent[0].toLowerCase() && this.inductiveCtors.has(nextIdent)) {
            // This is an enum constructor - treat as argument
            const ctorName = this.advance().value;
            const typeName = this.inductiveCtors.get(ctorName);
            const arg = typeName ? AST.ident(`${typeName}.${ctorName}`, this.loc()) : AST.ident(ctorName, this.loc());
            expr = AST.app(expr, arg, true, this.loc());
            continue;
          }
        }

        // Field access
        this.skipNewlinesAndComments();
        // Check for numeric field access (like .1, .2) or named field access
        if (this.check(TokenType.NUMBER)) {
          const field = this.advance().value;
          expr = {
            kind: 'fieldAccess',
            object: expr,
            field,
            loc: this.loc()
          };
        } else {
          const field = this.expect(TokenType.IDENT, "Expected field name").value;
          expr = {
            kind: 'fieldAccess',
            object: expr,
            field,
            loc: this.loc()
          };
        }
      } else if (this.check(TokenType.LBRACKET)) {
        // Check if this is an array literal argument or a projection
        // If the next token after [ is a number, string, identifier followed by comma or args,
        // nested array [, or empty array ], it's likely an array literal
        // Otherwise, treat it as a projection (for things like arr[0])
        // Skip newlines when peeking
        let peekOffset = 1;
        while (this.peek(peekOffset).type === TokenType.NEWLINE) {
          peekOffset++;
        }
        const nextToken = this.peek(peekOffset);
        const tokenAfterNext = this.peek(peekOffset + 1);
        const isArrayLiteral =
          nextToken.type === TokenType.NUMBER ||
          nextToken.type === TokenType.STRING ||
          nextToken.type === TokenType.LBRACKET ||
          nextToken.type === TokenType.RBRACKET ||
          nextToken.type === TokenType.LPAREN ||
          (nextToken.type === TokenType.IDENT && (
            tokenAfterNext.type === TokenType.COMMA ||
            tokenAfterNext.type === TokenType.LBRACKET ||
            tokenAfterNext.type === TokenType.LBRACE ||
            tokenAfterNext.type === TokenType.IDENT ||
            tokenAfterNext.type === TokenType.NUMBER ||
            tokenAfterNext.type === TokenType.STRING ||
            tokenAfterNext.type === TokenType.RBRACKET ||
            tokenAfterNext.type === TokenType.DOT ||
            tokenAfterNext.type === TokenType.LPAREN
          ));

        if (isArrayLiteral) {
          // This is an array literal argument - let parseArg handle it
          const arg = this.parseArg();
          if (!arg) break;
          expr = AST.app(expr, arg.expr, true, this.loc());
        } else {
          // This is a projection
          this.advance(); // consume [
          this.skipNewlinesAndComments();
          const index = this.parseExpr();
          this.expect(TokenType.RBRACKET, "Expected ']'");
          expr = {
            kind: 'proj',
            expr,
            index: typeof index === 'object' && 'kind' in index && (expr as any).kind === 'literal' ? parseInt((expr as any).value) : 0,
            loc: this.loc()
          };
          // Check for ? suffix on array access (e.g., arr[i]? for safe access)
          if (this.match(TokenType.QUESTION)) {
            // arr[i]? is a safe array access - transform to method call
            expr = {
              kind: 'fieldAccess',
              object: expr,
              field: 'getD',
              loc: this.loc()
            };
          }
        }
      } else if (this.match(TokenType.QUESTION)) {
        // Handle ? postfix operator (e.g., e? for Option-returning operations)
        // Transform e? into e.getD call (safe access)
        expr = {
          kind: 'fieldAccess',
          object: expr,
          field: '?',
          loc: this.loc()
        };
      } else {
        // Function application
        const arg = this.parseArg();
        if (!arg) break;

        let explicit = true;
        if (arg.implicit) {
          explicit = false;
        }

        expr = AST.app(expr, arg.expr, explicit, this.loc());
      }
    }

    return expr;
  }

  private parseArg(): { expr: AST.Expr; implicit: boolean } | null {
    this.skipNewlinesAndComments();

    // Check if we're at a dedented position (should stop parsing arguments)
    if (this.minIndentColumn > 0 && this.current().column > 0 && this.current().column <= this.minIndentColumn) {
      return null;
    }

    // Implicit argument
    if (this.match(TokenType.LBRACE)) {
      const expr = this.parseExpr();
      this.expect(TokenType.RBRACE, "Expected '}'");
      return { expr, implicit: true };
    }

    // Instance argument: [Type] or [ClassName instance]
    // But NOT array literals like [1, 2, 3] or nested arrays like [[1]] or [a []]
    if (this.check(TokenType.LBRACKET)) {
      // Peek ahead to determine if this is an array literal or instance argument
      // Skip newlines when peeking
      let peekOffset = 1;
      while (this.peek(peekOffset).type === TokenType.NEWLINE) {
        peekOffset++;
      }
      const nextToken = this.peek(peekOffset);
      const tokenAfterNext = this.peek(peekOffset + 1);
      // Array literals start with numbers, strings, nested brackets, or are empty
      // Or they start with identifiers that are followed by comma, bracket, or args
      const isArrayLiteral =
        nextToken.type === TokenType.NUMBER ||
        nextToken.type === TokenType.STRING ||
        nextToken.type === TokenType.LBRACKET ||
        nextToken.type === TokenType.RBRACKET ||
        nextToken.type === TokenType.LPAREN ||
        (nextToken.type === TokenType.IDENT && (
          tokenAfterNext.type === TokenType.COMMA ||
          tokenAfterNext.type === TokenType.LBRACKET ||
          tokenAfterNext.type === TokenType.LBRACE ||
          tokenAfterNext.type === TokenType.IDENT ||
          tokenAfterNext.type === TokenType.NUMBER ||
          tokenAfterNext.type === TokenType.STRING ||
          tokenAfterNext.type === TokenType.RBRACKET ||
          tokenAfterNext.type === TokenType.DOT ||
          tokenAfterNext.type === TokenType.LPAREN
        ));

      if (isArrayLiteral) {
        // This is an array literal - let tryParsePrimaryExpr handle it
        // Do nothing here, fall through to tryParsePrimaryExpr
      } else {
        // This is an instance argument
        this.advance(); // consume [
        const expr = this.parseExpr();
        this.expect(TokenType.RBRACKET, "Expected ']'");
        return { expr, implicit: false };
      }
    }

    // Check if we can parse an argument
    if (this.checkAny(
      TokenType.RPAREN, TokenType.RBRACE, TokenType.RBRACKET,
      TokenType.NEWLINE, TokenType.EOF, TokenType.PIPE,
      TokenType.COMMA, TokenType.SEMI, TokenType.COLON,
      TokenType.ASSIGN, TokenType.ARROW, TokenType.FAT_ARROW,
      TokenType.THEN, TokenType.ELSE, TokenType.DO, TokenType.WHERE,
      TokenType.DEF, TokenType.AXIOM, TokenType.INDUCTIVE, TokenType.CLASS,
      TokenType.STRUCTURE, TokenType.INSTANCE, TokenType.THEOREM,
      TokenType.NAMESPACE, TokenType.END, TokenType.VARIABLE,
      TokenType.HASH  // Stop at #eval, #check, etc.
    )) {
      return null;
    }

    // Also stop if the identifier is a keyword that starts a new declaration
    if (this.check(TokenType.IDENT)) {
      const val = this.current().value;
      if (val === 'partial' || val === 'private' || val === 'protected') {
        return null;
      }
    }

    const expr = this.tryParsePrimaryExprWithFieldAccess();
    if (!expr) return null;

    return { expr, implicit: false };
  }

  private tryParsePrimaryExpr(): AST.Expr | null {
    try {
      return this.parsePrimaryExpr();
    } catch {
      return null;
    }
  }

  private tryParsePrimaryExprWithFieldAccess(): AST.Expr | null {
    try {
      // Only parse the primary expression, do NOT consume field accesses here.
      // Field accesses should bind to the outer expression, not the argument.
      // For example, in `elems.map jsonDepth.foldl max 0`, the `.foldl` should
      // apply to the result of `elems.map jsonDepth`, not to `jsonDepth`.
      return this.parsePrimaryExpr();
    } catch {
      return null;
    }
  }

  private parsePrimaryExpr(): AST.Expr {
    const loc = this.loc();

    // Literals
    if (this.check(TokenType.NUMBER)) {
      const value = this.advance().value;
      const num = parseFloat(value);
      if (value.includes('.') || value.includes('e') || value.includes('E')) {
        return AST.literal('float', num, loc);
      }
      return AST.literal('nat', value, loc);
    }

    if (this.check(TokenType.STRING)) {
      return AST.literal('string', this.advance().value, loc);
    }

    if (this.check(TokenType.INTERPOLATED_STRING)) {
      const token = this.advance();
      const parts: Array<{type: 'text', value: string} | {type: 'expr', value: AST.Expr}> = [];
      try {
        const parsedParts = JSON.parse(token.value) as Array<{type: 'text' | 'expr', value: string}>;
        for (const part of parsedParts) {
          if (part.type === 'text') {
            parts.push({type: 'text', value: part.value});
          } else {
            // Parse the expression string
            const exprModule = this.parseExpressionString(part.value);
            parts.push({type: 'expr', value: exprModule});
          }
        }
      } catch (e) {
        throw new Error(`Failed to parse interpolated string: ${e}`);
      }
      return {kind: 'interpolatedString', parts, loc};
    }

    if (this.check(TokenType.CHAR)) {
      return AST.literal('char', this.advance().value, loc);
    }

    // Boolean literals
    if (this.current().value === 'true') {
      this.advance();
      return AST.literal('bool', true, loc);
    }
    if (this.current().value === 'false') {
      this.advance();
      return AST.literal('bool', false, loc);
    }

    // Type, Sort, Prop
    if (this.match(TokenType.TYPE)) {
      let level: number | undefined;
      if (this.check(TokenType.NUMBER)) {
        level = parseInt(this.advance().value);
      }
      return AST.type_(level, loc);
    }

    if (this.match(TokenType.SORT)) {
      let level = 0;
      if (this.check(TokenType.NUMBER)) {
        level = parseInt(this.advance().value);
      }
      return { kind: 'sort', level, loc };
    }

    if (this.match(TokenType.PROP)) {
      return AST.prop(loc);
    }

    // Hole
    if (this.match(TokenType.HOLE)) {
      let name: string | undefined;
      if (this.check(TokenType.IDENT)) {
        name = this.advance().value;
      }
      return AST.hole(name, loc);
    }

    // Lambda: fun x => e or λ x => e
    if (this.match(TokenType.FUN) || this.match(TokenType.LAMBDA)) {
      this.skipNewlinesAndComments();
      const { params, patterns } = this.parseLambdaParams();
      this.skipNewlinesAndComments();

      if (!this.match(TokenType.FAT_ARROW) && !this.match(TokenType.ARROW)) {
        // Parse body without requiring =>
        let body = this.singleLineMode
          ? this.parseSingleLineExpr(this.singleLineStart)
          : this.parseExpr();
        // Wrap body with pattern matches if needed
        body = this.wrapBodyWithPatternMatches(body, patterns);
        return { kind: 'fun', params, body, loc };
      }

      this.skipNewlinesAndComments();
      let body = this.singleLineMode
        ? this.parseSingleLineExpr(this.singleLineStart)
        : this.parseExpr();
      // Wrap body with pattern matches if needed
      body = this.wrapBodyWithPatternMatches(body, patterns);
      return { kind: 'fun', params, body, loc };
    }

    // Forall: ∀ x : T, P or forall x : T, P
    if (this.match(TokenType.FORALL) || this.match(TokenType.FORALL2)) {
      this.skipNewlinesAndComments();
      const params = this.parseBinders();
      this.skipNewlinesAndComments();
      this.expect(TokenType.COMMA, "Expected ','");
      this.skipNewlinesAndComments();
      const body = this.parseExpr();
      return { kind: 'forall', params, body, loc };
    }

    // Exists: ∃ x : T, P or exists x : T, P
    if (this.match(TokenType.EXISTS) || this.match(TokenType.EXISTS2)) {
      this.skipNewlinesAndComments();
      const params = this.parseBinders();
      this.skipNewlinesAndComments();
      this.expect(TokenType.COMMA, "Expected ','");
      this.skipNewlinesAndComments();
      const body = this.parseExpr();
      return { kind: 'exists', params, body, loc };
    }

    // If expression
    if (this.match(TokenType.IF)) {
      const ifStartColumn = this.current().column;
      this.skipNewlinesAndComments();
      const prevMode = this.singleLineMode;
      const prevMinIndent = this.minIndentColumn;
      this.singleLineMode = false;

      // Only set minIndentColumn if not already constrained by outer context
      // This allows else if ... else chains to work correctly
      if (prevMinIndent === 0) {
        this.minIndentColumn = ifStartColumn;
      }

      // Check for dependent if: if h : condition then ...
      let hypothesis: string | undefined;
      if (this.check(TokenType.IDENT) && this.peek(1)?.type === TokenType.COLON) {
        hypothesis = this.advance().value;
        this.advance(); // consume ':'
        this.skipNewlinesAndComments();
      }

      const cond = this.parseExpr();
      this.skipNewlinesAndComments();
      this.expect(TokenType.THEN, "Expected 'then'");
      this.skipNewlinesAndComments();
      const thenBranch = this.parseExpr();
      this.skipNewlinesAndComments();

      // Temporarily disable indent check to find the 'else' keyword
      const savedMinIndent = this.minIndentColumn;
      this.minIndentColumn = 0;

      let elseBranch: AST.Expr | undefined;
      if (this.match(TokenType.ELSE)) {
        this.skipNewlinesAndComments();
        // Restore the saved indent for parsing the else branch
        this.minIndentColumn = savedMinIndent;
        elseBranch = this.parseExpr();
      }

      this.singleLineMode = prevMode;
      this.minIndentColumn = prevMinIndent;
      return AST.if_(cond, thenBranch, elseBranch, loc, hypothesis);
    }

    // Match expression
    if (this.match(TokenType.MATCH)) {
      this.skipNewlinesAndComments();
      // Parse comma-separated scrutinees (e.g., match x, y with)
      const scrutinees: AST.Expr[] = [this.parseExpr()];
      this.skipNewlinesAndComments();
      while (this.match(TokenType.COMMA)) {
        this.skipNewlinesAndComments();
        scrutinees.push(this.parseExpr());
        this.skipNewlinesAndComments();
      }
      this.expect(TokenType.WITH, "Expected 'with'");
      this.skipNewlinesAndComments();

      // Store the previous minIndentColumn to restore later
      const prevMinIndent = this.minIndentColumn;
      // Set minIndentColumn to the current column (where the first | should be)
      // This ensures nested matches stop when they see a | at this column
      if (this.check(TokenType.PIPE)) {
        this.minIndentColumn = this.current().column;
      }

      const cases: AST.MatchCase[] = [];

      // Store the column where the first match case pipe appears (for indent-aware parsing)
      const matchCaseStartColumn = this.current().column;

      let caseNum = 0;
      while (this.match(TokenType.PIPE)) {
        // Stop if we've dedented back to or before the outer context
        if (this.shouldStopAtIndent()) {
          this.pos--; // Put the pipe back
          break;
        }
        this.skipNewlinesAndComments();
        caseNum++;
        // Parse or-patterns: | p1 | p2 => body (multiple alternatives sharing the same body)
        // Each alternative can be a single pattern or a tuple of patterns for multiple scrutinees
        const alternativePatterns: AST.Pattern[][] = [];

        // Parse the first alternative
        const firstPatterns: AST.Pattern[] = [this.parsePattern()];
        this.skipNewlinesAndComments();
        // Handle comma-separated patterns for multiple scrutinees
        while (this.match(TokenType.COMMA)) {
          this.skipNewlinesAndComments();
          firstPatterns.push(this.parsePattern());
          this.skipNewlinesAndComments();
        }
        alternativePatterns.push(firstPatterns);

        // Check for or-patterns: additional alternatives separated by |
        // But only if the next | is NOT followed by => (which would mean empty pattern)
        while (this.match(TokenType.PIPE)) {
          this.skipNewlinesAndComments();
          // Check if this starts a new case (look ahead for => after pattern)
          // If we see => immediately, this was actually the start of a new case
          if (this.check(TokenType.FAT_ARROW) || this.check(TokenType.ARROW)) {
            // This is a new case starting - put the pipe back
            this.pos--;
            break;
          }
          // Parse another alternative pattern
          const altPatterns: AST.Pattern[] = [this.parsePattern()];
          this.skipNewlinesAndComments();
          while (this.match(TokenType.COMMA)) {
            this.skipNewlinesAndComments();
            altPatterns.push(this.parsePattern());
            this.skipNewlinesAndComments();
          }
          alternativePatterns.push(altPatterns);
        }

        if (this.match(TokenType.FAT_ARROW) || this.match(TokenType.ARROW)) {
          this.skipNewlinesAndComments();
        } else if (this.match(TokenType.ASSIGN)) {
          this.skipNewlinesAndComments();
        }

        // Use indent-aware parsing for the body to stop at outer indentation
        const body = this.parseExprIndentAware();

        // Create a case for each alternative pattern (or-pattern expansion)
        for (const patterns of alternativePatterns) {
          const pattern: AST.Pattern = patterns.length === 1
            ? patterns[0]
            : { kind: 'tuple', elements: patterns, loc: this.loc() };
          cases.push({ pattern, body, loc: this.loc() });
        }
        this.skipNewlinesAndComments();

        if (!this.check(TokenType.PIPE)) break;
      }

      // Restore the previous minIndentColumn
      this.minIndentColumn = prevMinIndent;

      // Create match expression with tuple scrutinee if multiple
      const scrutinee: AST.Expr = scrutinees.length === 1
        ? scrutinees[0]
        : { kind: 'tuple', elements: scrutinees, loc: this.loc() };
      return AST.match_(scrutinee, cases, loc);
    }

    // Let expression
    if (this.match(TokenType.LET)) {
      // Capture the let start column right after matching LET, before any skipping
      const letStartColumn = this.prev().column;
      this.skipNewlinesAndComments();

      // Check for 'rec' keyword for recursive let
      let isRecursive = false;
      if (this.check(TokenType.IDENT) && this.current().value === 'rec') {
        isRecursive = true;
        this.advance(); // consume 'rec'
        this.skipNewlinesAndComments();
      }

      // Check for pattern-style let (starts with '(' for tuple pattern)
      if (this.check(TokenType.LPAREN)) {
        // Destructuring let: let (a, b, c) := expr
        const pattern = this.parsePattern();
        this.skipNewlinesAndComments();

        this.expect(TokenType.ASSIGN, "Expected ':='");
        this.skipNewlinesAndComments();

        const value = this.parseExpr();
        this.skipNewlinesAndComments();

        // Parse the body (after the let binding)
        let body: AST.Expr | undefined;
        if (this.match(TokenType.IN)) {
          this.skipNewlinesAndComments();
          body = this.parseExpr();
        } else if (this.checkAny(TokenType.IDENT, TokenType.NUMBER, TokenType.STRING, TokenType.LPAREN, TokenType.LBRACKET, TokenType.LBRACE, TokenType.IF, TokenType.MATCH, TokenType.LET, TokenType.DO, TokenType.FUN)) {
          // Next token looks like an expression - parse as body
          body = this.parseExpr();
        }

        // Return a let expression with a pattern
        return {
          kind: 'let',
          name: '',  // Empty name indicates pattern-style let
          pattern,
          value,
          body,
          recursive: false,
          loc: this.loc()
        } as AST.LetExpr;
      }

      const name = this.expect(TokenType.IDENT, "Expected identifier").value;
      this.skipNewlinesAndComments();

      // Parse optional parameters (for let rec functions)
      const params = this.parseBinders();
      this.skipNewlinesAndComments();

      let type: AST.Expr | undefined;
      if (this.match(TokenType.COLON)) {
        this.skipNewlinesAndComments();
        type = this.parseExpr();
        this.skipNewlinesAndComments();
      }

      // Check for pattern-matching style (with | patterns)
      if (this.match(TokenType.PIPE)) {
        // Pattern-matching style let rec
        // Use the letStartColumn captured earlier
        const cases: { patterns: AST.Pattern[], body: AST.Expr }[] = [];

        // Helper to check if current position looks like a pattern at the right indentation
        const looksLikePatternAtIndent = (): boolean => {
          // Check if current token is at a greater column than the 'let' keyword
          // This ensures we don't treat the 'let' body as a pattern
          if (this.current().column <= letStartColumn) return false;
          return this.checkAny(TokenType.LBRACKET, TokenType.LPAREN, TokenType.IDENT, TokenType.HOLE, TokenType.NUMBER, TokenType.STRING);
        };

        let prevLine = 0;
        do {
          this.skipNewlinesAndComments();
          const patterns: AST.Pattern[] = [];

          // Parse patterns until we hit =>
          while (!this.checkAny(TokenType.FAT_ARROW, TokenType.ARROW)) {
            const pattern = this.parsePattern();
            patterns.push(pattern);
            this.skipNewlinesAndComments();
            // Skip comma between patterns
            if (this.match(TokenType.COMMA)) {
              this.skipNewlinesAndComments();
            }
            if (this.checkAny(TokenType.FAT_ARROW, TokenType.ARROW)) break;
          }

          // Consume =>
          if (this.match(TokenType.FAT_ARROW) || this.match(TokenType.ARROW)) {
            this.skipNewlinesAndComments();
          }

          // Parse the body, but stop when we hit a line at or before the 'let rec' column
          const body = this.parseExprWithIndentStop(letStartColumn);
          cases.push({ patterns, body });
          prevLine = this.current().line;
          this.skipNewlinesAndComments();
        } while (this.match(TokenType.PIPE) || (this.current().line > prevLine && looksLikePatternAtIndent()));

        // Convert pattern-matching to a match expression
        let value: AST.Expr;
        if (params.length > 0 || cases[0].patterns.length > 0) {
          // Build match expression
          const matchCases: AST.MatchCase[] = cases.map((c, idx) => ({
            pattern: c.patterns.length === 1 ? c.patterns[0] : { kind: 'tuple', elements: c.patterns, loc: this.loc() },
            body: c.body,
            loc: this.loc()
          }));

          // For pattern-matching let recs, the patterns are on the parameters
          if (cases[0].patterns.length === 1) {
            // Single parameter match
            const paramName = params.length > 0 ? params[0].name : '_arg';
            value = {
              kind: 'fun',
              params: params.length > 0 ? params : [{ name: paramName, type: undefined, implicit: false, instImplicit: false, strictImplicit: false }],
              body: {
                kind: 'match',
                scrutinee: { kind: 'ident', name: paramName, loc: this.loc() },
                cases: matchCases,
                loc: this.loc()
              },
              loc: this.loc()
            };
          } else {
            // Multiple parameters - create nested lambdas
            const paramNames = params.length > 0 ? params.map(p => p.name) : cases[0].patterns.map((_, i) => `_arg${i}`);
            value = {
              kind: 'fun',
              params: params.length > 0 ? params : paramNames.map(n => ({ name: n, type: undefined, implicit: false, instImplicit: false, strictImplicit: false })),
              body: {
                kind: 'match',
                scrutinee: paramNames.length === 1
                  ? { kind: 'ident', name: paramNames[0], loc: this.loc() }
                  : { kind: 'tuple', elements: paramNames.map(n => ({ kind: 'ident', name: n, loc: this.loc() })), loc: this.loc() },
                cases: matchCases,
                loc: this.loc()
              },
              loc: this.loc()
            };
          }
        } else {
          value = cases[0].body;
        }

        let body: AST.Expr | undefined;
        this.skipNewlinesAndComments();

        if (this.match(TokenType.IN)) {
          this.skipNewlinesAndComments();
          body = this.parseExpr();
        } else if (this.checkAny(TokenType.IDENT, TokenType.NUMBER, TokenType.STRING, TokenType.LPAREN, TokenType.LBRACKET, TokenType.LBRACE, TokenType.IF, TokenType.MATCH, TokenType.LET, TokenType.DO, TokenType.FUN)) {
          // Next token looks like an expression - parse as body
          body = this.parseExpr();
        }

        return AST.let_(name, value, body, type, isRecursive, loc);
      }

      this.expect(TokenType.ASSIGN, "Expected ':='");
      this.skipNewlinesAndComments();

      // Parse the value expression
      // Use indent-aware parsing to stop at the body (which should be at or before let's column)
      // Use the letStartColumn captured earlier
      let value = this.parseExprWithIndentStop(letStartColumn);

      // If we have parameters, wrap the value in lambdas
      if (params.length > 0) {
        for (let i = params.length - 1; i >= 0; i--) {
          value = {
            kind: 'fun',
            params: [params[i]],
            body: value,
            loc: this.loc()
          };
        }
      }

      let body: AST.Expr | undefined;
      this.skipNewlinesAndComments();

      if (this.match(TokenType.IN)) {
        this.skipNewlinesAndComments();
        body = this.parseExpr();
      } else if (this.checkAny(TokenType.IDENT, TokenType.NUMBER, TokenType.STRING, TokenType.LPAREN, TokenType.LBRACKET, TokenType.LBRACE, TokenType.IF, TokenType.MATCH, TokenType.LET, TokenType.DO, TokenType.FUN)) {
        // Next token looks like an expression - parse as body
        body = this.parseExpr();
      }

      return AST.let_(name, value, body, type, isRecursive, loc);
    }

    // Do expression
    if (this.match(TokenType.DO)) {
      this.skipNewlinesAndComments();
      const statements = this.parseDoStatements();
      return { kind: 'do', statements, loc: this.loc() };
    }

    // Have expression
    if (this.match(TokenType.HAVE)) {
      this.skipNewlinesAndComments();
      const name = this.expect(TokenType.IDENT, "Expected identifier").value;
      this.skipNewlinesAndComments();
      this.expect(TokenType.COLON, "Expected ':'");
      this.skipNewlinesAndComments();
      const type = this.parseExpr();
      this.skipNewlinesAndComments();
      this.expect(TokenType.ASSIGN, "Expected ':='");
      this.skipNewlinesAndComments();
      const proof = this.parseExpr();

      return { kind: 'have', name, type, proof, loc };
    }

    // Show expression
    if (this.match(TokenType.SHOW)) {
      this.skipNewlinesAndComments();
      const type = this.parseExpr();
      this.skipNewlinesAndComments();
      this.expect(TokenType.ASSIGN, "Expected ':='");
      this.skipNewlinesAndComments();
      const proof = this.parseExpr();

      return { kind: 'show', type, proof, loc };
    }

    // Parenthesized expression or tuple
    if (this.match(TokenType.LPAREN)) {
      this.skipNewlinesAndComments();

      // Empty tuple = unit
      if (this.match(TokenType.RPAREN)) {
        return AST.ctorPattern('Unit.mk', [], loc) as any;
      }

      const expr = this.parseExpr();
      this.skipNewlinesAndComments();

      // Check for comma - if present, it's a tuple
      if (this.match(TokenType.COMMA)) {
        const elements: AST.Expr[] = [expr];
        do {
          this.skipNewlinesAndComments();
          if (this.check(TokenType.RPAREN)) break;
          elements.push(this.parseExpr());
          this.skipNewlinesAndComments();
        } while (this.match(TokenType.COMMA));

        this.expect(TokenType.RPAREN, "Expected ')'");

        // Create a tuple constructor call
        if (elements.length === 2) {
          // Pair.mk a b
          return AST.app(
            AST.app(AST.ident('Pair.mk', loc), elements[0], true, loc),
            elements[1], true, loc
          );
        } else {
          // For larger tuples, create nested pairs or use a tuple constructor
          return { kind: 'tuple', elements, loc };
        }
      }

      this.expect(TokenType.RPAREN, "Expected ')'");

      // Check if the expression contains holes (·) - if so, transform into an anonymous function
      const holeCount = this.countHoles(expr);
      if (holeCount > 0) {
        return this.transformHolesToLambda(expr, holeCount, loc);
      }

      return { kind: 'paren', expr, loc };
    }

    // Structure literal { field := value, ... }
    if (this.match(TokenType.LBRACE)) {
      this.skipNewlinesAndComments();

      const fields: { name: string; value: AST.Expr }[] = [];

      while (!this.check(TokenType.RBRACE)) {
        this.skipNewlinesAndComments();
        const fieldName = this.expect(TokenType.IDENT, "Expected field name").value;
        this.skipNewlinesAndComments();
        this.expect(TokenType.ASSIGN, "Expected ':='");
        this.skipNewlinesAndComments();
        const fieldValue = this.parseExpr();
        fields.push({ name: fieldName, value: fieldValue });
        this.skipNewlinesAndComments();

        if (!this.match(TokenType.COMMA)) break;
      }

      this.expect(TokenType.RBRACE, "Expected '}'");

      // Create a structure constructor call
      // For now, create an object expression that the evaluator can handle
      return { kind: 'structLit', fields, loc } as any;
    }

    // Array literal with # prefix (#[1, 2, 3])
    if (this.match(TokenType.HASH)) {
      if (this.match(TokenType.LBRACKET)) {
        this.skipNewlinesAndComments();
        const elements: AST.Expr[] = [];

        if (!this.check(TokenType.RBRACKET)) {
          do {
            this.skipNewlinesAndComments();
            // Handle trailing comma
            if (this.check(TokenType.RBRACKET)) break;
            elements.push(this.parseExpr());
            this.skipNewlinesAndComments();
          } while (this.match(TokenType.COMMA));
        }

        this.expect(TokenType.RBRACKET, "Expected ']'");
        return AST.arrayLit(elements, loc);
      } else {
        // Just a # symbol - error or handle other # syntax
        throw new ParseError("Expected '[' after '#'", this.current());
      }
    }

    // Array literal
    if (this.match(TokenType.LBRACKET)) {
      this.skipNewlinesAndComments();
      const elements: AST.Expr[] = [];

      if (!this.check(TokenType.RBRACKET)) {
        do {
          this.skipNewlinesAndComments();
          // Handle trailing comma
          if (this.check(TokenType.RBRACKET)) break;
          elements.push(this.parseExpr());
          this.skipNewlinesAndComments();
        } while (this.match(TokenType.COMMA));
      }

      this.expect(TokenType.RBRACKET, "Expected ']'");
      return AST.arrayLit(elements, loc);
    }

    // Anonymous constructor ⟨a, b, c⟩ (Unicode angle brackets U+27E8/U+27E9)
    if (this.match(TokenType.LTUPLE)) {
      this.skipNewlinesAndComments();
      const elements: AST.Expr[] = [];

      if (!this.check(TokenType.RTUPLE)) {
        do {
          this.skipNewlinesAndComments();
          // Handle trailing comma
          if (this.check(TokenType.RTUPLE)) break;
          elements.push(this.parseExpr());
          this.skipNewlinesAndComments();
        } while (this.match(TokenType.COMMA));
      }

      this.expect(TokenType.RTUPLE, "Expected '⟩'");

      // Create an anonymous constructor expression
      // This will be resolved during type checking/evaluation
      // For now, we use a special "anonCtor" expression kind
      return { kind: 'anonCtor', elements, loc } as any;
    }

    // Dot notation for enum constructors (.red, .black, etc.) in expressions
    // Resolve to TypeName.constructor based on inductiveCtors map
    if (this.check(TokenType.DOT) && this.peek(1).type === TokenType.IDENT) {
      this.advance(); // consume DOT
      const ctorName = this.advance().value;
      // Look up the type name for this constructor
      const typeName = this.inductiveCtors.get(ctorName);
      if (typeName) {
        return AST.ident(`${typeName}.${ctorName}`, loc);
      }
      // If not found, just use the constructor name as-is
      return AST.ident(ctorName, loc);
    }

    // Identifier
    if (this.check(TokenType.IDENT)) {
      const name = this.advance().value;
      let fullName = name;

      // Handle namespaced identifiers (e.g., Foo.bar, List.nil, Tree.leaf)
      // But NOT field access (e.g., foo.1 or foo.bar where foo is a value)
      // Heuristic: if the first part starts with uppercase, it's a type/namespace,
      // so consume dots as namespace separators
      // BUT: stop if we see .lowercase that is NOT a constructor of the current type
      // (because .lowercase might be an enum constructor argument like .red, .black)
      const startsLowercase = name[0] === name[0].toLowerCase();
      if (!startsLowercase) {
        // First part is uppercase - this is a type/namespace
        while (this.check(TokenType.DOT) && (this.peek(1).type === TokenType.IDENT || this.isKeywordAsIdentAt(1))) {
          const nextIdent = this.peek(1).value;
          // Check if nextIdent is a constructor of fullName type
          const ctorOfType = this.inductiveCtors.get(nextIdent);
          const isCtorOfCurrentType = ctorOfType === fullName;

          // If it's a constructor of the current type, consume it
          // If it's a constructor of a different type, stop (it's an enum arg)
          // If it's not a known constructor and starts with lowercase, stop
          if (ctorOfType && ctorOfType !== fullName) {
            // It's an enum constructor of a different type - stop
            break;
          }
          if (!ctorOfType && nextIdent[0] === nextIdent[0].toLowerCase()) {
            // Unknown lowercase identifier - might be an enum arg
            break;
          }

          this.advance(); // consume DOT
          fullName = fullName + '.' + this.advance().value;
        }
      }

      return AST.ident(fullName, loc);
    }

    throw new ParseError(`Unexpected token: ${this.current().value}`, this.current());
  }

  // Parse lambda params, supporting tuple patterns like (k, p)
  // Returns binders and optional pattern-match transformations
  private parseLambdaParams(): { params: AST.Binder[], patterns: { paramName: string, pattern: AST.Pattern }[] } {
    const params: AST.Binder[] = [];
    const patterns: { paramName: string, pattern: AST.Pattern }[] = [];

    while (true) {
      this.skipNewlinesAndComments();

      // Check for arrow/fat arrow
      if (this.check(TokenType.FAT_ARROW) || this.check(TokenType.ARROW)) break;

      // Check for tuple pattern in parentheses like (k, p)
      if (this.check(TokenType.LPAREN)) {
        const startPos = this.pos;
        this.advance(); // consume (
        this.skipNewlinesAndComments();

        // Check if this is a tuple pattern (ident, ident) or (ident : type)
        const firstIdent = this.check(TokenType.IDENT) ? this.advance().value : null;
        this.skipNewlinesAndComments();

        if (firstIdent && this.check(TokenType.COMMA)) {
          // This is a tuple pattern - reset and parse as pattern
          this.pos = startPos;

          // Parse the pattern
          const pattern = this.parsePattern();

          // Create a synthetic parameter name
          const paramName = `_tupleArg${params.length}`;
          params.push({ name: paramName, type: undefined, implicit: false, instImplicit: false, strictImplicit: false });
          patterns.push({ paramName, pattern });

          this.skipNewlinesAndComments();
        } else if (firstIdent && this.check(TokenType.COLON)) {
          // This is a typed binder (x : T) - reset and parse as binder
          this.pos = startPos;
          const binders = this.parseBindersGroup();
          if (binders.length > 0) {
            params.push(...binders);
          } else {
            break;
          }
        } else if (firstIdent) {
          // Multiple identifiers without colon - could be (x y z) or just single ident
          // Reset and use normal binder parsing
          this.pos = startPos;
          const binders = this.parseBindersGroup();
          if (binders.length > 0) {
            params.push(...binders);
          } else {
            break;
          }
        } else {
          // Not an identifier - reset and try normal parsing
          this.pos = startPos;
          const binder = this.parseBinder();
          if (!binder) break;
          params.push(binder);
        }
      } else {
        // Normal binder parsing
        const binder = this.parseBinder();
        if (!binder) break;
        params.push(binder);
      }
    }

    return { params, patterns };
  }

  // Wrap body with pattern matches for tuple pattern parameters
  // Transforms: fun (k, p) => body  into  fun _arg0 => match _arg0 with | (k, p) => body
  private wrapBodyWithPatternMatches(body: AST.Expr, patterns: { paramName: string, pattern: AST.Pattern }[]): AST.Expr {
    if (patterns.length === 0) return body;

    let result = body;
    // Process patterns in reverse order to build nested matches
    for (let i = patterns.length - 1; i >= 0; i--) {
      const { paramName, pattern } = patterns[i];
      result = {
        kind: 'match',
        scrutinee: { kind: 'ident', name: paramName, loc: this.loc() },
        cases: [{
          pattern,
          body: result,
          loc: this.loc()
        }],
        loc: this.loc()
      };
    }
    return result;
  }

  // Parse the value part of a let expression, stopping at newline
  private parseLetValue(): AST.Expr {
    // Parse a single-line expression for the let value
    // We need to stop before consuming the newline
    return this.parseImpliesExpr();
  }

  // Parse an expression that stays on the same line
  private parseSingleLineExpr(startLine: number): AST.Expr {
    // Set single-line mode for nested parsing (e.g., lambda bodies)
    const prevMode = this.singleLineMode;
    const prevLine = this.singleLineStart;
    this.singleLineMode = true;
    this.singleLineStart = startLine;

    try {
      // Parse expression but stop when we hit a newline
      let left = this.parseSingleLineOrExpr(startLine);

      while (this.current().line === startLine && (this.match(TokenType.RARROW2) || this.match(TokenType.ARROW))) {
        const right = this.parseSingleLineOrExpr(startLine);
        left = AST.binOp('implies', left, right, this.loc());
      }

      return left;
    } finally {
      // Restore previous mode
      this.singleLineMode = prevMode;
      this.singleLineStart = prevLine;
    }
  }

  private parseSingleLineOrExpr(startLine: number): AST.Expr {
    let left = this.parseSingleLineAndExpr(startLine);

    // Allow || to span multiple lines by skipping newlines after the operator
    while (this.match(TokenType.LOR) || this.match(TokenType.OR)) {
      this.skipNewlinesAndComments();
      const right = this.parseSingleLineAndExpr(this.current().line);
      left = AST.binOp('or', left, right, this.loc());
    }

    return left;
  }

  private parseSingleLineAndExpr(startLine: number): AST.Expr {
    let left = this.parseSingleLineComparisonExpr(startLine);

    // Allow && to span multiple lines by skipping newlines after the operator
    while (this.match(TokenType.LAND) || this.match(TokenType.AND)) {
      this.skipNewlinesAndComments();
      const right = this.parseSingleLineComparisonExpr(this.current().line);
      left = AST.binOp('and', left, right, this.loc());
    }

    return left;
  }

  private parseSingleLineComparisonExpr(startLine: number): AST.Expr {
    let left = this.parseSingleLineAddExpr(startLine);

    while (this.current().line === startLine) {
      let op: AST.BinaryOp | null = null;

      if (this.match(TokenType.EQ)) op = 'eq';
      else if (this.match(TokenType.NE)) op = 'ne';
      else if (this.match(TokenType.LT)) op = 'lt';
      else if (this.match(TokenType.LE)) op = 'le';
      else if (this.match(TokenType.GT)) op = 'gt';
      else if (this.match(TokenType.GE)) op = 'ge';
      else if (this.current().value === '==') {
        this.advance();
        op = 'eq';
      }

      if (!op) break;

      const right = this.parseSingleLineAddExpr(startLine);
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseSingleLineAddExpr(startLine: number): AST.Expr {
    let left = this.parseSingleLineMulExpr(startLine);

    while (this.current().line === startLine && (this.check(TokenType.PLUS) || this.check(TokenType.MINUS) || this.check(TokenType.APPEND) || this.check(TokenType.DCOLON))) {
      let op: AST.BinaryOp;
      const tokenType = this.advance().type;
      if (tokenType === TokenType.PLUS) {
        op = 'add';
      } else if (tokenType === TokenType.MINUS) {
        op = 'sub';
      } else if (tokenType === TokenType.DCOLON) {
        op = 'cons';
      } else {
        op = 'append';
      }
      const right = tokenType === TokenType.DCOLON ? this.parseSingleLineAddExpr(startLine) : this.parseSingleLineMulExpr(startLine);
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseSingleLineMulExpr(startLine: number): AST.Expr {
    let left = this.parseSingleLineUnaryExpr(startLine);

    while (this.current().line === startLine && (this.check(TokenType.STAR) || this.check(TokenType.SLASH) || this.check(TokenType.PERCENT) || this.check(TokenType.MULTIPLIER))) {
      let op: AST.BinaryOp;
      const tokenType = this.advance().type;
      switch (tokenType) {
        case TokenType.STAR: op = 'mul'; break;
        case TokenType.SLASH: op = 'div'; break;
        case TokenType.MULTIPLIER: op = 'mul'; break;
        default: op = 'mod';
      }
      const right = this.parseSingleLineUnaryExpr(startLine);
      left = AST.binOp(op, left, right, this.loc());
    }

    return left;
  }

  private parseSingleLineUnaryExpr(startLine: number): AST.Expr {
    if (this.current().line !== startLine) {
      return this.parsePrimaryExpr();
    }

    if (this.match(TokenType.BANG) || this.match(TokenType.LNOT)) {
      const operand = this.parseSingleLineUnaryExpr(startLine);
      return AST.unaryOp('not', operand, this.loc());
    }

    if (this.match(TokenType.MINUS)) {
      const operand = this.parseSingleLineUnaryExpr(startLine);
      return AST.unaryOp('neg', operand, this.loc());
    }

    return this.parseSingleLineAppExpr(startLine);
  }

  private parseSingleLineAppExpr(startLine: number): AST.Expr {
    let expr = this.parsePrimaryExpr();
    // Consume any field accesses on the initial expression
    while (this.match(TokenType.DOT)) {
      if (this.check(TokenType.NUMBER)) {
        const field = this.advance().value;
        expr = {
          kind: 'fieldAccess',
          object: expr,
          field,
          loc: this.loc()
        };
      } else if (this.check(TokenType.IDENT)) {
        const field = this.advance().value;
        expr = {
          kind: 'fieldAccess',
          object: expr,
          field,
          loc: this.loc()
        };
      } else {
        break;
      }
    }

    while (this.current().line === startLine) {
      // Try to parse an argument
      if (this.current().line !== startLine) break;
      if (this.checkAny(TokenType.RPAREN, TokenType.RBRACE, TokenType.RBRACKET, TokenType.NEWLINE, TokenType.EOF, TokenType.PIPE, TokenType.COMMA, TokenType.SEMI, TokenType.COLON, TokenType.ASSIGN, TokenType.ARROW, TokenType.FAT_ARROW, TokenType.THEN, TokenType.ELSE, TokenType.DO, TokenType.WHERE)) {
        break;
      }
      if (this.check(TokenType.DOT)) break; // Field access on whole expression comes later

      const arg = this.tryParsePrimaryExprWithFieldAccess();
      if (!arg) break;
      expr = AST.app(expr, arg, true, this.loc());
    }

    return expr;
  }

  private parsePattern(): AST.Pattern {
    // Parse cons patterns (right-associative): head :: tail
    const head = this.parseAtomicPatternOrCons();
    return head;
  }

  private parseAtomicPatternOrCons(): AST.Pattern {
    const loc = this.loc();
    const head = this.parseAtomicPatternActual();

    // Check for cons pattern: head :: tail
    if (this.match(TokenType.DCOLON)) {
      const tail = this.parseAtomicPatternOrCons(); // Right-associative
      return AST.ctorPattern('cons', [head, tail], loc);
    }

    return head;
  }

  private parseAtomicPatternActual(): AST.Pattern {
    const loc = this.loc();

    // Wildcard
    if (this.match(TokenType.HOLE)) {
      return AST.wildcardPattern(loc);
    }

    // Dot notation for enum constructors (.red, .black, etc.)
    // Resolve to TypeName.constructor based on inductiveCtors map
    if (this.match(TokenType.DOT)) {
      if (this.check(TokenType.IDENT)) {
        const ctorName = this.advance().value;
        // Look up the type name for this constructor
        const typeName = this.inductiveCtors.get(ctorName);
        if (typeName) {
          const fullName = `${typeName}.${ctorName}`;
          // Parse any arguments
          const args: AST.Pattern[] = [];
          while (!this.checkAny(TokenType.FAT_ARROW, TokenType.ARROW, TokenType.ASSIGN, TokenType.PIPE, TokenType.NEWLINE, TokenType.EOF, TokenType.COMMA, TokenType.RPAREN, TokenType.RBRACKET)) {
            const arg = this.parseAtomicPatternNoArgs();
            if (!arg) break;
            args.push(arg);
          }
          return AST.ctorPattern(fullName, args, loc);
        }
        // If not found, just use the constructor name as-is
        return AST.ctorPattern(ctorName, [], loc);
      }
      throw new ParseError("Expected constructor name after '.'", this.current());
    }

    // Literal pattern
    if (this.check(TokenType.NUMBER)) {
      const value = this.advance().value;
      return AST.litPattern(value, 'nat', loc);
    }

    if (this.check(TokenType.STRING)) {
      return AST.litPattern(this.advance().value, 'string', loc);
    }

    // Negative number
    if (this.check(TokenType.MINUS) && this.peek(1).type === TokenType.NUMBER) {
      this.advance();
      const value = '-' + this.advance().value;
      return AST.litPattern(value, 'int', loc);
    }

    // Boolean patterns
    if (this.current().value === 'true') {
      this.advance();
      return AST.litPattern(true, 'bool', loc);
    }
    if (this.current().value === 'false') {
      this.advance();
      return AST.litPattern(false, 'bool', loc);
    }

    // List pattern [] or [p1, p2, ...]
    if (this.match(TokenType.LBRACKET)) {
      if (this.match(TokenType.RBRACKET)) {
        return AST.ctorPattern('nil', [], loc);
      }

      // Parse list elements
      const elements: AST.Pattern[] = [];
      do {
        this.skipNewlinesAndComments();
        elements.push(this.parsePattern());
        this.skipNewlinesAndComments();
      } while (this.match(TokenType.COMMA));

      this.expect(TokenType.RBRACKET, "Expected ']'");

      // Build cons pattern from elements: [a, b, c] = cons a (cons b (cons c nil))
      let result: AST.Pattern = AST.ctorPattern('nil', [], loc);
      for (let i = elements.length - 1; i >= 0; i--) {
        result = AST.ctorPattern('cons', [elements[i], result], loc);
      }
      return result;
    }

    // Tuple/parenthesized pattern
    if (this.match(TokenType.LPAREN)) {
      this.skipNewlinesAndComments();

      // Empty tuple
      if (this.match(TokenType.RPAREN)) {
        return AST.ctorPattern('Unit.mk', [], loc);
      }

      const elements: AST.Pattern[] = [];

      // Check for named element (x : T)
      if (this.check(TokenType.IDENT) && this.peek(1).type === TokenType.COLON) {
        // Named pattern - just get the name
        const name = this.advance().value;
        this.advance(); // consume ':'
        this.parseExpr(); // consume type (ignored in pattern)
        this.expect(TokenType.RPAREN, "Expected ')'");
        return AST.varPattern(name, loc);
      }

      do {
        this.skipNewlinesAndComments();
        elements.push(this.parsePattern());
        this.skipNewlinesAndComments();
      } while (this.match(TokenType.COMMA));

      this.expect(TokenType.RPAREN, "Expected ')'");

      if (elements.length === 1) {
        return elements[0];
      }

      return { kind: 'tuple', elements, loc };
    }

    // Constructor or variable pattern
    // Also accept keywords as constructor names (for cases like Pattern.variable)
    if (this.check(TokenType.IDENT) || this.isKeywordAsIdent()) {
      const name = this.advance().value;

      // Handle namespaced constructors like Tree.leaf, Option.some, Pattern.variable
      // But NOT .lowercase which is an enum constructor argument (like .red, .black)
      let fullName = name;
      while (this.check(TokenType.DOT)) {
        // Peek at the next token - can be IDENT or a keyword used as constructor name
        const nextIdent = this.peek(1);
        if (nextIdent.type === TokenType.IDENT || this.isKeywordAsIdentAt(1)) {
          // Check if current fullName is a known type (has constructors)
          // If so, this is TypeName.constructor, keep consuming
          // If not, and the next ident starts with lowercase, it's an enum arg
          const isKnownType = Array.from(this.inductiveCtors.values()).includes(fullName);
          const isQualifiedCtor = this.inductiveCtors.has(fullName + '.' + nextIdent.value);
          const isCtor = this.inductiveCtors.has(fullName);

          // If fullName.field is a known constructor, always consume it
          if (isQualifiedCtor) {
            this.advance(); // consume DOT
            fullName = fullName + '.' + this.advance().value;
            continue;
          }

          if (!isKnownType && nextIdent.value[0] === nextIdent.value[0].toLowerCase()) {
            // Not a known type and lowercase - treat as enum constructor arg
            break;
          }

          // Otherwise consume as namespaced name
          this.advance(); // consume DOT
          fullName = fullName + '.' + this.advance().value;
        } else {
          break;
        }
      }

      // Check for cons pattern h :: t (using :: operator)
      if (this.match(TokenType.DCOLON)) {
        const head = AST.varPattern(fullName, loc);
        const tail = this.parseAtomicPattern();
        if (tail) {
          return AST.ctorPattern('cons', [head, tail], loc);
        }
      }

      // Check for n + k pattern (e.g., m + 1)
      if (this.match(TokenType.PLUS)) {
        if (this.check(TokenType.NUMBER)) {
          const k = parseInt(this.advance().value);
          // n + k pattern: matches values >= k, binds n to (value - k)
          return { kind: 'nplusk', name: fullName, k, loc };
        }
      }

      // Check if it's a constructor with arguments
      // For constructors (uppercase, namespaced, or known lowercase ctors), parse arguments
      const lowercaseCtors = ['none', 'some', 'nil', 'cons', 'inl', 'inr', 'ok', 'error'];
      const isCtor = fullName[0] === fullName[0].toUpperCase() || fullName.includes('.') || lowercaseCtors.includes(fullName);

      if (isCtor) {
        const args: AST.Pattern[] = [];

        // Parse arguments until we hit a terminator
        // Use parseAtomicPatternNoArgs to avoid recursive arg parsing
        while (!this.checkAny(TokenType.FAT_ARROW, TokenType.ARROW, TokenType.ASSIGN, TokenType.PIPE, TokenType.NEWLINE, TokenType.EOF, TokenType.COMMA, TokenType.RPAREN, TokenType.RBRACKET)) {
          const arg = this.parseAtomicPatternNoArgs();
          if (!arg) break;
          args.push(arg);
        }

        // Return constructor pattern with arguments (even if empty)
        return AST.ctorPattern(fullName, args, loc);
      }

      // Check for @ pattern (as pattern)
      if (this.match(TokenType.AT)) {
        const pattern = this.parsePattern();
        return { kind: 'as', name: fullName, pattern, loc };
      }

      // If starts with uppercase or contains '.', it's a constructor
      // Also check for known lowercase constructors (none, some, nil, cons, inl, inr, etc.)
      if (fullName[0] === fullName[0].toUpperCase() || fullName.includes('.') || lowercaseCtors.includes(fullName)) {
        return AST.ctorPattern(fullName, [], loc);
      }

      // Otherwise it's a variable
      return AST.varPattern(fullName, loc);
    }

    throw new ParseError(`Invalid pattern: ${this.current().value}`, this.current());
  }

  // Parse atomic pattern without consuming constructor arguments
  // Used when parsing arguments to a constructor to avoid recursive arg parsing
  private parseAtomicPatternNoArgs(): AST.Pattern | null {
    const loc = this.loc();

    // Wildcard
    if (this.match(TokenType.HOLE)) {
      return AST.wildcardPattern(loc);
    }

    // Dot notation for enum constructors (.red, .black, etc.)
    if (this.check(TokenType.DOT) && this.peek(1).type === TokenType.IDENT) {
      this.advance(); // consume DOT
      const ctorName = this.advance().value;
      // Look up the type name for this constructor
      const typeName = this.inductiveCtors.get(ctorName);
      if (typeName) {
        return AST.ctorPattern(`${typeName}.${ctorName}`, [], loc);
      }
      return AST.ctorPattern(ctorName, [], loc);
    }

    // Literal pattern
    if (this.check(TokenType.NUMBER)) {
      const value = this.advance().value;
      return AST.litPattern(value, 'nat', loc);
    }

    if (this.check(TokenType.STRING)) {
      return AST.litPattern(this.advance().value, 'string', loc);
    }

    // Negative number
    if (this.check(TokenType.MINUS) && this.peek(1).type === TokenType.NUMBER) {
      this.advance(); // consume -
      const value = '-' + this.advance().value;
      return AST.litPattern(value, 'int', loc);
    }

    // Parenthesized pattern
    if (this.check(TokenType.LPAREN)) {
      return this.parseAtomicPatternActual(); // Use full parser for parens
    }

    // Array pattern
    if (this.check(TokenType.LBRACKET)) {
      return this.parseAtomicPatternActual(); // Use full parser for brackets
    }

    // Identifier - return as variable or constructor WITHOUT parsing args
    if (this.check(TokenType.IDENT)) {
      const name = this.advance().value;

      // Handle namespaced names
      let fullName = name;
      while (this.match(TokenType.DOT)) {
        if (this.check(TokenType.IDENT)) {
          fullName = fullName + '.' + this.advance().value;
        }
      }

      const lowercaseCtors = ['none', 'some', 'nil', 'cons', 'inl', 'inr', 'ok', 'error'];
      const isCtor = fullName[0] === fullName[0].toUpperCase() || fullName.includes('.') || lowercaseCtors.includes(fullName);

      if (isCtor) {
        // Return constructor with NO arguments
        return AST.ctorPattern(fullName, [], loc);
      }

      return AST.varPattern(fullName, loc);
    }

    return null;
  }

  private parseAtomicPattern(): AST.Pattern | null {
    // Use parseAtomicPatternActual but return null on failure
    try {
      const loc = this.loc();

      if (this.check(TokenType.HOLE)) {
        return this.parseAtomicPatternActual();
      }

      if (this.check(TokenType.NUMBER)) {
        return this.parseAtomicPatternActual();
      }

      if (this.check(TokenType.STRING)) {
        return this.parseAtomicPatternActual();
      }

      if (this.check(TokenType.IDENT)) {
        return this.parseAtomicPatternActual();
      }

      if (this.check(TokenType.LPAREN)) {
        return this.parseAtomicPatternActual();
      }

      if (this.check(TokenType.LBRACKET)) {
        return this.parseAtomicPatternActual();
      }

      return null;
    } catch {
      return null;
    }
  }

  private parseDoStatements(): AST.DoStatement[] {
    const statements: AST.DoStatement[] = [];

    while (!this.isAtEnd()) {
      this.skipNewlinesAndComments();

      if (this.check(TokenType.END) || this.check(TokenType.ELSE)) break;

      // Let binding
      if (this.match(TokenType.LET)) {
        this.skipNewlinesAndComments();

        // Check for 'rec' keyword for recursive let
        let isRecursive = false;
        if (this.check(TokenType.IDENT) && this.current().value === 'rec') {
          isRecursive = true;
          this.advance(); // consume 'rec'
          this.skipNewlinesAndComments();
        }

        const name = this.expect(TokenType.IDENT, "Expected identifier").value;
        this.skipNewlinesAndComments();

        let type: AST.Expr | undefined;
        if (this.match(TokenType.COLON)) {
          this.skipNewlinesAndComments();
          type = this.parseExpr();
          this.skipNewlinesAndComments();
        }

        this.expect(TokenType.ASSIGN, "Expected ':='");
        this.skipNewlinesAndComments();
        const value = this.parseExpr();

        statements.push({ kind: 'let', name, type, value, recursive: isRecursive });
        continue;
      }

      // Return
      if (this.match(TokenType.RETURN)) {
        this.skipNewlinesAndComments();
        const expr = this.parseExpr();
        statements.push({ kind: 'return', expr });
        continue;
      }

      // Bind: x ← e
      if (this.check(TokenType.IDENT) && this.peek(1).type === TokenType.LARROW2) {
        const name = this.advance().value;
        this.advance(); // consume ←
        this.skipNewlinesAndComments();
        const expr = this.parseExpr();
        statements.push({ kind: 'bind', name, expr });
        continue;
      }

      // Expression
      const expr = this.tryParsePrimaryExpr();
      if (expr) {
        statements.push({ kind: 'doExpr', expr });
      } else {
        break;
      }
    }

    return statements;
  }

  // Count the number of holes (·) in an expression
  private countHoles(expr: AST.Expr): number {
    switch (expr.kind) {
      case 'hole':
        return 1;
      case 'ident':
      case 'literal':
      case 'type':
      case 'sort':
      case 'prop':
        return 0;
      case 'app':
        return this.countHoles(expr.fn) + this.countHoles(expr.arg);
      case 'lambda':
      case 'fun':
        return this.countHoles(expr.body);
      case 'let':
        return this.countHoles(expr.value) + (expr.body ? this.countHoles(expr.body) : 0);
      case 'if':
        return this.countHoles(expr.cond) + this.countHoles(expr.thenBranch) +
               (expr.elseBranch ? this.countHoles(expr.elseBranch) : 0);
      case 'match':
        let count = this.countHoles(expr.scrutinee);
        for (const c of expr.cases) {
          count += this.countHoles(c.body);
        }
        return count;
      case 'binOp':
        return this.countHoles(expr.left) + this.countHoles(expr.right);
      case 'unaryOp':
        return this.countHoles(expr.operand);
      case 'paren':
        return this.countHoles(expr.expr);
      case 'tuple':
        return expr.elements.reduce((sum, e) => sum + this.countHoles(e), 0);
      case 'arrayLit':
        return expr.elements.reduce((sum, e) => sum + this.countHoles(e), 0);
      case 'fieldAccess':
        return this.countHoles(expr.object);
      case 'proj':
        return this.countHoles(expr.expr);
      case 'structLit':
        return expr.fields.reduce((sum, f) => sum + this.countHoles(f.value), 0);
      case 'do':
        return expr.statements.reduce((sum, s) => {
          if (s.kind === 'let') return sum + this.countHoles(s.value);
          if (s.kind === 'bind') return sum + this.countHoles(s.expr);
          if (s.kind === 'doExpr') return sum + this.countHoles(s.expr);
          if (s.kind === 'return') return sum + this.countHoles(s.expr);
          return sum;
        }, 0);
      default:
        return 0;
    }
  }

  // Transform holes (·) into lambda parameters
  // (· ++ ·) becomes fun _arg0 _arg1 => _arg0 ++ _arg1
  private transformHolesToLambda(expr: AST.Expr, holeCount: number, loc: AST.SourceLocation): AST.Expr {
    const paramNames: string[] = [];
    for (let i = 0; i < holeCount; i++) {
      paramNames.push(`_holeArg${i}`);
    }

    const transformedBody = this.replaceHolesWithParams(expr, paramNames, 0).expr;
    const params: AST.Binder[] = paramNames.map(name => ({
      name,
      type: undefined,
      implicit: false,
      instImplicit: false,
      strictImplicit: false
    }));

    return { kind: 'fun', params, body: transformedBody, loc };
  }

  // Replace holes with parameter names, returns the transformed expression and the next hole index
  private replaceHolesWithParams(expr: AST.Expr, paramNames: string[], holeIndex: number): { expr: AST.Expr; holeIndex: number } {
    switch (expr.kind) {
      case 'hole':
        return { expr: AST.ident(paramNames[holeIndex], expr.loc), holeIndex: holeIndex + 1 };

      case 'app': {
        const fnResult = this.replaceHolesWithParams(expr.fn, paramNames, holeIndex);
        const argResult = this.replaceHolesWithParams(expr.arg, paramNames, fnResult.holeIndex);
        return { expr: AST.app(fnResult.expr, argResult.expr, expr.explicit, expr.loc), holeIndex: argResult.holeIndex };
      }

      case 'binOp': {
        const leftResult = this.replaceHolesWithParams(expr.left, paramNames, holeIndex);
        const rightResult = this.replaceHolesWithParams(expr.right, paramNames, leftResult.holeIndex);
        return { expr: AST.binOp(expr.op, leftResult.expr, rightResult.expr, expr.loc), holeIndex: rightResult.holeIndex };
      }

      case 'paren': {
        const innerResult = this.replaceHolesWithParams(expr.expr, paramNames, holeIndex);
        return { expr: { kind: 'paren', expr: innerResult.expr, loc: expr.loc }, holeIndex: innerResult.holeIndex };
      }

      case 'tuple': {
        let idx = holeIndex;
        const elements = expr.elements.map(e => {
          const result = this.replaceHolesWithParams(e, paramNames, idx);
          idx = result.holeIndex;
          return result.expr;
        });
        return { expr: { kind: 'tuple', elements, loc: expr.loc }, holeIndex: idx };
      }

      case 'arrayLit': {
        let idx = holeIndex;
        const elements = expr.elements.map(e => {
          const result = this.replaceHolesWithParams(e, paramNames, idx);
          idx = result.holeIndex;
          return result.expr;
        });
        return { expr: { kind: 'arrayLit', elements, loc: expr.loc }, holeIndex: idx };
      }

      case 'ident':
      case 'literal':
      case 'type':
      case 'sort':
      case 'prop':
        return { expr, holeIndex };

      default:
        // For other expression types, just return as-is
        return { expr, holeIndex };
    }
  }

  // Helper method to parse an expression from a string (for interpolated strings)
  private parseExpressionString(exprStr: string): AST.Expr {
    // Wrap in a def and parse
    const fakeSource = `def __interp_expr := ${exprStr}`;
    const module = parse(fakeSource);
    const def = module.decls[0];
    if (def.kind === 'def') {
      return def.value;
    }
    // Fallback: return identifier
    return { kind: 'ident', name: exprStr.trim() };
  }
}

export function parse(source: string): AST.Module {
  const parser = new Parser();
  return parser.parse(source);
}
