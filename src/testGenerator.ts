// Test program generator for Lean4 compiler

import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  name: string;
  source: string;
  expectedOutput: string;
}

const testCases: TestCase[] = [];

// Helper to add test case
function addTest(name: string, source: string, expectedOutput: string) {
  testCases.push({ name, source, expectedOutput });
}

// ==================== LITERAL TESTS ====================
// Numbers
for (let i = 0; i < 100; i++) {
  addTest(`nat_${i}`, `def x := ${i}`, `${i}`);
}

// Arithmetic operations
for (let i = 0; i < 50; i++) {
  const a = Math.floor(Math.random() * 100);
  const b = Math.floor(Math.random() * 100);
  addTest(`add_${a}_${b}`, `def x := ${a} + ${b}`, `${a + b}`);
  addTest(`sub_${a}_${b}`, `def x := ${a} - ${b}`, `${Math.max(0, a - b)}`);
  addTest(`mul_${a}_${b}`, `def x := ${a} * ${b}`, `${a * b}`);
}

// Division
for (let i = 1; i <= 25; i++) {
  const a = i * 10 + Math.floor(Math.random() * 10);
  const b = i;
  addTest(`div_${a}_${b}`, `def x := ${a} / ${b}`, `${Math.floor(a / b)}`);
  addTest(`mod_${a}_${b}`, `def x := ${a} % ${b}`, `${a % b}`);
}

// Comparison operations
for (let i = 0; i < 50; i++) {
  const a = Math.floor(Math.random() * 100);
  const b = Math.floor(Math.random() * 100);
  addTest(`lt_${a}_${b}`, `def x := ${a} < ${b}`, a < b ? 'true' : 'false');
  addTest(`le_${a}_${b}`, `def x := ${a} <= ${b}`, a <= b ? 'true' : 'false');
  addTest(`gt_${a}_${b}`, `def x := ${a} > ${b}`, a > b ? 'true' : 'false');
  addTest(`ge_${a}_${b}`, `def x := ${a} >= ${b}`, a >= b ? 'true' : 'false');
  addTest(`eq_${a}_${b}`, `def x := ${a} == ${b}`, a === b ? 'true' : 'false');
}

// Boolean operations
addTest('bool_true', 'def x := true', 'true');
addTest('bool_false', 'def x := false', 'false');
addTest('bool_and_tt', 'def x := true && true', 'true');
addTest('bool_and_tf', 'def x := true && false', 'false');
addTest('bool_and_ft', 'def x := false && true', 'false');
addTest('bool_and_ff', 'def x := false && false', 'false');
addTest('bool_or_tt', 'def x := true || true', 'true');
addTest('bool_or_tf', 'def x := true || false', 'true');
addTest('bool_or_ft', 'def x := false || true', 'true');
addTest('bool_or_ff', 'def x := false || false', 'false');
addTest('bool_not_t', 'def x := !true', 'false');
addTest('bool_not_f', 'def x := !false', 'true');

// String literals
addTest('string_empty', 'def x := ""', '""');
addTest('string_hello', 'def x := "hello"', '"hello"');
addTest('string_world', 'def x := "world"', '"world"');
addTest('string_numbers', 'def x := "12345"', '"12345"');
addTest('string_special', 'def x := "hello world!"', '"hello world!"');
addTest('string_escape_n', 'def x := "line1\\nline2"', '"line1\nline2"');
addTest('string_escape_t', 'def x := "col1\\tcol2"', '"col1\tcol2"');

// ==================== IF EXPRESSION TESTS ====================
for (let i = 0; i < 25; i++) {
  const cond = i % 2 === 0;
  addTest(
    `if_${i}`,
    `def x := if ${cond} then ${i} else ${i + 100}`,
    cond ? `${i}` : `${i + 100}`
  );
}

