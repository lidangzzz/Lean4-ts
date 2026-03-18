#!/usr/bin/env npx ts-node
// Generate 1000 Lean4 test programs

import * as fs from 'fs';
import * as path from 'path';

const testDir = path.join(__dirname, 'test_programs');

// Ensure test directory exists
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Test categories
const tests: { name: string; content: string }[] = [];

// Helper to add test
const addTest = (name: string, content: string) => {
  tests.push({ name: `${tests.length.toString().padStart(4, '0')}_${name}.lean`, content });
};

// === Category 1: Basic literals (1-50) ===

// Natural numbers
for (let i = 0; i < 10; i++) {
  addTest(`nat_literal_${i}`, `def x := ${i}\n#eval x`);
}

// Negative integers
for (let i = -5; i < 5; i++) {
  addTest(`int_literal_${i}`, `def x := ${i}\n#eval x`);
}

// Floats
for (let i = 0; i < 10; i++) {
  addTest(`float_literal_${i}`, `def x := ${i}.${i}\n#eval x`);
}

// Strings
const strings = ['hello', 'world', 'Lean4', '', 'test string', 'with spaces', 'with\\nnewline', 'with\\ttab'];
strings.forEach((s, i) => {
  addTest(`string_literal_${i}`, `def x := "${s}"\n#eval x`);
});

// Booleans
addTest('bool_true', `def x := true\n#eval x`);
addTest('bool_false', `def x := false\n#eval x`);

// === Category 2: Arithmetic operations (51-150) ===

// Addition
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    addTest(`add_${i}_${j}`, `def x := ${i} + ${j}\n#eval x`);
  }
}

// Subtraction
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    addTest(`sub_${i}_${j}`, `def x := ${i} - ${j}\n#eval x`);
  }
}

// Multiplication
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    addTest(`mul_${i}_${j}`, `def x := ${i} * ${j}\n#eval x`);
  }
}

// Division
for (let i = 1; i < 10; i++) {
  for (let j = 1; j < 10; j++) {
    addTest(`div_${i}_${j}`, `def x := ${i} / ${j}\n#eval x`);
  }
}

// Modulo
for (let i = 0; i < 10; i++) {
  for (let j = 1; j < 10; j++) {
    addTest(`mod_${i}_${j}`, `def x := ${i} % ${j}\n#eval x`);
  }
}

// === Category 3: Comparison operations (151-250) ===

// Equality
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    addTest(`eq_${i}_${j}`, `def x := ${i} == ${j}\n#eval x`);
  }
}

// Less than
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    addTest(`lt_${i}_${j}`, `def x := ${i} < ${j}\n#eval x`);
  }
}

// Less than or equal
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    addTest(`le_${i}_${j}`, `def x := ${i} <= ${j}\n#eval x`);
  }
}

// Greater than
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    addTest(`gt_${i}_${j}`, `def x := ${i} > ${j}\n#eval x`);
  }
}

// === Category 4: Boolean operations (251-300) ===

// And
addTest('and_tt', `def x := true && true\n#eval x`);
addTest('and_tf', `def x := true && false\n#eval x`);
addTest('and_ft', `def x := false && true\n#eval x`);
addTest('and_ff', `def x := false && false\n#eval x`);

// Or
addTest('or_tt', `def x := true || true\n#eval x`);
addTest('or_tf', `def x := true || false\n#eval x`);
addTest('or_ft', `def x := false || true\n#eval x`);
addTest('or_ff', `def x := false || false\n#eval x`);

// Not
addTest('not_t', `def x := !true\n#eval x`);
addTest('not_f', `def x := !false\n#eval x`);

// Complex boolean expressions
addTest('complex_bool_1', `def x := (true && false) || true\n#eval x`);
addTest('complex_bool_2', `def x := !(true && false)\n#eval x`);
addTest('complex_bool_3', `def x := (true || false) && (false || true)\n#eval x`);

// === Category 5: If expressions (301-400) ===

// Simple if
for (let i = 0; i < 10; i++) {
  addTest(`if_simple_${i}`, `def x := if ${i} > 5 then 1 else 0\n#eval x`);
}

// Nested if
for (let i = 0; i < 10; i++) {
  addTest(`if_nested_${i}`, `def x := if ${i} < 3 then 0 else if ${i} < 7 then 1 else 2\n#eval x`);
}

