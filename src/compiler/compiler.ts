// Lean4 Compiler Main Entry Point

import { tokenize, Token, TokenType } from '../lexer';
import { parse, Module, DefDecl, Expr, IdentExpr, AppExpr, LiteralExpr } from '../parser';
import { evaluate, evaluateModule, applyValue, EvalError } from '../evaluator';
import { Value, formatValue, Env, vNat, vInt, vFloat, vString, vBool, vArray, vConstr, vNeutral, vLam, nVar } from '../types';

export interface CompileResult {
  success: boolean;
  output: string;
  errors: string[];
  values: Map<string, Value>;
}

export interface CompileOptions {
  verbose?: boolean;
  timeout?: number;
}

export class Lean4Compiler {
  private options: CompileOptions;

  constructor(options: CompileOptions = {}) {
    this.options = options;
  }

  compile(source: string): CompileResult {
    const errors: string[] = [];
    const output: string[] = [];
    const values = new Map<string, Value>();

    try {
      // Lexing
      if (this.options.verbose) {
        output.push('=== Lexing ===');
      }
      const tokens = tokenize(source);

      if (this.options.verbose) {
        output.push(`Tokens: ${tokens.length}`);
      }

      // Parsing
      if (this.options.verbose) {
        output.push('=== Parsing ===');
      }
      const module = parse(source);

      if (this.options.verbose) {
        output.push(`Declarations: ${module.decls.length}`);
      }

      // Evaluation
      if (this.options.verbose) {
        output.push('=== Evaluation ===');
      }

      const prelude = this.buildPrelude();
      const results = evaluateModule(module, prelude);

      for (const [name, value] of results) {
        values.set(name, value);
      }

      // Only output #eval commands (matching original Lean4 compiler behavior)
      const evalOutputs = this.processEvalCommands(source, results);
      output.push(...evalOutputs);

      return {
        success: true,
        output: output.join('\n'),
        errors,
        values
      };
    } catch (error: any) {
      errors.push(error.message || String(error));
      return {
        success: false,
        output: output.join('\n'),
        errors,
        values
      };
    }
  }

  private processEvalCommands(source: string, env: Env): string[] {
    const outputs: string[] = [];
    const lines = source.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Handle #eval commands
      if (trimmed.startsWith('#eval ')) {
        const expr = trimmed.slice(6).trim();
        try {
          // Parse and evaluate the expression
          const fakeModule = `def __eval_expr := ${expr}`;
          const module = parse(fakeModule);
          const results = evaluateModule(module, env);
          const value = results.get('__eval_expr');
          if (value) {
            outputs.push(formatValue(value));
          }
        } catch (error: any) {
          outputs.push(`Error: ${error.message}`);
        }
      }

      // Handle #print commands
      if (trimmed.startsWith('#print ')) {
        const name = trimmed.slice(7).trim();
        outputs.push(name);
      }

      // Handle #check commands
      if (trimmed.startsWith('#check ')) {
        const expr = trimmed.slice(7).trim();
        outputs.push(`Type of: ${expr}`);
      }

      // Handle #reduce commands
      if (trimmed.startsWith('#reduce ')) {
        const expr = trimmed.slice(8).trim();
        try {
          const fakeModule = `def __reduce_expr := ${expr}`;
          const module = parse(fakeModule);
          const results = evaluateModule(module, env);
          const value = results.get('__reduce_expr');
          if (value) {
            outputs.push(formatValue(value));
          }
        } catch (error: any) {
          outputs.push(`Error: ${error.message}`);
        }
      }
    }

