// Lean4 Evaluator/Interpreter

import * as AST from '../parser/ast';
import {
  Value, VLit, VNeutral, VConstr, VLam, VPi, VSort, VArray, VClosure, VStruct,
  Env, Neutral, NVar, NApp, NProj,
  vNat, vInt, vFloat, vString, vChar, vBool,
  vClosure, vNeutral, vConstr, vLam, vArray, vSort, vStruct,
  nVar, nApp, nProj,
  formatValue, formatValueRaw
} from '../types';

export class EvalError extends Error {
  constructor(message: string) {
    super(`Evaluation error: ${message}`);
    this.name = 'EvalError';
  }
}

export function evaluate(expr: AST.Expr, env: Env): Value {
  switch (expr.kind) {
    case 'literal':
      return evalLiteral(expr);

    case 'ident':
      return evalIdent(expr.name, env);

    case 'hole':
      return vNeutral(nVar(expr.name || '_'));

    case 'app':
      return evalApp(expr, env);

    case 'lambda':
    case 'fun':
      return evalLambda(expr, env);

    case 'pi':
    case 'forall':
      return evalPi(expr, env);

    case 'let':
      return evalLet(expr, env);

    case 'if':
      return evalIf(expr, env);

    case 'match':
      return evalMatch(expr, env);

    case 'do':
      return evalDo(expr, env);

    case 'have':
    case 'show':
      return evaluate(expr.proof, env);

    case 'type':
      return vSort(expr.level || 0);

    case 'sort':
      return vSort(expr.level);

    case 'prop':
      return vSort(0);

    case 'fieldAccess':
      return evalFieldAccess(expr, env);

    case 'proj':
      return evalProj(expr, env);

    case 'arrayLit':
      return evalArrayLit(expr, env);

    case 'binOp':
      return evalBinOp(expr, env);

    case 'unaryOp':
      return evalUnaryOp(expr, env);

    case 'paren':
      return evaluate(expr.expr, env);

    case 'tuple':
      return evalTuple(expr, env);

    case 'structLit':
      return evalStructLit(expr, env);

    case 'interpolatedString':
      return evalInterpolatedString(expr as AST.InterpolatedStringExpr, env);

    case 'quote':
    case 'antiquot':
    case 'macro':
      throw new EvalError(`Not implemented: ${expr.kind}`);

    case 'exists':
      // Exists is a dependent pair type
      return vNeutral(nVar('Exists'));

    default:
      throw new EvalError(`Unknown expression kind: ${(expr as any).kind}`);
  }
}

function evalLiteral(expr: AST.LiteralExpr): VLit {
  switch (expr.type) {
    case 'nat':
      return vNat(expr.value as string);
    case 'int':
      return vInt(expr.value as string);
    case 'float':
      return vFloat(expr.value as number);
    case 'string':
      return vString(expr.value as string);
    case 'char':
      return vChar(expr.value as string);
    case 'bool':
      return vBool(expr.value as boolean);
  }
}

function evalIdent(name: string, env: Env): Value {
  const value = env.get(name);
  if (value !== undefined) {
    return value;
  }

  // Check built-ins
  const builtin = evalBuiltin(name, env);
  if (builtin !== undefined) {
    return builtin;
  }

  // Return as neutral variable
  return vNeutral(nVar(name));
}

function evalBuiltin(name: string, env: Env): Value | undefined {
  // Built-in constants
  switch (name) {
    case 'Nat':
    case 'Int':
    case 'Float':
    case 'String':
    case 'Char':
    case 'Bool':
    case 'Unit':
    case 'Empty':
    case 'Prop':
      return vSort(0);
    case 'Type':
      return vSort(1);
    case 'true':
      return vBool(true);
    case 'false':
      return vBool(false);
    case 'none':
      return vConstr('none', []);
    case 'some':
      return vLam((x) => vConstr('some', [x]));
    case 's!':
      // String interpolation macro: s!"Hello {name}" => "Hello value"
      return vLam((template) => {
        if (template.kind === 'VLit' && template.type === 'string') {
          const templateStr = String(template.value);
          // Replace {expr} placeholders with their evaluated values from env
          const result = templateStr.replace(/\{([^}]+)\}/g, (match, expr) => {
            try {
              // Try to evaluate the expression in the current environment
              const value = env.get(expr.trim());
              if (value) {
                return formatValue(value);
              }
              // If not found in env, return the match as-is
              return match;
            } catch (e) {
              return match;
            }
          });
          return vString(result);
        }
        return vNeutral(nApp(nVar('s!'), template));
      });
    case 'Char.toNat':
      // Char.toNat : Char → Nat
      return vLam((c: Value) => {
        if (c.kind === 'VLit' && c.type === 'char') {
          return vNat(String(c.value).charCodeAt(0));
        }
        return vNeutral(nApp(nVar('Char.toNat'), c));
      });
    case 'Char.ofNat':
      // Char.ofNat : Nat → Char
      return vLam((n: Value) => {
        if (n.kind === 'VLit' && (n.type === 'nat' || n.type === 'int')) {
          const code = Number(n.value);
          return vChar(String.fromCharCode(code));
        }
        return vNeutral(nApp(nVar('Char.ofNat'), n));
      });
    case 'nil':
      return vConstr('nil', []);
    case 'cons':
      return vLam((h) => vLam((t) => vConstr('cons', [h, t])));
    case 'Pair.mk':
      // Pair constructor: takes two arguments and creates a pair
      return vLam((fst) => vLam((snd) => vConstr('Pair.mk', [fst, snd])));
    case 'foldl':
      // foldl : (β → α → β) → β → List α → β
      return vLam((f) => vLam((init) => vLam((xs) => {
        // If xs is an array, fold over it
        if (xs.kind === 'VArray') {
          let acc = init;
          for (const elem of xs.elements) {
            acc = applyValue(applyValue(f, acc), elem);
          }
          return acc;
        }
        // If xs is a constructor (nil/cons), handle it
        if (xs.kind === 'VConstr') {
          if (xs.name === 'nil') {
            return init;
          }
          if (xs.name === 'cons' && xs.args.length === 2) {
            const [head, tail] = xs.args;
            const newAcc = applyValue(applyValue(f, init), head);
            return applyValue(applyValue(applyValue(evalIdent('foldl', env), f), newAcc), tail);
          }
        }
        return vNeutral(nApp(nApp(nApp(nVar('foldl'), f), init), xs));
      })));
    case 'max':
      // max : Nat → Nat → Nat
      return vLam((a) => vLam((b) => {
        if (a.kind === 'VLit' && b.kind === 'VLit') {
          return vNat(Math.max(Number(a.value), Number(b.value)));
        }
        return vNeutral(nApp(nApp(nVar('max'), a), b));
      }));
    case 'min':
      // min : Nat → Nat → Nat
      return vLam((a) => vLam((b) => {
        if (a.kind === 'VLit' && b.kind === 'VLit') {
          return vNat(Math.min(Number(a.value), Number(b.value)));
        }
        return vNeutral(nApp(nApp(nVar('min'), a), b));
      }));
    case 'Array.replicate':
    case 'Lean.Array.replicate':
      // Array.replicate : Nat → α → Array α
      return vLam((n: Value): Value => vLam((val: Value): Value => {
        if (n.kind === 'VLit' && n.type === 'nat') {
          const count = Number(n.value);
          const elements: Value[] = [];
          for (let i = 0; i < count; i++) {
            elements.push(val);
          }
          return vArray(elements);
        }
        return vNeutral(nApp(nApp(nVar('Array.replicate'), n), val));
      }));
    case 'Array.mk':
    case 'Lean.Array.mk':
      // Array.mk : List α → Array α
      return vLam((list: Value): Value => {
        if (list.kind === 'VArray') {
          return list;
        }
        if (list.kind === 'VConstr' && list.name === 'List.nil') {
          return vArray([]);
        }
        // Convert List to Array
        const elements: Value[] = [];
        let current: Value = list;
        while (current.kind === 'VConstr' && current.name === 'List.cons') {
          elements.push(current.args[0]);
          current = current.args[1];
        }
        return vArray(elements);
      });
    case 'Array.toList':
    case 'Lean.Array.toList':
      // Array.toList : Array α → List α
      return vLam((arr: Value): Value => {
        if (arr.kind === 'VArray') {
          let list = vConstr('List.nil', []);
          for (let i = arr.elements.length - 1; i >= 0; i--) {
            list = vConstr('List.cons', [arr.elements[i], list]);
          }
          return list;
        }
        return vNeutral(nApp(nVar('Array.toList'), arr));
      });
    case 'Array.ofList':
    case 'Lean.Array.ofList':
      // Array.ofList : List α → Array α
      return vLam((list: Value): Value => {
        if (list.kind === 'VConstr' && list.name === 'List.nil') {
          return vArray([]);
        }
        const elements: Value[] = [];
        let current: Value = list;
        while (current.kind === 'VConstr' && (current.name === 'List.cons' || current.name === 'cons')) {
          elements.push(current.args[0]);
          current = current.args[1];
        }
        return vArray(elements);
      });
    case 'List.toArray':
    case 'Lean.List.toArray':
      // List.toArray : List α → Array α
      return vLam((list: Value): Value => {
        if (list.kind === 'VConstr' && list.name === 'List.nil') {
          return vArray([]);
        }
        const elements: Value[] = [];
        let current: Value = list;
        while (current.kind === 'VConstr' && current.name === 'List.cons') {
          elements.push(current.args[0]);
          current = current.args[1];
        }
        return vArray(elements);
      });
    case 'String.ofList':
    case 'Lean.String.ofList':
      // String.ofList : List Char → String
      return vLam((list: Value) => {
        if (list.kind === 'VArray') {
          const chars = list.elements.map(e => {
            if (e.kind === 'VLit' && e.type === 'char') {
              return String(e.value);
            }
            return '';
          }).join('');
          return vString(chars);
        }
        // Handle constructor-based list
        if (list.kind === 'VConstr') {
          const chars: string[] = [];
          let current: Value = list;
          while (current.kind === 'VConstr' && (current.name === 'List.cons' || current.name === 'cons')) {
            if (current.args[0].kind === 'VLit' && current.args[0].type === 'char') {
              chars.push(String(current.args[0].value));
            }
            current = current.args[1];
          }
          return vString(chars.join(''));
        }
        return vNeutral(nApp(nVar('String.ofList'), list));
      });
    case 'List.range':
    case 'Lean.List.range':
      // List.range : Nat → List Nat
      return vLam((n: Value) => {
        if (n.kind === 'VLit' && n.type === 'nat') {
          const count = Number(n.value);
          const elements: Value[] = [];
          for (let i = 0; i < count; i++) {
            elements.push(vNat(i));
          }
          return vArray(elements);
        }
        return vNeutral(nApp(nVar('List.range'), n));
      });
    case 'List.replicate':
    case 'Lean.List.replicate':
      // List.replicate : Nat → α → List α
      return vLam((n: Value) => vLam((val: Value) => {
        if (n.kind === 'VLit' && n.type === 'nat') {
          const count = Number(n.value);
          const elements: Value[] = [];
          for (let i = 0; i < count; i++) {
            elements.push(val);
          }
          return vArray(elements);
        }
        return vNeutral(nApp(nApp(nVar('List.replicate'), n), val));
      }));
    default:
      // Not a built-in
      return undefined;
  }
}

