// Lean4 Token Types

export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  CHAR = 'CHAR',
  INTERPOLATED_STRING = 'INTERPOLATED_STRING',  // s!"..." with {expr}

  // Identifiers and keywords
  IDENT = 'IDENT',
  HOLE = 'HOLE',  // _

  // Keywords
  DEF = 'DEF',
  THEOREM = 'THEOREM',
  AXIOM = 'AXIOM',
  CONSTANT = 'CONSTANT',
  INDUCTIVE = 'INDUCTIVE',
  STRUCTURE = 'STRUCTURE',
  CLASS = 'CLASS',
  INSTANCE = 'INSTANCE',
  EXTENDS = 'EXTENDS',
  WHERE = 'WHERE',
  WITH = 'WITH',
  IF = 'IF',
  THEN = 'THEN',
  ELSE = 'ELSE',
  MATCH = 'MATCH',
  CASE = 'CASE',
  DO = 'DO',
  LET = 'LET',
  IN = 'IN',
  HAVE = 'HAVE',
  SHOW = 'SHOW',
  FUN = 'FUN',
  FORALL = 'FORALL',
  EXISTS = 'EXISTS',
  TYPE = 'TYPE',
  SORT = 'SORT',
  PROP = 'PROP',
  IMPORT = 'IMPORT',
  OPEN = 'OPEN',
  NAMESPACE = 'NAMESPACE',
  END = 'END',
  VARIABLE = 'VARIABLE',
  UNIVERSAL = 'UNIVERSAL',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
  PARTIAL = 'PARTIAL',
  MUT = 'MUT',
  RETURN = 'RETURN',
  TERMINATION_BY = 'TERMINATION_BY',
  DECREASING_BY = 'DECREASING_BY',
  ALL_GOALS = 'ALL_GOALS',
  SIMP = 'SIMP',
  OMEGA = 'OMEGA',

  // Operators
  ARROW = 'ARROW',         // ->
  FAT_ARROW = 'FAT_ARROW', // =>
  LARROW = 'LARROW',       // <-
  COLON = 'COLON',         // :
  DCOLON = 'DCOLON',       // ::
  ASSIGN = 'ASSIGN',       // :=
  DOT = 'DOT',             // .
  COMMA = 'COMMA',         // ,
  SEMI = 'SEMI',           // ;
  PIPE = 'PIPE',           // |
  PIPE_FWD = 'PIPE_FWD',   // |>
  HASH = 'HASH',           // #
  AT = 'AT',               // @
  BANG = 'BANG',           // !
  QUESTION = 'QUESTION',   // ?
  APPEND = 'APPEND',       // ++

  // Brackets
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  LANGLE = 'LANGLE',
  RANGLE = 'RANGLE',
  LTUPLE = 'LTUPLE',       // ⟨ (U+27E8) anonymous constructor
  RTUPLE = 'RTUPLE',       // ⟩ (U+27E9) anonymous constructor
  LDQUOTE = 'LDQUOTE',     // «
  RDQUOTE = 'RDQUOTE',     // »

  // Math operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  PERCENT = 'PERCENT',
  EQ = 'EQ',
  NE = 'NE',
  LT = 'LT',
  LE = 'LE',
  GT = 'GT',
  GE = 'GE',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  LAND = 'LAND',           // ∧
  LOR = 'LOR',             // ∨
  LNOT = 'LNOT',           // ¬
  LARROW2 = 'LARROW2',     // ←
  RARROW2 = 'RARROW2',     // →
  LRARROW = 'LRARROW',     // ↔
  FORALL2 = 'FORALL2',     // ∀
  EXISTS2 = 'EXISTS2',     // ∃
  LAMBDA = 'LAMBDA',       // λ
  PI = 'PI',               // Π
  SUM = 'SUM',             // Σ
  MULTIPLIER = 'MULTIPLIER', // ×
  UNION = 'UNION',         // ∪
  INTER = 'INTER',         // ∩
  SUBSET = 'SUBSET',       // ⊆
  IN2 = 'IN2',             // ∈
  NOTIN = 'NOTIN',         // ∉
  EMPTYSET = 'EMPTYSET',   // ∅

  // Special
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
  COMMENT = 'COMMENT',
  DOCSTRING = 'DOCSTRING'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  raw?: string;
}

export const KEYWORDS: Record<string, TokenType> = {
  'def': TokenType.DEF,
  'theorem': TokenType.THEOREM,
  'axiom': TokenType.AXIOM,
  'constant': TokenType.CONSTANT,
  'inductive': TokenType.INDUCTIVE,
  'structure': TokenType.STRUCTURE,
  'class': TokenType.CLASS,
  'instance': TokenType.INSTANCE,
  'where': TokenType.WHERE,
  'with': TokenType.WITH,
  'if': TokenType.IF,
  'then': TokenType.THEN,
  'else': TokenType.ELSE,
  'match': TokenType.MATCH,
  'case': TokenType.CASE,
  'do': TokenType.DO,
  'let': TokenType.LET,
  'in': TokenType.IN,
  'have': TokenType.HAVE,
  'show': TokenType.SHOW,
  'fun': TokenType.FUN,
  'forall': TokenType.FORALL,
  'exists': TokenType.EXISTS,
  'Type': TokenType.TYPE,
  'Sort': TokenType.SORT,
  'Prop': TokenType.PROP,
  'import': TokenType.IMPORT,
  'open': TokenType.OPEN,
  'namespace': TokenType.NAMESPACE,
  'end': TokenType.END,
  'variable': TokenType.VARIABLE,
  'universe': TokenType.UNIVERSAL,
  'private': TokenType.PRIVATE,
  'protected': TokenType.PROTECTED,
  'partial': TokenType.PARTIAL,
  'mut': TokenType.MUT,
  'return': TokenType.RETURN,
  'termination_by': TokenType.TERMINATION_BY,
  'decreasing_by': TokenType.DECREASING_BY,
  'all_goals': TokenType.ALL_GOALS,
  'simp': TokenType.SIMP,
  'omega': TokenType.OMEGA,
  'extends': TokenType.EXTENDS,
  '_': TokenType.HOLE
};