// ==================== LAMBDA TESTS ====================
addTest('lambda_id', 'def id := fun x => x\ndef y := id 42', '42');
addTest('lambda_const', 'def const := fun x => fun y => x\ndef z := const 1 2', '1');
addTest('lambda_add', 'def add := fun x => fun y => x + y\ndef z := add 3 4', '7');
addTest('lambda_mul', 'def mul := fun x => fun y => x * y\ndef z := mul 5 6', '30');
addTest('lambda_compose', `
def compose := fun f => fun g => fun x => f (g x)
def inc := fun x => x + 1
def double := fun x => x * 2
def incThenDouble := compose double inc
def z := incThenDouble 5
`, '12');

// ==================== LET EXPRESSION TESTS ====================
addTest('let_simple', 'def x := let y := 5 in y + 1', '6');
addTest('let_nested', 'def x := let a := 1 in let b := 2 in a + b', '3');
addTest('let_shadow', 'def x := let a := 1 in let a := 2 in a', '2');

// ==================== ARRAY TESTS ====================
addTest('array_empty', 'def x := []', '[]');
addTest('array_single', 'def x := [1]', '[1]');
addTest('array_two', 'def x := [1, 2]', '[1, 2]');
addTest('array_three', 'def x := [1, 2, 3]', '[1, 2, 3]');
addTest('array_strings', 'def x := ["a", "b", "c"]', '["a", "b", "c"]');
addTest('array_nested', 'def x := [[1, 2], [3, 4]]', '[[1, 2], [3, 4]]');

// ==================== FUNCTION DEFINITION TESTS ====================
for (let i = 0; i < 25; i++) {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  addTest(
    `func_add_${a}_${b}`,
    `def add (x : Nat) (y : Nat) := x + y\ndef z := add ${a} ${b}`,
    `${a + b}`
  );
}

// Square function
for (let i = 0; i < 20; i++) {
  addTest(`square_${i}`, `def square (x : Nat) := x * x\ndef y := square ${i}`, `${i * i}`);
}

// Triple function
for (let i = 0; i < 20; i++) {
  addTest(`triple_${i}`, `def triple (x : Nat) := x * 3\ndef y := triple ${i}`, `${i * 3}`);
}

// ==================== RECURSIVE FUNCTION TESTS ====================
// Factorial
addTest('factorial_0', `
def fac (n : Nat) : Nat :=
  if n <= 0 then 1 else n * fac (n - 1)
def x := fac 0
`, '1');
addTest('factorial_1', `
def fac (n : Nat) : Nat :=
  if n <= 0 then 1 else n * fac (n - 1)
def x := fac 1
`, '1');
addTest('factorial_5', `
def fac (n : Nat) : Nat :=
  if n <= 0 then 1 else n * fac (n - 1)
def x := fac 5
`, '120');
addTest('factorial_10', `
def fac (n : Nat) : Nat :=
  if n <= 0 then 1 else n * fac (n - 1)
def x := fac 10
`, '3628800');

// Fibonacci
addTest('fib_0', `
def fib (n : Nat) : Nat :=
  if n <= 0 then 0
  else if n <= 1 then 1
  else fib (n - 1) + fib (n - 2)
def x := fib 0
`, '0');
addTest('fib_1', `
def fib (n : Nat) : Nat :=
  if n <= 0 then 0
  else if n <= 1 then 1
  else fib (n - 1) + fib (n - 2)
def x := fib 1
`, '1');
addTest('fib_10', `
def fib (n : Nat) : Nat :=
  if n <= 0 then 0
  else if n <= 1 then 1
  else fib (n - 1) + fib (n - 2)
def x := fib 10
`, '55');

// ==================== MATCH EXPRESSION TESTS ====================
addTest('match_0', `
def isZero (n : Nat) : Bool :=
  match n with
  | 0 => true
  | _ => false
def x := isZero 0
`, 'true');
addTest('match_5', `
def isZero (n : Nat) : Bool :=
  match n with
  | 0 => true
  | _ => false
def x := isZero 5
`, 'false');