function evalApp(expr: AST.AppExpr, env: Env): Value {
  const fn = evaluate(expr.fn, env);
  const arg = evaluate(expr.arg, env);
  return applyValue(fn, arg);
}

export function applyValue(fn: Value, arg: Value): Value {
  switch (fn.kind) {
    case 'VLam':
      return fn.fn(arg);

    case 'VClosure':
      const newEnv = new Map(fn.env);
      newEnv.set(fn.param, arg);
      return evaluate(fn.body, newEnv);

    case 'VNeutral':
      return vNeutral(nApp(fn.neutral, arg));

    case 'VConstr':
      // Partial application of constructor
      return vConstr(fn.name, [...fn.args, arg]);

    default:
      throw new EvalError(`Cannot apply non-function value: ${formatValue(fn)}`);
  }
}

function evalLambda(expr: AST.LambdaExpr | AST.FunExpr, env: Env): Value {
  if (expr.params.length === 0) {
    throw new EvalError('Lambda with no parameters');
  }

  const params = expr.params;
  const body = expr.body;

  // Create nested lambdas
  let result: Value = vClosure(env, params[params.length - 1].name, body);

  for (let i = params.length - 2; i >= 0; i--) {
    const param = params[i];
    const currentResult = result;
    result = vClosure(env, param.name, {
      kind: 'app',
      fn: { kind: 'ident', name: param.name },
      arg: body,
      explicit: true
    } as AST.AppExpr);
  }

  // Use VLam for better performance
  if (params.length === 1) {
    return vLam((arg) => {
      const newEnv = new Map(env);
      newEnv.set(params[0].name, arg);
      return evaluate(body, newEnv);
    });
  }

  // Multi-param lambda
  return buildMultiParamLambda(env, params, body);
}

function buildMultiParamLambda(env: Env, params: AST.Binder[], body: AST.Expr): VLam {
  if (params.length === 0) {
    throw new EvalError('Empty params in lambda');
  }

  if (params.length === 1) {
    return vLam((arg) => {
      const newEnv = new Map(env);
      newEnv.set(params[0].name, arg);
      return evaluate(body, newEnv);
    });
  }

  return vLam((arg) => {
    const newEnv = new Map(env);
    newEnv.set(params[0].name, arg);
    return buildMultiParamLambda(newEnv, params.slice(1), body);
  });
}

function evalPi(expr: AST.PiExpr | AST.ForallExpr, env: Env): Value {
  // For now, return a sort
  return vSort(0);
}

function evalLet(expr: AST.LetExpr, env: Env): Value {
  // Handle destructuring let with pattern
  if (expr.pattern) {
    const value = evaluate(expr.value, env);

    // Match the pattern against the value
    const bindings = matchPattern(expr.pattern, value, env);
    if (!bindings) {
      throw new EvalError(`Pattern match failure in let expression`);
    }

    if (expr.body) {
      return evaluate(expr.body, bindings);
    }
    return value;
  }

  if (expr.recursive) {
    // For recursive let, add a placeholder first, then evaluate
    const newEnv = new Map(env);
    // Create a placeholder that will be updated
    newEnv.set(expr.name, vNeutral(nVar(expr.name)));
    const value = evaluate(expr.value, newEnv);
    // Update the environment with the actual value
    newEnv.set(expr.name, value);

    if (expr.body) {
      return evaluate(expr.body, newEnv);
    }
    return value;
  } else {
    const value = evaluate(expr.value, env);

    if (expr.body) {
      const newEnv = new Map(env);
      newEnv.set(expr.name, value);
      return evaluate(expr.body, newEnv);
    }

    return value;
  }
}

function evalIf(expr: AST.IfExpr, env: Env): Value {
  const cond = evaluate(expr.cond, env);

  if (isTrue(cond)) {
    return evaluate(expr.thenBranch, env);
  } else if (expr.elseBranch) {
    return evaluate(expr.elseBranch, env);
  }

  throw new EvalError('If expression without else branch evaluated to false');
}

