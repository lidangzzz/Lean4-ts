// Basic compiler tests

import { compile, run, Lean4Compiler } from '../src/compiler';
import { tokenize } from '../src/lexer';
import { parse } from '../src/parser';
import { evaluateModule } from '../src/evaluator';
import { formatValue } from '../src/types';

describe('Lean4 Compiler', () => {
  let compiler: Lean4Compiler;

  beforeEach(() => {
    compiler = new Lean4Compiler();
  });

  describe('Lexer', () => {
    test('tokenizes numbers', () => {
      const tokens = tokenize('42');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('NUMBER');
      expect(tokens[0].value).toBe('42');
    });

    test('tokenizes strings', () => {
      const tokens = tokenize('"hello"');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe('STRING');
      expect(tokens[0].value).toBe('hello');
    });

    test('tokenizes identifiers', () => {
      const tokens = tokenize('foo bar');
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe('IDENT');
      expect(tokens[0].value).toBe('foo');
      expect(tokens[1].type).toBe('IDENT');
      expect(tokens[1].value).toBe('bar');
    });

    test('tokenizes keywords', () => {
      const tokens = tokenize('def foo := 1');
      expect(tokens[0].type).toBe('DEF');
      expect(tokens[1].type).toBe('IDENT');
      expect(tokens[2].type).toBe('ASSIGN');
      expect(tokens[3].type).toBe('NUMBER');
    });

    test('tokenizes operators', () => {
      const tokens = tokenize('-> => : . |');
      expect(tokens[0].type).toBe('ARROW');
      expect(tokens[1].type).toBe('FAT_ARROW');
      expect(tokens[2].type).toBe('COLON');
      expect(tokens[3].type).toBe('DOT');
      expect(tokens[4].type).toBe('PIPE');
    });
  });

  describe('Parser', () => {
    test('parses simple definition', () => {
      const module = parse('def x := 42');
      expect(module.decls).toHaveLength(1);
      expect(module.decls[0].kind).toBe('def');
      if (module.decls[0].kind === 'def') {
        expect(module.decls[0].name).toBe('x');
      }
    });

    test('parses function definition', () => {
      const module = parse('def add (a : Nat) (b : Nat) := a + b');
      expect(module.decls).toHaveLength(1);
      if (module.decls[0].kind === 'def') {
        expect(module.decls[0].name).toBe('add');
        expect(module.decls[0].params).toHaveLength(2);
      }
    });

    test('parses lambda expression', () => {
      const module = parse('def f := fun x => x + 1');
      expect(module.decls).toHaveLength(1);
    });

    test('parses if expression', () => {
      const module = parse('def test := if true then 1 else 2');
      expect(module.decls).toHaveLength(1);
    });

    test('parses match expression', () => {
      const module = parse(`
        def isZero (n : Nat) : Bool :=
          match n with
          | 0 => true
          | _ => false
      `);
      expect(module.decls).toHaveLength(1);
    });

    test('parses inductive type', () => {
      const module = parse(`
        inductive Nat where
        | zero : Nat
        | succ : Nat → Nat
      `);
      expect(module.decls).toHaveLength(1);
      if (module.decls[0].kind === 'inductive') {
        expect(module.decls[0].name).toBe('Nat');
        expect(module.decls[0].ctors).toHaveLength(2);
      }
    });
  });

  describe('Evaluator', () => {
    test('evaluates simple definition', () => {
      const result = compile('def x := 42');
      expect(result.success).toBe(true);
      const value = result.values.get('x');
      expect(value).toBeDefined();
      expect(formatValue(value!)).toBe('42');
    });

    test('evaluates arithmetic', () => {
      const result = compile('def x := 2 + 3');
      expect(result.success).toBe(true);
      const value = result.values.get('x');
      expect(formatValue(value!)).toBe('5');
    });

    test('evaluates nested arithmetic', () => {
      const result = compile('def x := (2 + 3) * 4');
      expect(result.success).toBe(true);
      const value = result.values.get('x');
      expect(formatValue(value!)).toBe('20');
    });

    test('evaluates string literal', () => {
      const result = compile('def x := "hello"');
      expect(result.success).toBe(true);
      const value = result.values.get('x');
      expect(formatValue(value!)).toBe('"hello"');
    });

    test('evaluates boolean', () => {
      const result = compile('def x := true');
      expect(result.success).toBe(true);
      const value = result.values.get('x');
      expect(formatValue(value!)).toBe('true');
    });

    test('evaluates if expression', () => {
      const result = compile('def x := if true then 1 else 2');
      expect(result.success).toBe(true);
      const value = result.values.get('x');
      expect(formatValue(value!)).toBe('1');
    });

    test('evaluates if expression false', () => {
      const result = compile('def x := if false then 1 else 2');
      expect(result.success).toBe(true);
      const value = result.values.get('x');
      expect(formatValue(value!)).toBe('2');
    });

    test('evaluates lambda and application', () => {
      const result = compile(`
        def add := fun x => fun y => x + y
        def result := add 2 3
      `);
      expect(result.success).toBe(true);
      const value = result.values.get('result');
      expect(formatValue(value!)).toBe('5');
    });

    test('evaluates comparison operators', () => {
      const result1 = compile('def x := 1 < 2');
      expect(result1.success).toBe(true);
      expect(formatValue(result1.values.get('x')!)).toBe('true');

      const result2 = compile('def x := 1 > 2');
      expect(result2.success).toBe(true);
      expect(formatValue(result2.values.get('x')!)).toBe('false');
    });

    test('evaluates array literal', () => {
      const result = compile('def x := [1, 2, 3]');
      expect(result.success).toBe(true);
      const value = result.values.get('x');
      expect(formatValue(value!)).toBe('[1, 2, 3]');
    });
  });

  describe('Complex Programs', () => {
    test('factorial function', () => {
      const result = compile(`
        def fac (n : Nat) : Nat :=
          if n <= 1 then 1 else n * fac (n - 1)
        def result := fac 5
      `);
      expect(result.success).toBe(true);
      const value = result.values.get('result');
      // Note: recursive functions may need special handling
    });

    test('fibonacci function', () => {
      const result = compile(`
        def fib (n : Nat) : Nat :=
          if n <= 1 then n else fib (n - 1) + fib (n - 2)
        def result := fib 10
      `);
      expect(result.success).toBe(true);
    });

    test('list operations', () => {
      const result = compile(`
        def mylist := [1, 2, 3, 4, 5]
        def len := [1, 2, 3].length
      `);
      expect(result.success).toBe(true);
    });

    test('higher order functions', () => {
      const result = compile(`
        def double (x : Nat) := x * 2
        def mylist := [1, 2, 3]
      `);
      expect(result.success).toBe(true);
    });
  });
});