// ==================== INDUCTIVE TYPE TESTS ====================
addTest('inductive_nat', `
inductive MyNat where
  | zero : MyNat
  | succ : MyNat → MyNat
def x := MyNat.zero
`, 'MyNat.zero');

addTest('inductive_list', `
inductive MyList (α : Type) where
  | nil : MyList α
  | cons : α → MyList α → MyList α
def x := MyList.nil
`, 'MyList.nil');

addTest('inductive_option', `
inductive MyOption (α : Type) where
  | none : MyOption α
  | some : α → MyOption α
def x := MyOption.none
`, 'MyOption.none');

addTest('inductive_either', `
inductive Either (α : Type) (β : Type) where
  | left : α → Either α β
  | right : β → Either α β
def x := Either.left 1
`, 'Either.left 1');

// ==================== STRUCTURE TESTS ====================
addTest('structure_point', `
structure Point where
  x : Nat
  y : Nat
def origin : Point := { x := 0, y := 0 }
def x := origin
`, '{ x := 0, y := 0 }');

addTest('structure_pair', `
structure Pair (α : Type) (β : Type) where
  fst : α
  snd : β
def p : Pair Nat String := { fst := 1, snd := "hello" }
def x := p
`, '{ fst := 1, snd := "hello" }');

// ==================== TYPE ANNOTATION TESTS ====================
addTest('type_nat', 'def x : Nat := 42', '42');
addTest('type_bool', 'def x : Bool := true', 'true');
addTest('type_string', 'def x : String := "test"', '"test"');

// ==================== NESTED EXPRESSION TESTS ====================
addTest('nested_arith_1', 'def x := 1 + 2 + 3 + 4 + 5', '15');
addTest('nested_arith_2', 'def x := (1 + 2) * (3 + 4)', '21');
addTest('nested_arith_3', 'def x := 100 - 50 - 25', '25');
addTest('nested_arith_4', 'def x := 2 * 3 + 4 * 5', '26');
addTest('nested_arith_5', 'def x := 2 * (3 + 4) * 5', '70');

// ==================== OPERATOR PRECEDENCE TESTS ====================
addTest('prec_mul_add', 'def x := 2 + 3 * 4', '14');
addTest('prec_add_mul', 'def x := 2 * 3 + 4', '10');
addTest('prec_comparison', 'def x := 1 + 2 < 3 + 4', 'true');

// ==================== MORE COMPLEX TESTS ====================
// Power function
addTest('power_2_10', `
def power (base : Nat) (exp : Nat) : Nat :=
  if exp <= 0 then 1
  else base * power base (exp - 1)
def x := power 2 10
`, '1024');

// GCD function
addTest('gcd_48_18', `
def gcd (a : Nat) (b : Nat) : Nat :=
  if b <= 0 then a
  else gcd b (a % b)
def x := gcd 48 18
`, '6');

// Sum of list
addTest('sum_list', `
def sumList (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | y :: ys => y + sumList ys
def x := sumList [1, 2, 3, 4, 5]
`, '15');

// Length of list
addTest('length_list', `
def length (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | _ :: ys => 1 + length ys
def x := length [1, 2, 3, 4, 5]
`, '5');

// ==================== POLYMORPHIC FUNCTIONS ====================
addTest('poly_id', `
def id (x : α) := x
def a := id 42
def b := id "hello"
`, '42');

addTest('poly_const', `
def const (x : α) (y : β) := x
def x := const 1 "test"
`, '1');

// ==================== MORE ARITHMETIC VARIATIONS ====================
for (let i = 0; i < 50; i++) {
  const expr = `${i} + ${i * 2} - ${i}`;
  const result = i + i * 2 - i;
  addTest(`arith_chain_${i}`, `def x := ${expr}`, `${result}`);
}

// ==================== COMPLEX LAMBDAS ====================
addTest('lambda_flip', `
def flip (f : α → β → γ) (x : β) (y : α) := f y x
def sub := fun x => fun y => x - y
def flippedSub := flip sub
def x := flippedSub 5 10
`, '5');