function valuesEqual(a: Value, b: Value): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'VLit':
      return a.type === (b as any).type && a.value === (b as any).value;
    case 'VConstr':
      if (a.name !== (b as any).name) return false;
      if (a.args.length !== (b as any).args.length) return false;
      return a.args.every((arg, i) => valuesEqual(arg, (b as any).args[i]));
    case 'VArray':
      if (a.elements.length !== (b as any).elements.length) return false;
      return a.elements.every((elem, i) => valuesEqual(elem, (b as any).elements[i]));
    case 'VNeutral':
      return a.neutral === (b as any).neutral;
    case 'VSort':
      return a.level === (b as any).level;
    case 'VLam':
    case 'VPi':
    case 'VClosure':
      return false; // Functions are not comparable
    default:
      return false;
  }
}

function isTrue(value: Value): boolean {
  if (value.kind === 'VLit' && value.type === 'bool') {
    return value.value === true;
  }
  if (value.kind === 'VConstr' && value.name === 'true') {
    return true;
  }
  return false;
}

function isFalse(value: Value): boolean {
  if (value.kind === 'VLit' && value.type === 'bool') {
    return value.value === false;
  }
  if (value.kind === 'VConstr' && value.name === 'false') {
    return true;
  }
  return false;
}

function evalMatch(expr: AST.MatchExpr, env: Env): Value {
  const scrutinee = evaluate(expr.scrutinee, env);

  for (const case_ of expr.cases) {
    const result = matchPattern(case_.pattern, scrutinee, env);
    if (result !== null) {
      return evaluate(case_.body, result);
    }
  }

  throw new EvalError(`No matching pattern for: ${formatValue(scrutinee)}`);
}

function matchPattern(pattern: AST.Pattern, value: Value, env: Env): Env | null {
  switch (pattern.kind) {
    case 'wildcard':
      return env;

    case 'var':
      const newEnv = new Map(env);
      newEnv.set(pattern.name, value);
      return newEnv;

    case 'lit':
      if (value.kind === 'VLit') {
        if (String(value.value) === String(pattern.value)) {
          return env;
        }
      }
      return null;

    case 'ctor':
      // Handle nil pattern matching against empty array
      if ((pattern.name === 'nil' || pattern.name === 'List.nil') && pattern.args.length === 0) {
        if (value.kind === 'VArray' && value.elements.length === 0) {
          return env;
        }
        if (value.kind === 'VConstr' && (value.name === 'nil' || value.name === 'List.nil') && value.args.length === 0) {
          return env;
        }
        return null;
      }

      // Handle cons pattern matching against array
      if ((pattern.name === 'cons' || pattern.name === 'List.cons') && pattern.args.length === 2) {
        if (value.kind === 'VArray' && value.elements.length > 0) {
          // Match head and tail
          const headResult = matchPattern(pattern.args[0], value.elements[0], env);
          if (headResult === null) return null;
          // Tail is the rest of the array
          const tailValue = vArray(value.elements.slice(1));
          return matchPattern(pattern.args[1], tailValue, headResult);
        }
        if (value.kind === 'VConstr' && (value.name === 'cons' || value.name === 'List.cons') && value.args.length === 2) {
          // Match against cons constructor
          let currentEnv = env;
          for (let i = 0; i < pattern.args.length; i++) {
            const result = matchPattern(pattern.args[i], value.args[i], currentEnv);
            if (result === null) return null;
            currentEnv = result;
          }
          return currentEnv;
        }
        return null;
      }

      // General constructor matching - handle qualified names (e.g., UTerm.var matches UTerm.var or var)
      if (value.kind === 'VConstr') {
        const patternMatches =
          value.name === pattern.name ||
          value.name.endsWith('.' + pattern.name) ||
          pattern.name.endsWith('.' + value.name) ||
          (pattern.name.includes('.') && value.name === pattern.name.split('.').pop()) ||
          (value.name.includes('.') && pattern.name === value.name.split('.').pop());

        if (patternMatches && value.args.length === pattern.args.length) {
          let currentEnv = env;
          for (let i = 0; i < pattern.args.length; i++) {
            const result = matchPattern(pattern.args[i], value.args[i], currentEnv);
            if (result === null) return null;
            currentEnv = result;
          }
          return currentEnv;
        }
      }
      return null;

    case 'tuple':
      // Handle tuple pattern matching against nested pair structure
      if (pattern.elements.length === 2) {
        // Simple pair - match directly against Pair.mk or array
        if (value.kind === 'VConstr' && (value.name === 'Pair.mk' || value.name === 'Prod.mk') && value.args.length === 2) {
          let currentEnv = env;
          for (let i = 0; i < pattern.elements.length; i++) {
            const result = matchPattern(pattern.elements[i], value.args[i], currentEnv);
            if (result === null) return null;
            currentEnv = result;
          }
          return currentEnv;
        }
        if (value.kind === 'VArray' && value.elements.length === 2) {
          let currentEnv = env;
          for (let i = 0; i < pattern.elements.length; i++) {
            const result = matchPattern(pattern.elements[i], value.elements[i], currentEnv);
            if (result === null) return null;
            currentEnv = result;
          }
          return currentEnv;
        }
      }
      // Handle n-tuple patterns (n > 2) against nested pairs
      // (a, b, c) pattern should match Pair.mk(a, Pair.mk(b, c)) value
      if (pattern.elements.length > 2 && value.kind === 'VConstr' && (value.name === 'Pair.mk' || value.name === 'Prod.mk')) {
        // Match first element against first pattern
        const firstResult = matchPattern(pattern.elements[0], value.args[0], env);
        if (firstResult === null) return null;
        // Recursively match rest of patterns against rest of nested pairs
        const restPattern: AST.TuplePattern = {
          kind: 'tuple',
          elements: pattern.elements.slice(1),
          loc: pattern.loc
        };
        return matchPattern(restPattern, value.args[1], firstResult);
      }
      // Handle flat array matching
      if (value.kind === 'VArray' && value.elements.length === pattern.elements.length) {
        let currentEnv = env;
        for (let i = 0; i < pattern.elements.length; i++) {
          const result = matchPattern(pattern.elements[i], value.elements[i], currentEnv);
          if (result === null) return null;
          currentEnv = result;
        }
        return currentEnv;
      }
      return null;

    case 'array':
      if (value.kind === 'VArray' && value.elements.length === pattern.elements.length) {
        let currentEnv = env;
        for (let i = 0; i < pattern.elements.length; i++) {
          const result = matchPattern(pattern.elements[i], value.elements[i], currentEnv);
          if (result === null) return null;
          currentEnv = result;
        }
        return currentEnv;
      }
      return null;

    case 'as':
      const asEnv = new Map(env);
      asEnv.set(pattern.name, value);
      return matchPattern(pattern.pattern, value, asEnv);

    case 'nplusk':
      // n + k pattern: matches natural numbers >= k, binds n to (value - k)
      if (value.kind === 'VLit' && (value.type === 'nat' || value.type === 'int')) {
        const num = Number(value.value);
        if (num >= pattern.k) {
          const nEnv = new Map(env);
          nEnv.set(pattern.name, vNat((num - pattern.k).toString()));
          return nEnv;
        }
      }
      return null;

    default:
      return null;
  }
}

function evalDo(expr: AST.DoExpr, env: Env): Value {
  let currentEnv = env;
  let result: Value = vConstr('unit', []);

  for (const stmt of expr.statements) {
    switch (stmt.kind) {
      case 'let':
        const letValue = evaluate(stmt.value, currentEnv);
        currentEnv = new Map(currentEnv);
        currentEnv.set(stmt.name, letValue);
        result = letValue;
        break;

      case 'bind':
        const bindValue = evaluate(stmt.expr, currentEnv);
        // For now, just bind the value
        currentEnv = new Map(currentEnv);
        currentEnv.set(stmt.name, bindValue);
        result = bindValue;
        break;

      case 'doExpr':
        result = evaluate((stmt as AST.DoExprStatement).expr, currentEnv);
        break;

      case 'return':
        return evaluate(stmt.expr, currentEnv);
    }
  }

  return result;
}

