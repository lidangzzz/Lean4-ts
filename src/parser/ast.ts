// Lean4 Abstract Syntax Tree

export interface SourceLocation {
  line: number;
  column: number;
}

export interface BaseNode {
  loc?: SourceLocation;
}

// Expressions
export type Expr =
  | LiteralExpr
  | IdentExpr
  | HoleExpr
  | AppExpr
  | LambdaExpr
  | PiExpr
  | LetExpr
  | IfExpr
  | MatchExpr
  | DoExpr
  | HaveExpr
  | ShowExpr
  | TypeExpr
  | SortExpr
  | PropExpr
  | FieldAccessExpr
  | ProjExpr
  | ArrayLitExpr
  | BinOpExpr
  | UnaryOpExpr
  | ParenExpr
  | QuoteExpr
  | AntiquotExpr
  | MacroExpr
  | ForallExpr
  | ExistsExpr
  | FunExpr
  | TupleExpr
  | StructLitExpr;

export interface LiteralExpr extends BaseNode {
  kind: 'literal';
  type: 'nat' | 'int' | 'float' | 'string' | 'char' | 'bool';
  value: string | number | boolean;
}

export interface IdentExpr extends BaseNode {
  kind: 'ident';
  name: string;
  namespace?: string[];
}

export interface HoleExpr extends BaseNode {
  kind: 'hole';
  name?: string;
}

export interface AppExpr extends BaseNode {
  kind: 'app';
  fn: Expr;
  arg: Expr;
  explicit: boolean;
}

export interface LambdaExpr extends BaseNode {
  kind: 'lambda';
  params: Binder[];
  body: Expr;
}

export interface PiExpr extends BaseNode {
  kind: 'pi';
  params: Binder[];
  body: Expr;
}

export interface LetExpr extends BaseNode {
  kind: 'let';
  name: string;
  type?: Expr;
  value: Expr;
  body?: Expr;
  recursive: boolean;
}

export interface IfExpr extends BaseNode {
  kind: 'if';
  cond: Expr;
  thenBranch: Expr;
  elseBranch?: Expr;
}

export interface MatchExpr extends BaseNode {
  kind: 'match';
  scrutinee: Expr;
  cases: MatchCase[];
}

export interface MatchCase extends BaseNode {
  pattern: Pattern;
  body: Expr;
}

export interface DoExpr extends BaseNode {
  kind: 'do';
  statements: DoStatement[];
}

export type DoStatement =
  | DoLet
  | DoBind
  | DoExprStatement
  | DoReturn;

export interface DoLet extends BaseNode {
  kind: 'let';
  name: string;
  type?: Expr;
  value: Expr;
  recursive: boolean;
}

export interface DoBind extends BaseNode {
  kind: 'bind';
  name: string;
  expr: Expr;
}

export interface DoExprStatement extends BaseNode {
  kind: 'doExpr';
  expr: Expr;
}

export interface DoReturn extends BaseNode {
  kind: 'return';
  expr: Expr;
}

export interface HaveExpr extends BaseNode {
  kind: 'have';
  name: string;
  type: Expr;
  proof: Expr;
  body?: Expr;
}

export interface ShowExpr extends BaseNode {
  kind: 'show';
  type: Expr;
  proof: Expr;
}

export interface TypeExpr extends BaseNode {
  kind: 'type';
  level?: number;
}

export interface SortExpr extends BaseNode {
  kind: 'sort';
  level: number;
}

export interface PropExpr extends BaseNode {
  kind: 'prop';
}

export interface FieldAccessExpr extends BaseNode {
  kind: 'fieldAccess';
  object: Expr;
  field: string;
}

export interface ProjExpr extends BaseNode {
  kind: 'proj';
  expr: Expr;
  index: number;
}

export interface ArrayLitExpr extends BaseNode {
  kind: 'arrayLit';
  elements: Expr[];
}

export interface BinOpExpr extends BaseNode {
  kind: 'binOp';
  op: BinaryOp;
  left: Expr;
  right: Expr;
}

export interface UnaryOpExpr extends BaseNode {
  kind: 'unaryOp';
  op: UnaryOp;
  operand: Expr;
}

export interface ParenExpr extends BaseNode {
  kind: 'paren';
  expr: Expr;
}

export interface QuoteExpr extends BaseNode {
  kind: 'quote';
  expr: Expr;
}

export interface AntiquotExpr extends BaseNode {
  kind: 'antiquot';
  expr: Expr;
}