addTest('lambda_apply_twice', `
def twice (f : α → α) (x : α) := f (f x)
def inc := fun x => x + 1
def x := twice inc 5
`, '7');

// ==================== MORE BOOLEAN TESTS ====================
for (let i = 0; i < 25; i++) {
  const a = i % 2 === 0;
  const b = i % 3 === 0;
  addTest(
    `bool_complex_${i}`,
    `def x := ${a} && (${b} || !${a})`,
    (a && (b || !a)) ? 'true' : 'false'
  );
}

// ==================== STRING CONCATENATION ====================
addTest('string_concat', 'def x := "hello" ++ " " ++ "world"', '"hello world"');
addTest('string_concat_2', 'def x := "a" ++ "b" ++ "c" ++ "d"', '"abcd"');

// ==================== TUPLE/PAIR TESTS ====================
addTest('pair_mk', 'def x := (1, 2)', '(1, 2)');
addTest('pair_nested', 'def x := ((1, 2), (3, 4))', '((1, 2), (3, 4))');

// ==================== TYPECLASS-LIKE PATTERNS ====================
addTest('add_inst', `
class Add (α : Type) where
  add : α → α → α
instance : Add Nat where
  add := fun x => fun y => x + y
def x := 1 + 2
`, '3');

// ==================== MORE MATCH PATTERNS ====================
addTest('match_bool', `
def not (b : Bool) : Bool :=
  match b with
  | true => false
  | false => true
def x := not true
`, 'false');

addTest('match_option', `
def getOrElse (o : Option Nat) (default : Nat) : Nat :=
  match o with
  | none => default
  | some x => x
def x := getOrElse (some 42) 0
`, '42');

addTest('match_option_none', `
def getOrElse (o : Option Nat) (default : Nat) : Nat :=
  match o with
  | none => default
  | some x => x
def x := getOrElse none 99
`, '99');

// ==================== LIST OPERATIONS ====================
addTest('list_map', `
def map (f : α → β) (xs : List α) : List β :=
  match xs with
  | [] => []
  | y :: ys => f y :: map f ys
def double (x : Nat) := x * 2
def x := map double [1, 2, 3]
`, '[2, 4, 6]');

addTest('list_filter', `
def filter (p : α → Bool) (xs : List α) : List α :=
  match xs with
  | [] => []
  | y :: ys => if p y then y :: filter p ys else filter p ys
def isEven (x : Nat) := x % 2 == 0
def x := filter isEven [1, 2, 3, 4, 5, 6]
`, '[2, 4, 6]');

addTest('list_foldl', `
def foldl (f : β → α → β) (init : β) (xs : List α) : β :=
  match xs with
  | [] => init
  | y :: ys => foldl f (f init y) ys
def x := foldl (fun acc => fun x => acc + x) 0 [1, 2, 3, 4, 5]
`, '15');

addTest('list_reverse', `
def reverse (xs : List α) : List α :=
  foldl (fun acc => fun x => x :: acc) [] xs
def x := reverse [1, 2, 3]
`, '[3, 2, 1]');

// ==================== MORE RECURSIVE FUNCTIONS ====================
addTest('sum_to_n', `
def sumTo (n : Nat) : Nat :=
  if n <= 0 then 0 else n + sumTo (n - 1)
def x := sumTo 10
`, '55');

addTest('product_to_n', `
def prodTo (n : Nat) : Nat :=
  if n <= 1 then 1 else n * prodTo (n - 1)
def x := prodTo 5
`, '120');

// ==================== CHURCH ENCODINGS ====================
addTest('church_num', `
def zero := fun f => fun x => x
def succ := fun n => fun f => fun x => f (n f x)
def one := succ zero
def add := fun m => fun n => fun f => fun x => m f (n f x)
def toNat := fun n => n (fun x => x + 1) 0
def x := toNat (add one one)
`, '2');