function evalFieldAccess(expr: AST.FieldAccessExpr, env: Env): Value {
  // First check if this is a qualified name lookup (e.g., Token.num)
  // If the object is an identifier that's not in env as a value, but object.field is in env
  if (expr.object.kind === 'ident') {
    const qualifiedName = `${expr.object.name}.${expr.field}`;
    const qualifiedValue = env.get(qualifiedName);
    if (qualifiedValue !== undefined) {
      return qualifiedValue;
    }
    // Also check built-in functions (like Array.replicate, List.map, etc.)
    const builtin = evalBuiltin(qualifiedName, env);
    if (builtin !== undefined) {
      return builtin;
    }
  }

  const obj = evaluate(expr.object, env);

  // Handle numeric field access on tuples (p.1, p.2, etc.)
  const fieldNum = parseInt(expr.field, 10);
  if (!isNaN(fieldNum) && fieldNum >= 1) {
    const index = fieldNum - 1; // Convert 1-based to 0-based
    if (obj.kind === 'VConstr') {
      // Handle Pair.mk and other tuple constructors
      if ((obj.name === 'Pair.mk' || obj.name.startsWith('Prod.mk')) && index < obj.args.length) {
        return obj.args[index];
      }
      // Handle anonymous tuples stored as constructor with numeric name
      if (index < obj.args.length) {
        return obj.args[index];
      }
    }
    if (obj.kind === 'VArray' && index < obj.elements.length) {
      return obj.elements[index];
    }
    if (obj.kind === 'VNeutral') {
      return vNeutral(nProj(obj.neutral, index));
    }
  }

  // Handle string field access (like .length)
  if (obj.kind === 'VLit' && obj.type === 'string') {
    const str = String(obj.value);
    if (expr.field === 'length') {
      return vNat(str.length);
    }
    // String.toList : String -> List Char
    if (expr.field === 'toList') {
      const chars = str.split('').map(c => vChar(c));
      return vArray(chars);
    }
    // String.drop : String -> Nat -> String
    if (expr.field === 'drop') {
      return vLam((n: Value) => {
        if (n.kind === 'VLit' && n.type === 'nat') {
          return vString(str.slice(Number(n.value)));
        }
        return vNeutral(nApp(nApp(nVar('String.drop'), obj), n));
      });
    }
    // String.take : String -> Nat -> String
    if (expr.field === 'take') {
      return vLam((n: Value) => {
        if (n.kind === 'VLit' && n.type === 'nat') {
          return vString(str.slice(0, Number(n.value)));
        }
        return vNeutral(nApp(nApp(nVar('String.take'), obj), n));
      });
    }
    // String.contains : String -> Char -> Bool
    if (expr.field === 'contains') {
      return vLam((c: Value) => {
        if (c.kind === 'VLit' && c.type === 'char') {
          return vBool(str.includes(String(c.value)));
        }
        return vNeutral(nApp(nApp(nVar('String.contains'), obj), c));
      });
    }
    // String.front : String -> Char (first character)
    if (expr.field === 'front') {
      if (str.length > 0) {
        return vChar(str[0]);
      }
      return vNeutral(nApp(nVar('String.front'), obj));
    }
    // String.back : String -> Char (last character)
    if (expr.field === 'back') {
      if (str.length > 0) {
        return vChar(str[str.length - 1]);
      }
      return vNeutral(nApp(nVar('String.back'), obj));
    }
    // String.isEmpty : String -> Bool
    if (expr.field === 'isEmpty') {
      return vBool(str.length === 0);
    }
    // String.pos : String -> Nat -> Char (get character at position)
    if (expr.field === 'get' || expr.field === 'get?') {
      return vLam((idx: Value) => {
        if (idx.kind === 'VLit' && (idx.type === 'nat' || idx.type === 'int')) {
          const i = Number(idx.value);
          if (i >= 0 && i < str.length) {
            return vConstr('some', [vChar(str[i])]);
          }
          return vConstr('none', []);
        }
        return vNeutral(nApp(nApp(nVar('String.get'), obj), idx));
      });
    }
    // String.foldl : (α → Char → α) → α → String → α
    if (expr.field === 'foldl') {
      return vLam((f: Value) => vLam((init: Value) => {
        let acc = init;
        for (let i = 0; i < str.length; i++) {
          acc = applyValue(applyValue(f, acc), vChar(str[i]));
        }
        return acc;
      }));
    }
    // String.toString : String → String (identity)
    if (expr.field === 'toString') {
      return obj;
    }
    // String.data : String -> List Char (same as toList)
    if (expr.field === 'data') {
      const chars = str.split('').map(c => vChar(c));
      return vArray(chars);
    }
    // String.get! : String -> Nat -> Char (unsafe get character at position)
    if (expr.field === 'get!') {
      return vLam((idx: Value) => {
        if (idx.kind === 'VLit' && (idx.type === 'nat' || idx.type === 'int')) {
          const i = Number(idx.value);
          if (i >= 0 && i < str.length) {
            return vChar(str[i]);
          }
          throw new EvalError(`String index out of bounds: ${i}`);
        }
        return vNeutral(nApp(nApp(nVar('String.get!'), obj), idx));
      });
    }
    // String.startsWith : String -> Bool
    if (expr.field === 'startsWith') {
      return vLam((prefix: Value) => {
        if (prefix.kind === 'VLit' && prefix.type === 'string') {
          return vBool(str.startsWith(String(prefix.value)));
        }
        return vNeutral(nApp(nApp(nVar('String.startsWith'), obj), prefix));
      });
    }
    // String.intercalate : String -> List String -> String
    // This is a static method, but we can handle it on a string instance
    if (expr.field === 'intercalate') {
      const sep = str;
      return vLam((list: Value) => {
        if (list.kind === 'VArray') {
          const strs = list.elements.map(e => {
            if (e.kind === 'VLit' && e.type === 'string') {
              return String(e.value);
            }
            return formatValue(e);
          });
          return vString(strs.join(sep));
        }
        // Handle constructor-based list
        if (list.kind === 'VConstr') {
          const strs: string[] = [];
          let current: Value = list;
          while (current.kind === 'VConstr' && (current.name === 'List.cons' || current.name === 'cons')) {
            if (current.args[0].kind === 'VLit' && current.args[0].type === 'string') {
              strs.push(String(current.args[0].value));
            } else {
              strs.push(formatValue(current.args[0]));
            }
            current = current.args[1];
          }
          return vString(strs.join(sep));
        }
        return vNeutral(nApp(nApp(nVar('String.intercalate'), obj), list));
      });
    }
  }

  // Handle Char field access
  if (obj.kind === 'VLit' && obj.type === 'char') {
    const char = String(obj.value);
    if (expr.field === 'toNat' || expr.field === 'val') {
      return vNat(char.charCodeAt(0));
    }
    if (expr.field === 'toString') {
      return vString(char);
    }
    if (expr.field === 'isDigit') {
      return vBool(char >= '0' && char <= '9');
    }
    if (expr.field === 'isAlpha') {
      const c = char.toLowerCase();
      return vBool(c >= 'a' && c <= 'z');
    }
    if (expr.field === 'isAlphanum') {
      const c = char.toLowerCase();
      return vBool((c >= 'a' && c <= 'z') || (char >= '0' && char <= '9'));
    }
    if (expr.field === 'isWhitespace') {
      return vBool(char === ' ' || char === '\t' || char === '\n' || char === '\r');
    }
  }

  // Handle Nat/Int method calls (like .land, .xor, .shiftRight, etc.)
  if (obj.kind === 'VLit' && (obj.type === 'nat' || obj.type === 'int')) {
    const num = Number(obj.value);
    switch (expr.field) {
      case 'land':  // Bitwise AND
        return vLam((other: Value): Value => {
          if (other.kind === 'VLit' && (other.type === 'nat' || other.type === 'int')) {
            return vNat((num & Number(other.value)).toString());
          }
          return vNeutral(nApp(nApp(nVar('Nat.land'), obj), other));
        });
      case 'lor':   // Bitwise OR
        return vLam((other: Value): Value => {
          if (other.kind === 'VLit' && (other.type === 'nat' || other.type === 'int')) {
            return vNat((num | Number(other.value)).toString());
          }
          return vNeutral(nApp(nApp(nVar('Nat.lor'), obj), other));
        });
      case 'xor':   // Bitwise XOR
        return vLam((other: Value): Value => {
          if (other.kind === 'VLit' && (other.type === 'nat' || other.type === 'int')) {
            return vNat((num ^ Number(other.value)).toString());
          }
          return vNeutral(nApp(nApp(nVar('Nat.xor'), obj), other));
        });
      case 'shiftLeft':
      case 'shiftl':
        return vLam((n: Value): Value => {
          if (n.kind === 'VLit' && n.type === 'nat') {
            return vNat((num << Number(n.value)).toString());
          }
          return vNeutral(nApp(nApp(nVar('Nat.shiftLeft'), obj), n));
        });
      case 'shiftRight':
      case 'shiftr':
        return vLam((n: Value): Value => {
          if (n.kind === 'VLit' && n.type === 'nat') {
            return vNat((num >> Number(n.value)).toString());
          }
          return vNeutral(nApp(nApp(nVar('Nat.shiftRight'), obj), n));
        });
      case 'toNat':
        // Int.toNat - convert to Nat (takes absolute value or saturates)
        if (obj.type === 'int') {
          return vNat(Math.max(0, num).toString());
        }
        return obj;
    }
  }

  // Also check if obj is a neutral variable and qualified name exists
  if (obj.kind === 'VNeutral' && obj.neutral.kind === 'NVar') {
    const qualifiedName = `${obj.neutral.name}.${expr.field}`;
    const qualifiedValue = env.get(qualifiedName);
    if (qualifiedValue !== undefined) {
      return qualifiedValue;
    }
  }

  // Handle numeric field access for tuples/pairs (like p.1, p.2)
  const fieldAsNumber = parseInt(expr.field);
  if (!isNaN(fieldAsNumber)) {
    // 1-indexed access (Lean4 convention: .1 is first element, .2 is second)
    const index = fieldAsNumber - 1;
    if (obj.kind === 'VConstr') {
      if (index >= 0 && index < obj.args.length) {
        return obj.args[index];
      }
    }
    if (obj.kind === 'VArray') {
      if (index >= 0 && index < obj.elements.length) {
        return obj.elements[index];
      }
    }
    if (obj.kind === 'VStruct') {
      const field = obj.fields.find(f => f.name === expr.field);
      if (field) {
        return field.value;
      }
      // Try numeric index
      if (index >= 0 && index < obj.fields.length) {
        return obj.fields[index].value;
      }
    }
  }

  // Handle Option type methods (some/none)
  if (obj.kind === 'VConstr' && (obj.name === 'some' || obj.name === 'none' || obj.name === 'Option.some' || obj.name === 'Option.none')) {
    if (expr.field === 'map') {
      return vLam((f: Value) => {
        if (obj.name === 'some' || obj.name === 'Option.some') {
          if (obj.args.length === 1) {
            const mapped = applyValue(f, obj.args[0]);
            return vConstr('some', [mapped]);
          }
        }
        // none case - return none
        return vConstr('none', []);
      });
    }
    if (expr.field === 'getD') {
      return vLam((defaultVal: Value) => {
        if ((obj.name === 'some' || obj.name === 'Option.some') && obj.args.length === 1) {
          return obj.args[0];
        }
        return defaultVal;
      });
    }
    if (expr.field === 'bind') {
      return vLam((f: Value) => {
        if ((obj.name === 'some' || obj.name === 'Option.some') && obj.args.length === 1) {
          return applyValue(f, obj.args[0]);
        }
        return vConstr('none', []);
      });
    }
    if (expr.field === 'isSome') {
      return vBool(obj.name === 'some' || obj.name === 'Option.some');
    }
    if (expr.field === 'isNone') {
      return vBool(obj.name === 'none' || obj.name === 'Option.none');
    }
    // .snd on some tuple - extract snd from the wrapped tuple
    if (expr.field === 'snd' && (obj.name === 'some' || obj.name === 'Option.some') && obj.args.length === 1) {
      const inner = obj.args[0];
      if (inner.kind === 'VConstr' && inner.args.length === 2) {
        return inner.args[1];
      }
      if (inner.kind === 'VArray' && inner.elements.length >= 2) {
        return inner.elements[1];
      }
    }
    // .fst on some tuple - extract fst from the wrapped tuple
    if (expr.field === 'fst' && (obj.name === 'some' || obj.name === 'Option.some') && obj.args.length === 1) {
      const inner = obj.args[0];
      if (inner.kind === 'VConstr' && inner.args.length === 2) {
        return inner.args[0];
      }
      if (inner.kind === 'VArray' && inner.elements.length >= 2) {
        return inner.elements[0];
      }
    }
  }

  // Helper function to convert VConstr list to array
  function constrListToArray(list: Value): Value[] | null {
    if (list.kind === 'VConstr') {
      if (list.name === 'nil' || list.name === 'List.nil') {
        return [];
      }
      if ((list.name === 'cons' || list.name === 'List.cons') && list.args.length === 2) {
        const rest = constrListToArray(list.args[1]);
        if (rest !== null) {
          return [list.args[0], ...rest];
        }
      }
    }
    return null;
  }

  // Handle List methods on VConstr lists (List.cons / List.nil)
  if (obj.kind === 'VConstr') {
    const isList = obj.name === 'nil' || obj.name === 'List.nil' ||
                   obj.name === 'cons' || obj.name === 'List.cons';
    if (isList) {
      const elements = constrListToArray(obj);
      if (elements !== null) {
        // Convert to VArray and recursively call evalFieldAccess
        const arr = vArray(elements);
        // Create a new field access expression for the array
        const arrObj = arr;
        // Handle common list methods directly
        if (expr.field === 'length' || expr.field === 'size') {
          return vNat(elements.length);
        }
        if (expr.field === 'isEmpty') {
          return vBool(elements.length === 0);
        }
        if (expr.field === 'head' || expr.field === 'headD') {
          if (elements.length > 0) return elements[0];
          return vConstr('none', []);
        }
        if (expr.field === 'head?') {
          if (elements.length > 0) return vConstr('some', [elements[0]]);
          return vConstr('none', []);
        }
        if (expr.field === 'tail' || expr.field === 'tailD') {
          if (elements.length > 0) return vArray(elements.slice(1));
          return vArray([]);
        }
        if (expr.field === 'reverse') {
          return vArray([...elements].reverse());
        }
        if (expr.field === 'toArray') {
          return arr;
        }
        if (expr.field === 'map') {
          return vLam((f: Value) => {
            const mapped = elements.map(elem => applyValue(f, elem));
            return vArray(mapped);
          });
        }
        if (expr.field === 'filter') {
          return vLam((pred: Value) => {
            const filtered = elements.filter(elem => {
              const result = applyValue(pred, elem);
              return result.kind === 'VLit' && result.value === true;
            });
            return vArray(filtered);
          });
        }
        if (expr.field === 'foldl') {
          return vLam((f: Value) => vLam((init: Value) => {
            let acc = init;
            for (const elem of elements) {
              acc = applyValue(applyValue(f, acc), elem);
            }
            return acc;
          }));
        }
        if (expr.field === 'find?') {
          return vLam((p: Value) => {
            for (const elem of elements) {
              const result = applyValue(p, elem);
              if (result.kind === 'VLit' && result.type === 'bool' && result.value === true) {
                return vConstr('some', [elem]);
              }
            }
            return vConstr('none', []);
          });
        }
        if (expr.field === 'mapIdx') {
          return vLam((f: Value) => {
            const mapped = elements.map((elem, idx) =>
              applyValue(applyValue(f, vNat(idx)), elem)
            );
            return vArray(mapped);
          });
        }
        if (expr.field === 'take') {
          return vLam((n: Value) => {
            if (n.kind === 'VLit') {
              const count = Number(n.value);
              return vArray(elements.slice(0, count));
            }
            return vNeutral(nApp(nApp(nVar('List.take'), obj), n));
          });
        }
        if (expr.field === 'drop') {
          return vLam((n: Value) => {
            if (n.kind === 'VLit') {
              const count = Number(n.value);
              return vArray(elements.slice(count));
            }
            return vNeutral(nApp(nApp(nVar('List.drop'), obj), n));
          });
        }
      }
    }
  }

  if (obj.kind === 'VConstr') {
    // For constructors, treat as record field access
    // This is simplified - real Lean4 has proper structure support
    return vNeutral(nProj({ kind: 'NVar', name: formatValue(obj) }, expr.field));
  }

  if (obj.kind === 'VNeutral') {
    return vNeutral(nProj(obj.neutral, expr.field));
  }

  if (obj.kind === 'VArray') {
    // Array field access (like .size or .length)
    if (expr.field === 'size' || expr.field === 'length') {
      return vNat(obj.elements.length);
    }
    // Method calls on arrays - return partially applied List functions
    if (expr.field === 'zip') {
      // Return a lambda that takes another list and zips with this one
      const leftList = obj;
      return vLam((rightList: Value) => {
        if (rightList.kind === 'VArray') {
          const len = Math.min(leftList.elements.length, rightList.elements.length);
          const pairs: Value[] = [];
          for (let i = 0; i < len; i++) {
            pairs.push(vConstr('Pair.mk', [leftList.elements[i], rightList.elements[i]]));
          }
          return vArray(pairs);
        }
        return vNeutral(nApp(nApp(nVar('List.zip'), leftList), rightList));
      });
    }
    if (expr.field === 'map') {
      const list = obj;
      return vLam((f: Value) => {
        if (list.kind === 'VArray') {
          const mapped = list.elements.map(elem => applyValue(f, elem));
          return vArray(mapped);
        }
        return vNeutral(nApp(nApp(nVar('List.map'), list), f));
      });
    }
    if (expr.field === 'filter') {
      const list = obj;
      return vLam((pred: Value) => {
        if (list.kind === 'VArray') {
          const filtered = list.elements.filter(elem => {
            const result = applyValue(pred, elem);
            return result.kind === 'VLit' && result.value === true;
          });
          return vArray(filtered);
        }
        return vNeutral(nApp(nApp(nVar('List.filter'), list), pred));
      });
    }
    if (expr.field === 'foldl') {
      const list = obj;
      return vLam((f: Value) => vLam((init: Value) => {
        if (list.kind === 'VArray') {
          let acc = init;
          for (const elem of list.elements) {
            acc = applyValue(applyValue(f, acc), elem);
          }
          return acc;
        }
        return vNeutral(nApp(nApp(nApp(nVar('List.foldl'), list), f), init));
      }));
    }
    if (expr.field === 'take') {
      const list = obj;
      return vLam((n: Value) => {
        if (list.kind === 'VArray' && n.kind === 'VLit') {
          const count = Number(n.value);
          return vArray(list.elements.slice(0, count));
        }
        return vNeutral(nApp(nApp(nVar('List.take'), list), n));
      });
    }
    if (expr.field === 'drop') {
      const list = obj;
      return vLam((n: Value) => {
        if (list.kind === 'VArray' && n.kind === 'VLit') {
          const count = Number(n.value);
          return vArray(list.elements.slice(count));
        }
        return vNeutral(nApp(nApp(nVar('List.drop'), list), n));
      });
    }
    if (expr.field === 'head' || expr.field === 'headD') {
      if (obj.elements.length > 0) {
        return obj.elements[0];
      }
      return vConstr('none', []);
    }
    if (expr.field === 'tail' || expr.field === 'tailD') {
      if (obj.elements.length > 0) {
        return vArray(obj.elements.slice(1));
      }
      return vConstr('none', []);
    }
    if (expr.field === 'reverse') {
      return vArray([...obj.elements].reverse());
    }
    if (expr.field === 'isEmpty') {
      return vBool(obj.elements.length === 0);
    }
    if (expr.field === 'any') {
      const list = obj;
      return vLam((p: Value) => {
        if (list.kind === 'VArray') {
          for (const elem of list.elements) {
            const result = applyValue(p, elem);
            if (result.kind === 'VLit' && result.type === 'bool' && result.value === true) {
              return vBool(true);
            }
          }
          return vBool(false);
        }
        return vNeutral(nApp(nApp(nVar('List.any'), list), p));
      });
    }
    if (expr.field === 'all') {
      const list = obj;
      return vLam((p: Value) => {
        if (list.kind === 'VArray') {
          for (const elem of list.elements) {
            const result = applyValue(p, elem);
            if (result.kind === 'VLit' && result.type === 'bool' && result.value !== true) {
              return vBool(false);
            }
          }
          return vBool(true);
        }
        return vNeutral(nApp(nApp(nVar('List.all'), list), p));
      });
    }
    if (expr.field === 'contains') {
      const list = obj;
      return vLam((elem: Value) => {
        if (list.kind === 'VArray') {
          for (const e of list.elements) {
            if (valuesEqual(e, elem)) {
              return vBool(true);
            }
          }
          return vBool(false);
        }
        return vNeutral(nApp(nApp(nVar('List.contains'), list), elem));
      });
    }
    if (expr.field === 'find?') {
      const list = obj;
      return vLam((p: Value) => {
        if (list.kind === 'VArray') {
          for (const elem of list.elements) {
            const result = applyValue(p, elem);
            if (result.kind === 'VLit' && result.type === 'bool' && result.value === true) {
              return vConstr('some', [elem]);
            }
          }
          return vConstr('none', []);
        }
        return vNeutral(nApp(nApp(nVar('List.find?'), list), p));
      });
    }
    if (expr.field === 'getD' || expr.field === 'get?') {
      const list = obj;
      return vLam((idx: Value) => vLam((defaultVal: Value) => {
        if (list.kind === 'VArray' && idx.kind === 'VLit') {
          const i = Number(idx.value);
          if (i >= 0 && i < list.elements.length) {
            return list.elements[i];
          }
          return defaultVal;
        }
        return vNeutral(nApp(nApp(nApp(nVar('List.getD'), list), idx), defaultVal));
      }));
    }
    if (expr.field === 'set') {
      const list = obj;
      return vLam((idx: Value) => vLam((val: Value) => {
        if (list.kind === 'VArray' && idx.kind === 'VLit') {
          const i = Number(idx.value);
          if (i >= 0 && i < list.elements.length) {
            const newArr = [...list.elements];
            newArr[i] = val;
            return vArray(newArr);
          }
        }
        return vNeutral(nApp(nApp(nApp(nVar('Array.set'), list), idx), val));
      }));
    }
    if (expr.field === 'set!') {
      // Same as set for now
      const list = obj;
      return vLam((idx: Value) => vLam((val: Value) => {
        if (list.kind === 'VArray' && idx.kind === 'VLit') {
          const i = Number(idx.value);
          if (i >= 0 && i < list.elements.length) {
            const newArr = [...list.elements];
            newArr[i] = val;
            return vArray(newArr);
          }
        }
        return vNeutral(nApp(nApp(nApp(nVar('Array.set!'), list), idx), val));
      }));
    }
    if (expr.field === 'sum') {
      if (obj.kind === 'VArray') {
        let sum = 0;
        for (const elem of obj.elements) {
          if (elem.kind === 'VLit' && (elem.type === 'nat' || elem.type === 'int')) {
            sum = Number(sum) + Number(elem.value);
          }
        }
        return vNat(sum.toString());
      }
      return vNeutral(nApp(nVar('List.sum'), obj));
    }
    if (expr.field === 'length') {
      if (obj.kind === 'VArray') {
        return vNat(obj.elements.length);
      }
      return vNeutral(nApp(nVar('List.length'), obj));
    }
    if (expr.field === 'eraseDups') {
      const seen = new Set<string>();
      const result: Value[] = [];
      for (const elem of obj.elements) {
        const key = formatValue(elem);
        if (!seen.has(key)) {
          seen.add(key);
          result.push(elem);
        }
      }
      return vArray(result);
    }
    if (expr.field === 'filterMap') {
      const list = obj;
      return vLam((f: Value) => {
        if (list.kind === 'VArray') {
          const results: Value[] = [];
          for (const elem of list.elements) {
            const result = applyValue(f, elem);
            if (result.kind === 'VConstr' && result.name === 'some' && result.args.length === 1) {
              results.push(result.args[0]);
            }
          }
          return vArray(results);
        }
        return vNeutral(nApp(nApp(nVar('List.filterMap'), list), f));
      });
    }
    if (expr.field === 'head?') {
      if (obj.elements.length > 0) {
        return vConstr('some', [obj.elements[0]]);
      }
      return vConstr('none', []);
    }
    if (expr.field === 'toArray') {
      return obj; // Already an array
    }
    if (expr.field === 'elem') {
      const list = obj;
      return vLam((elem: Value) => {
        if (list.kind === 'VArray') {
          for (const e of list.elements) {
            if (valuesEqual(e, elem)) {
              return vBool(true);
            }
          }
          return vBool(false);
        }
        return vNeutral(nApp(nApp(nVar('List.elem'), list), elem));
      });
    }
    if (expr.field === 'mapIdx') {
      const list = obj;
      return vLam((f: Value) => {
        if (list.kind === 'VArray') {
          const mapped = list.elements.map((elem, idx) =>
            applyValue(applyValue(f, vNat(idx)), elem)
          );
          return vArray(mapped);
        }
        return vNeutral(nApp(nApp(nVar('List.mapIdx'), list), f));
      });
    }
    if (expr.field === 'toList') {
      // Convert array to List constructor form
      let list = vConstr('List.nil', []);
      for (let i = obj.elements.length - 1; i >= 0; i--) {
        list = vConstr('List.cons', [obj.elements[i], list]);
      }
      return list;
    }
    if (expr.field === 'qsort' || expr.field === 'sort') {
      // Array.qsort : (α → α → Bool) → Array α → Array α
      const arr = obj;
      return vLam((lt: Value) => {
        if (arr.kind === 'VArray') {
          const sorted = [...arr.elements].sort((a, b) => {
            const result = applyValue(applyValue(lt, a), b);
            if (result.kind === 'VLit' && result.type === 'bool') {
              return result.value ? -1 : 1;
            }
            return 0;
          });
          return vArray(sorted);
        }
        return vNeutral(nApp(nApp(nVar('Array.qsort'), arr), lt));
      });
    }
  }

  if (obj.kind === 'VStruct') {
    const field = obj.fields.find(f => f.name === expr.field);
    if (field) {
      return field.value;
    }
  }

  throw new EvalError(`Cannot access field ${expr.field} on ${formatValue(obj)}`);
}