export interface MacroExpr extends BaseNode {
  kind: 'macro';
  name: string;
  args: Expr[];
}

export interface ForallExpr extends BaseNode {
  kind: 'forall';
  params: Binder[];
  body: Expr;
}

export interface ExistsExpr extends BaseNode {
  kind: 'exists';
  params: Binder[];
  body: Expr;
}

export interface FunExpr extends BaseNode {
  kind: 'fun';
  params: Binder[];
  body: Expr;
}

export interface TupleExpr extends BaseNode {
  kind: 'tuple';
  elements: Expr[];
}

export interface StructLitExpr extends BaseNode {
  kind: 'structLit';
  fields: { name: string; value: Expr }[];
}

export type BinaryOp =
  | 'add' | 'sub' | 'mul' | 'div' | 'mod' | 'pow'
  | 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge'
  | 'and' | 'or' | 'implies' | 'iff'
  | 'cons' | 'append' | 'range';

export type UnaryOp = 'not' | 'neg';

// Binders
export interface Binder extends BaseNode {
  name: string;
  type?: Expr;
  implicit: boolean;  // {x : T}
  instImplicit: boolean;  // [x : T]
  strictImplicit: boolean;  // ⦃x : T⦄
  default?: Expr;
}

// Patterns
export type Pattern =
  | WildcardPattern
  | VarPattern
  | LitPattern
  | CtorPattern
  | TuplePattern
  | ArrayPattern
  | AsPattern
  | NPlusKPattern;

export interface WildcardPattern extends BaseNode {
  kind: 'wildcard';
}

export interface VarPattern extends BaseNode {
  kind: 'var';
  name: string;
}

export interface LitPattern extends BaseNode {
  kind: 'lit';
  value: string | number | boolean;
  type: 'nat' | 'int' | 'string' | 'char' | 'bool';
}

export interface CtorPattern extends BaseNode {
  kind: 'ctor';
  name: string;
  args: Pattern[];
}

export interface TuplePattern extends BaseNode {
  kind: 'tuple';
  elements: Pattern[];
}

export interface ArrayPattern extends BaseNode {
  kind: 'array';
  elements: Pattern[];
}

export interface AsPattern extends BaseNode {
  kind: 'as';
  name: string;
  pattern: Pattern;
}

export interface NPlusKPattern extends BaseNode {
  kind: 'nplusk';
  name: string;
  k: number;
}

// Declarations
export type Decl =
  | DefDecl
  | TheoremDecl
  | AxiomDecl
  | ConstantDecl
  | InductiveDecl
  | StructureDecl
  | ClassDecl
  | InstanceDecl
  | NamespaceDecl
  | VariableDecl
  | UniverseDecl
  | ImportDecl
  | OpenDecl;

export interface DefDecl extends BaseNode {
  kind: 'def';
  name: string;
  params: Binder[];
  type?: Expr;
  value: Expr;
  recursive: boolean;
  docstring?: string;
  private: boolean;
  protected: boolean;
}

export interface TheoremDecl extends BaseNode {
  kind: 'theorem';
  name: string;
  params: Binder[];
  type: Expr;
  proof: Expr;
  docstring?: string;
}

export interface AxiomDecl extends BaseNode {
  kind: 'axiom';
  name: string;
  params: Binder[];
  type: Expr;
  docstring?: string;
}

export interface ConstantDecl extends BaseNode {
  kind: 'constant';
  name: string;
  params: Binder[];
  type: Expr;
  docstring?: string;
}

export interface InductiveDecl extends BaseNode {
  kind: 'inductive';
  name: string;
  params: Binder[];
  type?: Expr;
  ctors: Constructor[];
  docstring?: string;
}

export interface Constructor extends BaseNode {
  name: string;
  params: Binder[];
  type?: Expr;
  docstring?: string;
}

export interface StructureDecl extends BaseNode {
  kind: 'structure';
  name: string;
  params: Binder[];
  extends?: string[];
  fields: Field[];
  docstring?: string;
}

export interface Field extends BaseNode {
  name: string;
  type: Expr;
  default?: Expr;
  docstring?: string;
}

export interface ClassDecl extends BaseNode {
  kind: 'class';
  name: string;
  params: Binder[];
  extends?: string[];
  fields: Field[];
  docstring?: string;
}

export interface InstanceDecl extends BaseNode {
  kind: 'instance';
  name?: string;
  params: Binder[];
  type: Expr;
  value: Expr;
  priority: number;
  docstring?: string;
}

