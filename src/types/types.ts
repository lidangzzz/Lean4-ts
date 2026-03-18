// Lean4 Type System

import * as AST from '../parser/ast';

// Type representation
export type Type =
  | TypeVar
  | TypeConst
  | TypeApp
  | PiType
  | SigmaType
  | UnivType
  | SortType
  | PropType
  | MetaVar;

export interface TypeVar {
  kind: 'typeVar';
  name: string;
  level?: number;
}

export interface TypeConst {
  kind: 'typeConst';
  name: string;
}

export interface TypeApp {
  kind: 'typeApp';
  fn: Type;
  arg: Type;
}

export interface PiType {
  kind: 'piType';
  name: string;
  domain: Type;
  codomain: Type;
  implicit: boolean;
}

export interface SigmaType {
  kind: 'sigmaType';
  name: string;
  fst: Type;
  snd: Type;
}

export interface UnivType {
  kind: 'univType';
  level: number;
}

export interface SortType {
  kind: 'sortType';
  level: number;
}

export interface PropType {
  kind: 'propType';
}

export interface MetaVar {
  kind: 'metaVar';
  id: number;
  name?: string;
  value?: Type;
}

// Values (runtime representation)
export type Value =
  | VLit
  | VClosure
  | VNeutral
  | VConstr
  | VLam
  | VPi
  | VSort
  | VArray
  | VStruct;

export interface VStruct {
  kind: 'VStruct';
  fields: { name: string; value: Value }[];
}

export interface VLit {
  kind: 'VLit';
  type: 'nat' | 'int' | 'float' | 'string' | 'char' | 'bool';
  value: string | number | boolean;
}

export interface VClosure {
  kind: 'VClosure';
  env: Env;
  param: string;
  body: AST.Expr;
}

export interface VNeutral {
  kind: 'VNeutral';
  neutral: Neutral;
}

export interface VConstr {
  kind: 'VConstr';
  name: string;
  args: Value[];
}

export interface VLam {
  kind: 'VLam';
  fn: (arg: Value) => Value;
}

export interface VPi {
  kind: 'VPi';
  domain: Value;
  codomain: (arg: Value) => Value;
}

export interface VSort {
  kind: 'VSort';
  level: number;
}

export interface VArray {
  kind: 'VArray';
  elements: Value[];
}

// Neutral terms (cannot reduce further)
export type Neutral =
  | NVar
  | NApp
  | NProj
  | NMeta;

export interface NVar {
  kind: 'NVar';
  name: string;
  type?: Type;
}

export interface NApp {
  kind: 'NApp';
  fn: Neutral;
  arg: Value;
}

export interface NProj {
  kind: 'NProj';
  expr: Neutral;
  field: string | number;
}

export interface NMeta {
  kind: 'NMeta';
  id: number;
}

// Environment
export type Env = Map<string, Value>;

// Context for type checking
export interface Context {
  env: Env;
  types: Map<string, Type>;
  level: number;
}

export function emptyContext(): Context {
  return {
    env: new Map(),
    types: new Map(),
    level: 0
  };
}

export function extendContext(ctx: Context, name: string, type: Type, value?: Value): Context {
  return {
    env: new Map(ctx.env).set(name, value || { kind: 'VNeutral', neutral: { kind: 'NVar', name } }),
    types: new Map(ctx.types).set(name, type),
    level: ctx.level
  };
}

// Type helpers
export function typeVar(name: string): TypeVar {
  return { kind: 'typeVar', name };
}

export function typeConst(name: string): TypeConst {
  return { kind: 'typeConst', name };
}

export function typeApp(fn: Type, arg: Type): TypeApp {
  return { kind: 'typeApp', fn, arg };
}

export function piType(name: string, domain: Type, codomain: Type, implicit: boolean = false): PiType {
  return { kind: 'piType', name, domain, codomain, implicit };
}

export function univType(level: number = 0): UnivType {
  return { kind: 'univType', level };
}

export function sortType(level: number): SortType {
  return { kind: 'sortType', level };
}

export function propType(): PropType {
  return { kind: 'propType' };
}

export function metaVar(id: number, name?: string): MetaVar {
  return { kind: 'metaVar', id, name };
}

// Value helpers
export function vNat(n: number | string): VLit {
  return { kind: 'VLit', type: 'nat', value: typeof n === 'number' ? n.toString() : n };
}

export function vInt(n: number | string): VLit {
  return { kind: 'VLit', type: 'int', value: typeof n === 'number' ? n.toString() : n };
}

export function vFloat(n: number): VLit {
  return { kind: 'VLit', type: 'float', value: n };
}

export function vString(s: string): VLit {
  return { kind: 'VLit', type: 'string', value: s };
}

export function vChar(c: string): VLit {
  return { kind: 'VLit', type: 'char', value: c };
}