function evalProj(expr: AST.ProjExpr, env: Env): Value {
  const obj = evaluate(expr.expr, env);

  if (obj.kind === 'VArray' && expr.index >= 0 && expr.index < obj.elements.length) {
    return obj.elements[expr.index];
  }

  if (obj.kind === 'VNeutral') {
    return vNeutral(nProj(obj.neutral, expr.index));
  }

  if (obj.kind === 'VConstr') {
    // Tuple/structure projection
    if (expr.index >= 0 && expr.index < obj.args.length) {
      return obj.args[expr.index];
    }
  }

  throw new EvalError(`Invalid projection: ${expr.index}`);
}

function evalArrayLit(expr: AST.ArrayLitExpr, env: Env): Value {
  const elements = expr.elements.map((e) => evaluate(e, env));
  return vArray(elements);
}

function evalTuple(expr: AST.TupleExpr, env: Env): Value {
  const elements = expr.elements.map((e) => evaluate(e, env));
  // For pairs, use Pair.mk constructor
  if (elements.length === 2) {
    return vConstr('Pair.mk', elements);
  }
  // For larger tuples, build nested pairs (right-associative like Lean4)
  // (a, b, c) becomes (a, (b, c))
  if (elements.length > 2) {
    let result = vConstr('Pair.mk', [elements[elements.length - 2], elements[elements.length - 1]]);
    for (let i = elements.length - 3; i >= 0; i--) {
      result = vConstr('Pair.mk', [elements[i], result]);
    }
    return result;
  }
  // Single element tuple - just return the element
  if (elements.length === 1) {
    return elements[0];
  }
  // Empty tuple
  return vArray(elements);
}