export interface NamespaceDecl extends BaseNode {
  kind: 'namespace';
  name: string;
  decls: Decl[];
}

export interface VariableDecl extends BaseNode {
  kind: 'variable';
  name: string;
  type: Expr;
}

export interface UniverseDecl extends BaseNode {
  kind: 'universe';
  names: string[];
}

export interface ImportDecl extends BaseNode {
  kind: 'import';
  module: string;
  aliases?: string[];
}

export interface OpenDecl extends BaseNode {
  kind: 'open';
  namespace: string;
  names?: string[];
  hiding?: string[];
  renaming?: Map<string, string>;
}

// Module
export interface Module extends BaseNode {
  kind: 'module';
  decls: Decl[];
  header?: string;
}

// Helper functions
export function literal(type: LiteralExpr['type'], value: string | number | boolean, loc?: SourceLocation): LiteralExpr {
  return { kind: 'literal', type, value, loc };
}

export function ident(name: string, loc?: SourceLocation): IdentExpr {
  return { kind: 'ident', name, loc };
}

export function app(fn: Expr, arg: Expr, explicit: boolean = true, loc?: SourceLocation): AppExpr {
  return { kind: 'app', fn, arg, explicit, loc };
}

export function lambda(params: Binder[], body: Expr, loc?: SourceLocation): LambdaExpr {
  return { kind: 'lambda', params, body, loc };
}

export function pi(params: Binder[], body: Expr, loc?: SourceLocation): PiExpr {
  return { kind: 'pi', params, body, loc };
}

export function let_(name: string, value: Expr, body: Expr | undefined, type?: Expr, recursive: boolean = false, loc?: SourceLocation): LetExpr {
  return { kind: 'let', name, type, value, body, recursive, loc };
}

export function if_(cond: Expr, thenBranch: Expr, elseBranch: Expr | undefined, loc?: SourceLocation): IfExpr {
  return { kind: 'if', cond, thenBranch, elseBranch, loc };
}

export function match_(scrutinee: Expr, cases: MatchCase[], loc?: SourceLocation): MatchExpr {
  return { kind: 'match', scrutinee, cases, loc };
}

export function binder(name: string, type?: Expr, implicit: boolean = false, instImplicit: boolean = false): Binder {
  return { name, type, implicit, instImplicit, strictImplicit: false };
}

export function binOp(op: BinaryOp, left: Expr, right: Expr, loc?: SourceLocation): BinOpExpr {
  return { kind: 'binOp', op, left, right, loc };
}

export function unaryOp(op: UnaryOp, operand: Expr, loc?: SourceLocation): UnaryOpExpr {
  return { kind: 'unaryOp', op, operand, loc };
}

export function hole(name?: string, loc?: SourceLocation): HoleExpr {
  return { kind: 'hole', name, loc };
}

export function type_(level?: number, loc?: SourceLocation): TypeExpr {
  return { kind: 'type', level, loc };
}

export function prop(loc?: SourceLocation): PropExpr {
  return { kind: 'prop', loc };
}

export function arrayLit(elements: Expr[], loc?: SourceLocation): ArrayLitExpr {
  return { kind: 'arrayLit', elements, loc };
}

export function def(name: string, params: Binder[], type: Expr | undefined, value: Expr, recursive: boolean = false, loc?: SourceLocation): DefDecl {
  return { kind: 'def', name, params, type, value, recursive, private: false, protected: false, loc };
}

export function inductive(name: string, params: Binder[], type: Expr | undefined, ctors: Constructor[], loc?: SourceLocation): InductiveDecl {
  return { kind: 'inductive', name, params, type, ctors, loc };
}

export function ctor(name: string, params: Binder[], type?: Expr, docstring?: string): Constructor {
  return { name, params, type, docstring };
}

export function field(name: string, type: Expr, default_?: Expr, docstring?: string): Field {
  return { name, type, default: default_, docstring };
}

export function varPattern(name: string, loc?: SourceLocation): VarPattern {
  return { kind: 'var', name, loc };
}

export function ctorPattern(name: string, args: Pattern[], loc?: SourceLocation): CtorPattern {
  return { kind: 'ctor', name, args, loc };
}

export function wildcardPattern(loc?: SourceLocation): WildcardPattern {
  return { kind: 'wildcard', loc };
}

export function litPattern(value: string | number | boolean, type: LitPattern['type'], loc?: SourceLocation): LitPattern {
  return { kind: 'lit', value, type, loc };
}

export function module_(decls: Decl[], header?: string): Module {
  return { kind: 'module', decls, header };
}