export function vBool(b: boolean): VLit {
  return { kind: 'VLit', type: 'bool', value: b };
}

export function vClosure(env: Env, param: string, body: AST.Expr): VClosure {
  return { kind: 'VClosure', env, param, body };
}

export function vNeutral(neutral: Neutral): VNeutral {
  return { kind: 'VNeutral', neutral };
}

export function vConstr(name: string, args: Value[]): VConstr {
  return { kind: 'VConstr', name, args };
}

export function vLam(fn: (arg: Value) => Value): VLam {
  return { kind: 'VLam', fn };
}

export function vArray(elements: Value[]): VArray {
  return { kind: 'VArray', elements };
}

export function vStruct(fields: { name: string; value: Value }[]): VStruct {
  return { kind: 'VStruct', fields };
}

export function vSort(level: number): VSort {
  return { kind: 'VSort', level };
}

// Neutral helpers
export function nVar(name: string): NVar {
  return { kind: 'NVar', name };
}

export function nApp(fn: Neutral, arg: Value): NApp {
  return { kind: 'NApp', fn, arg };
}

export function nProj(expr: Neutral, field: string | number): NProj {
  return { kind: 'NProj', expr, field };
}

// Built-in types
export const NAT_TYPE = typeConst('Nat');
export const INT_TYPE = typeConst('Int');
export const FLOAT_TYPE = typeConst('Float');
export const STRING_TYPE = typeConst('String');
export const CHAR_TYPE = typeConst('Char');
export const BOOL_TYPE = typeConst('Bool');
export const UNIT_TYPE = typeConst('Unit');
export const EMPTY_TYPE = typeConst('Empty');
export const LIST_TYPE = (elem: Type) => typeApp(typeConst('List'), elem);
export const ARRAY_TYPE = (elem: Type) => typeApp(typeConst('Array'), elem);
export const OPTION_TYPE = (elem: Type) => typeApp(typeConst('Option'), elem);

// Type formatting
export function formatType(type: Type): string {
  switch (type.kind) {
    case 'typeVar':
      return type.name;
    case 'typeConst':
      return type.name;
    case 'typeApp':
      const fn = formatType(type.fn);
      const arg = formatType(type.arg);
      return `${fn} ${arg}`;
    case 'piType':
      const dom = formatType(type.domain);
      const cod = formatType(type.codomain);
      return type.implicit ? `({${type.name} : ${dom}} → ${cod})` : `(${type.name} : ${dom} → ${cod})`;
    case 'sigmaType':
      return `Σ ${type.name} : ${formatType(type.fst)}, ${formatType(type.snd)}`;
    case 'univType':
      return type.level === 0 ? 'Type' : `Type ${type.level}`;
    case 'sortType':
      return `Sort ${type.level}`;
    case 'propType':
      return 'Prop';
    case 'metaVar':
      return type.name || `?${type.id}`;
  }
}

// Value formatting
export function formatValue(value: Value): string {
  switch (value.kind) {
    case 'VLit':
      if (value.type === 'string') return `"${value.value}"`;
      if (value.type === 'char') return `'${value.value}'`;
      return String(value.value);
    case 'VClosure':
      return `<closure>`;
    case 'VNeutral':
      return formatNeutral(value.neutral);
    case 'VConstr':
      // Handle Pair.mk as tuple
      if (value.name === 'Pair.mk' && value.args.length === 2) {
        return `(${formatValue(value.args[0])}, ${formatValue(value.args[1])})`;
      }
      const args = value.args.map(formatValue).join(' ');
      return args ? `${value.name} ${args}` : value.name;
    case 'VStruct':
      const fields = value.fields.map(f => `${f.name} := ${formatValue(f.value)}`).join(', ');
      return `{ ${fields} }`;
    case 'VLam':
      return `<lambda>`;
    case 'VPi':
      return `<pi>`;
    case 'VSort':
      return value.level === 0 ? 'Type' : `Type ${value.level}`;
    case 'VArray':
      return `[${value.elements.map(formatValue).join(', ')}]`;
  }
}

export function formatNeutral(neutral: Neutral): string {
  switch (neutral.kind) {
    case 'NVar':
      return neutral.name;
    case 'NApp':
      // Check for Pair.mk a b pattern
      if (neutral.fn.kind === 'NApp' &&
          neutral.fn.fn.kind === 'NVar' &&
          neutral.fn.fn.name === 'Pair.mk') {
        // This is Pair.mk a b - format as (a, b)
        return `(${formatValue(neutral.fn.arg)}, ${formatValue(neutral.arg)})`;
      }
      return `${formatNeutral(neutral.fn)} ${formatValue(neutral.arg)}`;
    case 'NProj':
      return `${formatNeutral(neutral.expr)}.${neutral.field}`;
    case 'NMeta':
      return `?${neutral.id}`;
  }
}