// If with boolean
addTest('if_bool_true', `def x := if true then 1 else 0\n#eval x`);
addTest('if_bool_false', `def x := if false then 1 else 0\n#eval x`);

// If with comparison
addTest('if_eq', `def x := if 5 == 5 then 100 else 200\n#eval x`);
addTest('if_ne', `def x := if 5 != 3 then 100 else 200\n#eval x`);

// === Category 6: Functions/Lambdas (401-500) ===

// Simple identity function
addTest('fn_identity', `def id (x : Nat) := x\n#eval id 42`);

// Constant function
addTest('fn_const', `def const (x : Nat) := 5\n#eval const 100`);

// Two argument function
addTest('fn_two_args', `def add (x : Nat) (y : Nat) := x + y\n#eval add 3 4`);

// Three argument function
addTest('fn_three_args', `def add3 (x : Nat) (y : Nat) (z : Nat) := x + y + z\n#eval add3 1 2 3`);

// Lambda expressions
addTest('lambda_simple', `def f := fun x => x + 1\n#eval f 5`);
addTest('lambda_two_params', `def f := fun x y => x + y\n#eval f 3 4`);
addTest('lambda_nested', `def f := fun x => (fun y => x + y)\n#eval f 3 4`);

// Higher order functions
addTest('hof_apply', `def apply (f : Nat -> Nat) (x : Nat) := f x\ndef inc := fun x => x + 1\n#eval apply inc 5`);
addTest('hof_compose', `def compose (f : Nat -> Nat) (g : Nat -> Nat) (x : Nat) := f (g x)\ndef inc := fun x => x + 1\ndef double := fun x => x * 2\n#eval compose inc double 3`);

// Recursive functions
addTest('fn_factorial', `def factorial (n : Nat) : Nat := if n <= 1 then 1 else n * factorial (n - 1)\n#eval factorial 5`);
addTest('fn_fibonacci', `def fib (n : Nat) : Nat := if n <= 1 then n else fib (n - 1) + fib (n - 2)\n#eval fib 10`);

// === Category 7: Let expressions (501-550) ===

addTest('let_simple', `def x := let y := 5 in y + 1\n#eval x`);
addTest('let_nested', `def x := let y := 5 in let z := 10 in y + z\n#eval x`);
addTest('let_shadow', `def x := let y := 5 in let y := 10 in y\n#eval x`);
addTest('let_in_let', `def x := let a := 1 in let b := a + 1 in let c := b + 1 in c\n#eval x`);

// === Category 8: Match expressions (551-650) ===

// Match on booleans
addTest('match_bool_true', `def x := match true with | true => 1 | false => 0\n#eval x`);
addTest('match_bool_false', `def x := match false with | true => 1 | false => 0\n#eval x`);

// Match on numbers
for (let i = 0; i < 5; i++) {
  addTest(`match_nat_${i}`, `def x := match ${i} with | 0 => 0 | 1 => 1 | _ => 2\n#eval x`);
}

// Match with patterns
addTest('match_wildcard', `def f n := match n with | 0 => 0 | _ => 1\n#eval f 5`);
addTest('match_multiple', `def f n := match n with | 0 => "zero" | 1 => "one" | 2 => "two" | _ => "many"\n#eval f 2`);

// === Category 9: Arrays/Lists (651-750) ===

// Empty array
addTest('array_empty', `def x := []\n#eval x`);

// Single element arrays
for (let i = 0; i < 10; i++) {
  addTest(`array_single_${i}`, `def x := [${i}]\n#eval x`);
}

// Multiple element arrays
addTest('array_two', `def x := [1, 2]\n#eval x`);
addTest('array_three', `def x := [1, 2, 3]\n#eval x`);
addTest('array_five', `def x := [1, 2, 3, 4, 5]\n#eval x`);

// Array with expressions
addTest('array_expr', `def x := [1 + 1, 2 + 2, 3 + 3]\n#eval x`);

// Nested arrays
addTest('array_nested', `def x := [[1, 2], [3, 4]]\n#eval x`);

// Array operations
addTest('array_append', `def x := [1, 2] ++ [3, 4]\n#eval x`);

// === Category 10: Inductive types (751-850) ===

// Option type
addTest('inductive_option', `
inductive Option (α : Type) where
  | none : Option α
  | some : α -> Option α
def x := Option.some 42
#eval x
`);