    return outputs;
  }

  private buildPrelude(): Env {
    const env: Env = new Map();

    // Basic values
    env.set('true', vBool(true));
    env.set('false', vBool(false));

    // List constructors
    env.set('nil', vArray([]));
    env.set('cons', vLam((h: Value) => vLam((t: Value) => {
      if (t.kind === 'VArray') {
        return vArray([h, ...t.elements]);
      }
      return vConstr('cons', [h, t]);
    })));

    // Option constructors
    env.set('none', vConstr('none', []));
    env.set('some', vLam((x: Value) => vConstr('some', [x])));

    // Nat operations
    env.set('Nat.add', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit') {
        return vInt(Number(a.value) + Number(b.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Nat.add' });
    })));

    env.set('Nat.sub', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit') {
        return vInt(Math.max(0, Number(a.value) - Number(b.value)));
      }
      return vNeutral({ kind: 'NVar', name: 'Nat.sub' });
    })));

    env.set('Nat.mul', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit') {
        return vInt(Number(a.value) * Number(b.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Nat.mul' });
    })));

    env.set('Nat.div', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit') {
        return vInt(Math.floor(Number(a.value) / Number(b.value)));
      }
      return vNeutral({ kind: 'NVar', name: 'Nat.div' });
    })));

    env.set('Nat.mod', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit') {
        return vInt(Number(a.value) % Number(b.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Nat.mod' });
    })));

    // Int operations
    env.set('Int.ofNat', vLam((n: Value) => {
      if (n.kind === 'VLit' && (n.type === 'nat' || n.type === 'int')) {
        return vInt(Number(n.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Int.ofNat' });
    }));

    env.set('Int.toNat', vLam((n: Value) => {
      if (n.kind === 'VLit' && (n.type === 'nat' || n.type === 'int')) {
        return vNat(Math.abs(Number(n.value)).toString());
      }
      return vNeutral({ kind: 'NVar', name: 'Int.toNat' });
    }));

    env.set('Int.neg', vLam((n: Value) => {
      if (n.kind === 'VLit' && (n.type === 'nat' || n.type === 'int')) {
        return vInt(-Number(n.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Int.neg' });
    }));

    env.set('Int.add', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit') {
        return vInt(Number(a.value) + Number(b.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Int.add' });
    })));

    env.set('Int.sub', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit') {
        return vInt(Number(a.value) - Number(b.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Int.sub' });
    })));

    env.set('Int.mul', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit') {
        return vInt(Number(a.value) * Number(b.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Int.mul' });
    })));

    env.set('Int.div', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit' && Number(b.value) !== 0) {
        return vInt(Math.trunc(Number(a.value) / Number(b.value)));
      }
      return vNeutral({ kind: 'NVar', name: 'Int.div' });
    })));

    env.set('Int.mod', vLam((a: Value) => vLam((b: Value) => {
      if (a.kind === 'VLit' && b.kind === 'VLit' && Number(b.value) !== 0) {
        return vInt(Number(a.value) % Number(b.value));
      }
      return vNeutral({ kind: 'NVar', name: 'Int.mod' });
    })));

    // List operations
    env.set('List.map', vLam((f: Value) => vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        return vArray(lst.elements.map((x) => applyValue(f, x)));
      }
      return vNeutral({ kind: 'NVar', name: 'List.map' });
    })));

    env.set('List.filter', vLam((p: Value) => vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        const filtered = lst.elements.filter((x) => {
          const result = applyValue(p, x);
          return result.kind === 'VLit' && result.type === 'bool' && result.value === true;
        });
        return vArray(filtered);
      }
      return vNeutral({ kind: 'NVar', name: 'List.filter' });
    })));

    env.set('List.foldl', vLam((f: Value) => vLam((init: Value) => vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        return lst.elements.reduce((acc, x) => applyValue(applyValue(f, acc), x), init);
      }
      return vNeutral({ kind: 'NVar', name: 'List.foldl' });
    }))));

    env.set('List.length', vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        return vNat(lst.elements.length);
      }
      return vNeutral({ kind: 'NVar', name: 'List.length' });
    }));

    env.set('List.sum', vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        let sum = 0;
        for (const elem of lst.elements) {
          if (elem.kind === 'VLit' && (elem.type === 'nat' || elem.type === 'int')) {
            sum = Number(sum) + Number(elem.value);
          }
        }
        return vNat(sum.toString());
      }
      return vNeutral({ kind: 'NVar', name: 'List.sum' });
    }));

    env.set('List.range', vLam((n: Value) => {
      if (n.kind === 'VLit' && (n.type === 'nat' || n.type === 'int')) {
        const count = Number(n.value);
        const elements: Value[] = [];
        for (let i = 0; i < count; i++) {
          elements.push(vNat(i.toString()));
        }
        return vArray(elements);
      }
      return vNeutral({ kind: 'NVar', name: 'List.range' });
    }));

    env.set('List.append', vLam((l1: Value) => vLam((l2: Value) => {
      if (l1.kind === 'VArray' && l2.kind === 'VArray') {
        return vArray([...l1.elements, ...l2.elements]);
      }
      return vNeutral({ kind: 'NVar', name: 'List.append' });
    })));

    env.set('List.zip', vLam((l1: Value) => vLam((l2: Value) => {
      if (l1.kind === 'VArray' && l2.kind === 'VArray') {
        const len = Math.min(l1.elements.length, l2.elements.length);
        const pairs: Value[] = [];
        for (let i = 0; i < len; i++) {
          pairs.push(vConstr('Pair.mk', [l1.elements[i], l2.elements[i]]));
        }
        return vArray(pairs);
      }
      return vNeutral({ kind: 'NVar', name: 'List.zip' });
    })));

    env.set('List.headD', vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        if (lst.elements.length === 0) {
          return vConstr('none', []);
        }
        return vConstr('some', [lst.elements[0]]);
      }
      return vNeutral({ kind: 'NVar', name: 'List.headD' });
    }));

    env.set('List.tailD', vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        if (lst.elements.length === 0) {
          return vConstr('none', []);
        }
        return vConstr('some', [vArray(lst.elements.slice(1))]);
      }
      return vNeutral({ kind: 'NVar', name: 'List.tailD' });
    }));

    env.set('List.any', vLam((p: Value) => vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        for (const elem of lst.elements) {
          const result = applyValue(p, elem);
          if (result.kind === 'VLit' && result.type === 'bool' && result.value === true) {
            return vBool(true);
          }
        }
        return vBool(false);
      }
      return vNeutral({ kind: 'NVar', name: 'List.any' });
    })));

    env.set('List.all', vLam((p: Value) => vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        for (const elem of lst.elements) {
          const result = applyValue(p, elem);
          if (result.kind === 'VLit' && result.type === 'bool' && result.value !== true) {
            return vBool(false);
          }
        }
        return vBool(true);
      }
      return vNeutral({ kind: 'NVar', name: 'List.all' });
    })));

    // Array operations
    env.set('Array.mk', vLam((lst: Value) => {
      if (lst.kind === 'VArray') {
        return lst;
      }
      return vNeutral({ kind: 'NVar', name: 'Array.mk' });
    }));

    env.set('Array.toList', vLam((arr: Value) => {
      if (arr.kind === 'VArray') {
        return arr;
      }
      return vNeutral({ kind: 'NVar', name: 'Array.toList' });
    }));

    env.set('Array.get', vLam((arr: Value) => vLam((i: Value) => {
      if (arr.kind === 'VArray' && i.kind === 'VLit') {
        const idx = Number(i.value);
        if (idx >= 0 && idx < arr.elements.length) {
          return arr.elements[idx];
        }
      }
      return vNeutral({ kind: 'NVar', name: 'Array.get' });
    })));

    env.set('Array.set', vLam((arr: Value) => vLam((i: Value) => vLam((v: Value) => {
      if (arr.kind === 'VArray' && i.kind === 'VLit') {
        const idx = Number(i.value);
        if (idx >= 0 && idx < arr.elements.length) {
          const newElements = [...arr.elements];
          newElements[idx] = v;
          return vArray(newElements);
        }
      }
      return vNeutral({ kind: 'NVar', name: 'Array.set' });
    }))));

    env.set('Array.push', vLam((arr: Value) => vLam((v: Value) => {
      if (arr.kind === 'VArray') {
        return vArray([...arr.elements, v]);
      }
      return vNeutral({ kind: 'NVar', name: 'Array.push' });
    })));

    env.set('Array.size', vLam((arr: Value) => {
      if (arr.kind === 'VArray') {
        return vNat(arr.elements.length);
      }
      return vNeutral({ kind: 'NVar', name: 'Array.size' });
    }));

    // String operations
    env.set('String.append', vLam((s1: Value) => vLam((s2: Value) => {
      if (s1.kind === 'VLit' && s1.type === 'string' && s2.kind === 'VLit' && s2.type === 'string') {
        return vString(String(s1.value) + String(s2.value));
      }
      return vNeutral({ kind: 'NVar', name: 'String.append' });
    })));

    env.set('String.length', vLam((s: Value) => {
      if (s.kind === 'VLit' && s.type === 'string') {
        return vNat(String(s.value).length);
      }
      return vNeutral({ kind: 'NVar', name: 'String.length' });
    }));

    env.set('String.toList', vLam((s: Value) => {
      if (s.kind === 'VLit' && s.type === 'string') {
        const chars = String(s.value).split('').map((c) => ({ kind: 'VLit' as const, type: 'char' as const, value: c }));
        return vArray(chars);
      }
      return vNeutral({ kind: 'NVar', name: 'String.toList' });
    }));

    env.set('String.intercalate', vLam((sep: Value) => vLam((strs: Value) => {
      if (sep.kind === 'VLit' && sep.type === 'string' && strs.kind === 'VArray') {
        const sepStr = String(sep.value);
        const strArr = strs.elements.map((e) => {
          if (e.kind === 'VLit' && e.type === 'string') {
            return String(e.value);
          }
          return formatValue(e);
        });
        return vString(strArr.join(sepStr));
      }
      return vNeutral({ kind: 'NVar', name: 'String.intercalate' });
    })));

    env.set('String.splitOn', vLam((sep: Value) => vLam((s: Value) => {
      if (sep.kind === 'VLit' && sep.type === 'string' && s.kind === 'VLit' && s.type === 'string') {
        const parts = String(s.value).split(String(sep.value));
        return vArray(parts.map((p) => vString(p)));
      }
      return vNeutral({ kind: 'NVar', name: 'String.splitOn' });
    })));

    env.set('String.contains', vLam((c: Value) => vLam((s: Value) => {
      if (s.kind === 'VLit' && s.type === 'string') {
        const str = String(s.value);
        if (c.kind === 'VLit' && c.type === 'char') {
          return vBool(str.includes(String(c.value)));
        } else if (c.kind === 'VLit' && c.type === 'string') {
          return vBool(str.includes(String(c.value)));
        }
      }
      return vNeutral({ kind: 'NVar', name: 'String.contains' });
    })));

    env.set('String.replace', vLam((from: Value) => vLam((to: Value) => vLam((s: Value) => {
      if (from.kind === 'VLit' && from.type === 'string' && to.kind === 'VLit' && to.type === 'string' && s.kind === 'VLit' && s.type === 'string') {
        return vString(String(s.value).split(String(from.value)).join(String(to.value)));
      }
      return vNeutral({ kind: 'NVar', name: 'String.replace' });
    }))));

    env.set('String.isEmpty', vLam((s: Value) => {
      if (s.kind === 'VLit' && s.type === 'string') {
        return vBool(String(s.value).length === 0);
      }
      return vNeutral({ kind: 'NVar', name: 'String.isEmpty' });
    }));

    env.set('String.mk', vLam((chars: Value) => {
      if (chars.kind === 'VArray') {
        const str = chars.elements.map((c) => {
          if (c.kind === 'VLit' && c.type === 'char') {
            return String(c.value);
          }
          return '';
        }).join('');
        return vString(str);
      }
      return vNeutral({ kind: 'NVar', name: 'String.mk' });
    }));

    // toString function
    env.set('toString', vLam((x: Value) => {
      if (x.kind === 'VLit') {
        return vString(String(x.value));
      }
      return vString(formatValue(x));
    }));

    // IO operations (for testing)
    env.set('IO.println', vLam((s: Value) => {
      console.log(formatValue(s));
      return vConstr('Unit.mk', []);
    }));

    env.set('IO.print', vLam((s: Value) => {
      process.stdout.write(formatValue(s));
      return vConstr('Unit.mk', []);
    }));

    return env;
  }

  run(source: string): string {
    const result = this.compile(source);

    if (!result.success) {
      return `Error: ${result.errors.join('\n')}`;
    }

    return result.output;
  }
}

// Convenience functions
export function compile(source: string, options?: CompileOptions): CompileResult {
  const compiler = new Lean4Compiler(options);
  return compiler.compile(source);
}

export function run(source: string): string {
  const compiler = new Lean4Compiler();
  return compiler.run(source);
}