function evalStructLit(expr: AST.StructLitExpr, env: Env): Value {
  // Evaluate all field values
  const fields: { name: string; value: Value }[] = expr.fields.map(f => ({
    name: f.name,
    value: evaluate(f.value, env)
  }));
  // Return as a VStruct to preserve field names
  return vStruct(fields);
}

function evalInterpolatedString(expr: AST.InterpolatedStringExpr, env: Env): Value {
  let result = '';
  for (const part of expr.parts) {
    if (part.type === 'text') {
      result += part.value;
    } else {
      // Evaluate the expression and format it (without extra quotes for strings/chars)
      const value = evaluate(part.value, env);
      result += formatValueRaw(value);
    }
  }
  return vString(result);
}

function evalBinOp(expr: AST.BinOpExpr, env: Env): Value {
  const left = evaluate(expr.left, env);
  const right = evaluate(expr.right, env);

  return applyBinaryOp(expr.op, left, right);
}

function applyBinaryOp(op: AST.BinaryOp, left: Value, right: Value): Value {
  // Numeric operations
  if (left.kind === 'VLit' && right.kind === 'VLit') {
    const l = left.value;
    const r = right.value;

    switch (op) {
      case 'add':
        if (left.type === 'nat' || left.type === 'int') {
          return vInt(Number(l) + Number(r));
        }
        if (left.type === 'float') {
          return vFloat(Number(l) + Number(r));
        }
        break;

      case 'sub':
        if (left.type === 'nat') {
          // Nat subtraction saturates at 0
          return vNat(Math.max(0, Number(l) - Number(r)).toString());
        }
        if (left.type === 'int') {
          return vInt(Number(l) - Number(r));
        }
        if (left.type === 'float') {
          return vFloat(Number(l) - Number(r));
        }
        break;

      case 'mul':
        if (left.type === 'nat' || left.type === 'int') {
          return vInt(Number(l) * Number(r));
        }
        if (left.type === 'float') {
          return vFloat(Number(l) * Number(r));
        }
        break;

      case 'div':
        if (left.type === 'nat' || left.type === 'int') {
          return vInt(Math.floor(Number(l) / Number(r)));
        }
        if (left.type === 'float') {
          return vFloat(Number(l) / Number(r));
        }
        break;

      case 'append':
        // String concatenation (both operands are VLit as narrowed by outer if)
        if (left.type === 'string' && right.type === 'string') {
          return vString(String(left.value) + String(right.value));
        }
        break;

      case 'mod':
        if (left.type === 'nat' || left.type === 'int') {
          return vInt(Number(l) % Number(r));
        }
        break;

      case 'pow':
        if (left.type === 'nat' || left.type === 'int' || left.type === 'float') {
          return vFloat(Math.pow(Number(l), Number(r)));
        }
        break;

      case 'eq':
        return vBool(l === r);

      case 'ne':
        return vBool(l !== r);

      case 'lt':
        return vBool(Number(l) < Number(r));

      case 'le':
        return vBool(Number(l) <= Number(r));

      case 'gt':
        return vBool(Number(l) > Number(r));

      case 'ge':
        return vBool(Number(l) >= Number(r));

      case 'and':
        return vBool(Boolean(l) && Boolean(r));

      case 'or':
        return vBool(Boolean(l) || Boolean(r));

      case 'implies':
        return vBool(!Boolean(l) || Boolean(r));

      case 'iff':
        return vBool(Boolean(l) === Boolean(r));
    }
  }

  // String operations
  if (left.kind === 'VLit' && left.type === 'string') {
    switch (op) {
      case 'add':
        if (right.kind === 'VLit' && right.type === 'string') {
          return vString(String(left.value) + String(right.value));
        }
        break;
      case 'eq':
        return vBool(left.value === (right.kind === 'VLit' ? right.value : formatValue(right)));
      case 'ne':
        return vBool(left.value !== (right.kind === 'VLit' ? right.value : formatValue(right)));
    }
  }

  // List operations
  if (op === 'cons') {
    // h :: t - prepend head to tail
    if (right.kind === 'VArray') {
      return vArray([left, ...right.elements]);
    }
    if (right.kind === 'VConstr' && right.name === 'nil') {
      // h :: nil = [h]
      return vArray([left]);
    }
    // If tail is a constructor, build a cons constructor
    return vConstr('cons', [left, right]);
  }

  // List/Array operations
  if (left.kind === 'VConstr' || right.kind === 'VConstr') {
    if (op === 'append') {
      if (left.kind === 'VArray' && right.kind === 'VArray') {
        return vArray([...left.elements, ...right.elements]);
      }
    }
    // Handle equality for constructors
    if (op === 'eq') {
      return vBool(valuesEqual(left, right));
    }
    if (op === 'ne') {
      return vBool(!valuesEqual(left, right));
    }
  }

  // Array operations
  if (left.kind === 'VArray') {
    if (op === 'append' && right.kind === 'VArray') {
      return vArray([...left.elements, ...right.elements]);
    }
  }

  // Neutral case
  return vNeutral(nApp(
    nApp({ kind: 'NVar', name: op }, left),
    right
  ));
}