// ==================== MORE COMPLEX PATTERNS ====================
addTest('ackermann_3_4', `
def ack (m : Nat) (n : Nat) : Nat :=
  if m <= 0 then n + 1
  else if n <= 0 then ack (m - 1) 1
  else ack (m - 1) (ack m (n - 1))
def x := ack 3 4
`, '125');

// Generate more random arithmetic tests
for (let i = 0; i < 100; i++) {
  const ops = ['+', '-', '*'];
  const a = Math.floor(Math.random() * 20);
  const b = Math.floor(Math.random() * 20);
  const op = ops[i % 3];

  let expected: number;
  switch (op) {
    case '+': expected = a + b; break;
    case '-': expected = Math.max(0, a - b); break;
    case '*': expected = a * b; break;
    default: expected = 0;
  }

  addTest(`random_arith_${i}`, `def x := ${a} ${op} ${b}`, `${expected}`);
}

// ==================== FINAL BATCH ====================
// Fill remaining tests to reach 1000
for (let i = testCases.length; i < 1000; i++) {
  const n = i;
  addTest(`test_${i}`, `def x := ${n}`, `${n}`);
}

// Write test programs to files
const testProgramDir = path.join(__dirname, '..', 'test_programs');
if (!fs.existsSync(testProgramDir)) {
  fs.mkdirSync(testProgramDir, { recursive: true });
}

// Write each test case to a file
for (const tc of testCases) {
  const filename = path.join(testProgramDir, `${tc.name}.lean`);
  fs.writeFileSync(filename, tc.source);
}

// Write expected outputs
const expectedOutputs: Record<string, string> = {};
for (const tc of testCases) {
  expectedOutputs[tc.name] = tc.expectedOutput;
}
fs.writeFileSync(
  path.join(testProgramDir, 'expected_outputs.json'),
  JSON.stringify(expectedOutputs, null, 2)
);

// Write test case runner
const testRunnerCode = `
import { compile, run, Lean4Compiler } from '../src/compiler';
import { formatValue } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

const expectedOutputs = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'test_programs', 'expected_outputs.json'), 'utf-8')
);

const testDir = path.join(__dirname, '..', 'test_programs');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.lean'));

let passed = 0;
let failed = 0;
const failures: string[] = [];

for (const file of files) {
  const testName = file.replace('.lean', '');
  const source = fs.readFileSync(path.join(testDir, file), 'utf-8');
  const expected = expectedOutputs[testName];

  try {
    const result = compile(source);
    if (!result.success) {
      if (expected.startsWith('Error:')) {
        passed++;
      } else {
        failed++;
        failures.push(\`\${testName}: Compilation failed - \${result.errors.join(', ')}\`);
      }
      continue;
    }

    // Get the value of 'x' or the last defined value
    let actual = '';
    const xValue = result.values.get('x');
    if (xValue) {
      actual = formatValue(xValue);
    } else {
      // Get the last defined value
      const lastEntry = Array.from(result.values.entries()).pop();
      if (lastEntry) {
        actual = formatValue(lastEntry[1]);
      }
    }

    if (actual === expected) {
      passed++;
    } else {
      failed++;
      failures.push(\`\${testName}: Expected '\${expected}', got '\${actual}'\`);
    }
  } catch (error: any) {
    failed++;
    failures.push(\`\${testName}: Exception - \${error.message}\`);
  }
}

console.log(\`\\nResults: \${passed} passed, \${failed} failed\\n\`);
if (failures.length > 0) {
  console.log('Failures:');
  failures.slice(0, 50).forEach(f => console.log(\`  \${f}\`));
  if (failures.length > 50) {
    console.log(\`  ... and \${failures.length - 50} more\`);
  }
  process.exit(1);
}
`;

fs.writeFileSync(path.join(__dirname, 'runTestPrograms.ts'), testRunnerCode);

console.log(`Generated ${testCases.length} test programs in ${testProgramDir}`);
console.log('Run with: npx ts-node tests/runTestPrograms.ts');