// Nat type
addTest('inductive_nat', `
inductive Nat where
  | zero : Nat
  | succ : Nat -> Nat
def x := Nat.succ Nat.zero
#eval x
`);

// List type
addTest('inductive_list', `
inductive List (α : Type) where
  | nil : List α
  | cons : α -> List α -> List α
def x := List.cons 1 List.nil
#eval x
`);

// Bool type
addTest('inductive_bool', `
inductive Bool where
  | false : Bool
  | true : Bool
def x := Bool.true
#eval x
`);

// Pair type
addTest('inductive_pair', `
inductive Pair (α : Type) (β : Type) where
  | mk : α -> β -> Pair α β
def x := Pair.mk 1 2
#eval x
`);

// === Category 11: Structures (851-900) ===

addTest('structure_point', `
structure Point where
  x : Nat
  y : Nat
def p := Point.mk 3 4
#eval p
`);

addTest('structure_person', `
structure Person where
  name : String
  age : Nat
def john := Person.mk "John" 30
#eval john
`);

addTest('structure_nested', `
structure Addr where
  city : String
  country : String
structure Contact where
  name : String
  addr : Addr
def c := Contact.mk "Alice" (Addr.mk "NYC" "USA")
#eval c
`);

// === Category 12: Type annotations (901-950) ===

addTest('type_nat', `def x : Nat := 42\n#eval x`);
addTest('type_string', `def x : String := "hello"\n#eval x`);
addTest('type_bool', `def x : Bool := true\n#eval x`);
addTest('type_fn', `def f (x : Nat) : Nat := x + 1\n#eval f 5`);

// === Category 13: Complex expressions (951-1000) ===

// Complex arithmetic
addTest('complex_arith_1', `def x := (1 + 2) * (3 + 4)\n#eval x`);
addTest('complex_arith_2', `def x := 10 - 3 + 2 * 4\n#eval x`);
addTest('complex_arith_3', `def x := (10 - 3) + (2 * 4)\n#eval x`);

// Complex comparisons
addTest('complex_comp_1', `def x := (1 < 2) && (3 < 4)\n#eval x`);
addTest('complex_comp_2', `def x := (5 == 5) || (3 != 3)\n#eval x`);

// Complex function application
addTest('complex_app_1', `def f x := x + 1\ndef g x := x * 2\ndef x := f (g 5)\n#eval x`);
addTest('complex_app_2', `def f x y := x + y\ndef g x := f x x\ndef x := g 5\n#eval x`);

// Multiple definitions
addTest('multi_def_1', `
def a := 1
def b := 2
def c := a + b
#eval c
`);

addTest('multi_def_2', `
def double x := x * 2
def quadruple x := double (double x)
#eval quadruple 5
`);

// String operations
addTest('string_concat', `def x := "Hello, " ++ "World!"\n#eval x`);

// Recursive sequences
addTest('seq_sum', `
def sumTo (n : Nat) : Nat := if n <= 0 then 0 else n + sumTo (n - 1)
#eval sumTo 10
`);

addTest('seq_product', `
def prodTo (n : Nat) : Nat := if n <= 1 then 1 else n * prodTo (n - 1)
#eval prodTo 5
`);

// Mathematical functions
addTest('math_power', `
def power (base : Nat) (exp : Nat) : Nat := if exp == 0 then 1 else base * power base (exp - 1)
#eval power 2 10
`);

addTest('math_gcd', `
def gcd (a : Nat) (b : Nat) : Nat := if b == 0 then a else gcd b (a % b)
#eval gcd 48 18
`);

// Fill remaining slots with variations
let remaining = 1000 - tests.length;
for (let i = 0; i < remaining; i++) {
  const a = i % 10;
  const b = Math.floor(i / 10) % 10;
  addTest(`variation_${i}`, `def x := ${a} + ${b}\n#eval x`);
}

// Write all test files
console.log(`Generating ${tests.length} test files...`);

tests.forEach((test, index) => {
  const filepath = path.join(testDir, test.name);
  fs.writeFileSync(filepath, test.content);
  if ((index + 1) % 100 === 0) {
    console.log(`Generated ${index + 1} tests...`);
  }
});

console.log(`\nSuccessfully generated ${tests.length} test programs in ${testDir}`);

// Generate summary
const summary = tests.map((t, i) => `${i + 1}. ${t.name}`).join('\n');
fs.writeFileSync(path.join(testDir, '_summary.txt'), summary);
console.log('Summary written to _summary.txt');