function evalUnaryOp(expr: AST.UnaryOpExpr, env: Env): Value {
  const operand = evaluate(expr.operand, env);

  if (operand.kind === 'VLit') {
    switch (expr.op) {
      case 'not':
        return vBool(!Boolean(operand.value));
      case 'neg':
        if (operand.type === 'nat' || operand.type === 'int') {
          return vInt(-Number(operand.value));
        }
        if (operand.type === 'float') {
          return vFloat(-Number(operand.value));
        }
        break;
    }
  }

  return vNeutral(nApp({ kind: 'NVar', name: expr.op }, operand));
}

// Count the number of arguments a constructor takes based on its type
function countConstructorArgs(type: AST.Expr | undefined): number {
  if (!type) return 0;

  // If it's a function type (arrow ->), count arrows
  // Note: Arrow types are parsed as binOp with 'implies' op
  if (type.kind === 'binOp' && (type.op === 'implies' || type.op === 'range')) {
    // Count arrows recursively
    return 1 + countConstructorArgs(type.right);
  }

  // For pi types, count parameters
  if (type.kind === 'pi') {
    return type.params.length + countConstructorArgs(type.body);
  }

  // For forall types, count parameters
  if (type.kind === 'forall') {
    return type.params.length + countConstructorArgs(type.body);
  }

  return 0;
}

// Create a lambda that builds a constructor with the given number of args
function createConstructorLambda(name: string, argCount: number): Value {
  if (argCount === 0) {
    return vConstr(name, []);
  }

  // Build nested lambdas that collect arguments
  const buildNested = (depth: number, args: Value[]): Value => {
    if (depth === 0) {
      return vConstr(name, args);
    }
    return vLam((arg: Value) => buildNested(depth - 1, [...args, arg]));
  };

  return buildNested(argCount, []);
}

// Evaluate a module and return all definitions
export function evaluateModule(module: AST.Module, initialEnv?: Env): Map<string, Value> {
  const env: Env = initialEnv ? new Map(initialEnv) : new Map();
  const results = new Map<string, Value>();

  // First pass: register all definitions (for recursion support)
  for (const decl of module.decls) {
    if (decl.kind === 'def') {
      // Add a placeholder that will be updated
      env.set(decl.name, vNeutral(nVar(decl.name)));
    }
  }

  for (const decl of module.decls) {
    switch (decl.kind) {
      case 'def':
        let value: Value;
        if (decl.params.length > 0) {
          // Wrap in lambdas for parameters
          value = evaluateDefWithParams(decl, env);
        } else {
          value = evaluate(decl.value, env);
        }
        env.set(decl.name, value);
        results.set(decl.name, value);
        break;

      case 'theorem':
        const proof = evaluate(decl.proof, env);
        env.set(decl.name, proof);
        results.set(decl.name, proof);
        break;

      case 'axiom':
      case 'constant':
        // Axioms are opaque
        env.set(decl.name, vNeutral(nVar(decl.name)));
        break;

      case 'inductive':
        // Register constructors with qualified names
        for (const ctor of decl.ctors) {
          const qualifiedName = `${decl.name}.${ctor.name}`;
          // Check if constructor has arguments (by looking at its type)
          const argCount = countConstructorArgs(ctor.type);
          if (argCount === 0) {
            // Nullary constructor - store as a constant value
            env.set(qualifiedName, vConstr(qualifiedName, []));
            // Also store without prefix for compatibility
            env.set(ctor.name, vConstr(qualifiedName, []));
          } else {
            // Constructor with arguments - create a lambda
            env.set(qualifiedName, createConstructorLambda(qualifiedName, argCount));
            // Also store without prefix for compatibility
            env.set(ctor.name, createConstructorLambda(qualifiedName, argCount));
          }
        }
        break;

      case 'structure':
        // Register structure constructor
        env.set(decl.name, vLam((...args: Value[]) => vConstr(decl.name, args)));
        break;

      case 'namespace':
        // Process namespace declarations
        for (const innerDecl of decl.decls) {
          if (innerDecl.kind === 'def') {
            const innerValue = evaluate(innerDecl.value, env);
            env.set(`${decl.name}.${innerDecl.name}`, innerValue);
            results.set(`${decl.name}.${innerDecl.name}`, innerValue);
          }
        }
        break;

      case 'variable':
        env.set(decl.name, vNeutral(nVar(decl.name)));
        break;
    }
  }

  return results;
}

// Helper function to evaluate a def with parameters as a lambda
function evaluateDefWithParams(decl: AST.DefDecl, env: Env): Value {
  if (decl.params.length === 0) {
    return evaluate(decl.value, env);
  }

  // Create nested lambdas for each parameter
  return buildLambdaFromParams(decl.params, decl.value, env);
}

function buildLambdaFromParams(params: AST.Binder[], body: AST.Expr, env: Env): Value {
  if (params.length === 0) {
    return evaluate(body, env);
  }

  const [first, ...rest] = params;

  return vLam((arg: Value) => {
    const newEnv = new Map(env);
    newEnv.set(first.name, arg);

    if (rest.length === 0) {
      return evaluate(body, newEnv);
    }

    return buildLambdaFromParams(rest, body, newEnv);
  });
}

// REPL evaluation
export function evalString(source: string): string {
  const { parse } = require('../parser/parser');
  const module = parse(source);
  const results = evaluateModule(module);

  const output: string[] = [];
  for (const [name, value] of results) {
    output.push(`${name}: ${formatValue(value)}`);
  }

  return output.join('\n');
}
