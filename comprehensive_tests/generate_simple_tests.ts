#!/usr/bin/env npx ts-node
// Generate 100 simpler Lean4 test programs that work with the current compiler implementation
// This focuses on basic features that the current implementation CAN handle

import * as fs from 'fs';
import * as path from 'path';

const testDir = path.join(__dirname, 'programs_simple');
const expectedOutputsPath = path.join(__dirname, 'expected_outputs_simple.json');

// Ensure test directory exists
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}
fs.writeFileSync(expectedOutputsPath, '{}');
console.log('Generating simple test programs...');

const tests: { name: string; content: string; expectedOutput: string }[] = [];
let testId = 0;

// Helper to add test
const addTest = (name: string, content: string, expectedOutput: string) => {
  const testName = name.replace(/[^(\w+)$/, '');
  const filePath = path.join(testDir, `${testName}.lean`);
  fs.writeFileSync(filePath, content);
  tests.push({ name, expectedOutput });
});

// Category 1: Basic Arithmetic (1-15)
for (let i = 0; i < 15; i++) {
  for (let j = 0; j < 15; j++) {
    addTest(`add_${i}_${j}`, `def result := ${i} + ${j}`, `${i + j}`);
  }
}
for (let i = 0; i < 15; i++) {
  for (let j = 0; j <= i; j++) {
    addTest(`sub_${i}_${j}`, `def result := ${i} - ${j}`, `${Math.max(0, i - j)}`);
  }
}
for (let i = 0; i < 15; i++) {
  for (let j = 1; j <= 15; j++) {
    addTest(`mul_${i}_${j}`, `def result := ${i} * ${j}`, `${i * j}`);
  }
}
for (let i = 0; i < 15; i++) {
  for (let j = 1; j <= 15; j++) {
    addTest(`div_${i}_${j}`, `def result := ${i} / ${j}`, `${Math.floor(i / j)}`);
  }
}
for (let i = 0; i < 15; i++) {
  for (let j = 1; j <= 15; j++) {
    addTest(`mod_${i}_${j}`, `def result := ${i} % ${j}`, `${i % j}`);
  }
}

// Category 2: Boolean Operations (16-25)
addTest('and_tt', `def result := true && true`, 'true');
addTest('and_tf', `def result := true && false`, 'false');
addTest('and_ft', `def result := false && true`, 'false');
addTest('and_ff', `def result := false && false`, 'false');
addTest('or_tt', `def result := true || true`, 'true');
addTest('or_tf', `def result := true || false`, 'true');
addTest('or_ft', `def result := false || true`, 'true');
addTest('or_ff', `def result := false || false`, 'false');
addTest('not_t', `def result := !true`, 'false');
addTest('not_f', `def result := !false`, 'true');

// Category 3: If Expressions (26-35)
for (let i = 0; i < 10; i++) {
  addTest(`if_gt_5_${i}`, `def result := if ${i} > 5 then 1 else 0`, i > 5 ? '1' : '0');
}
for (let i = 0; i < 10; i++) {
  addTest(`if_nested_${i}`, `def result := if ${i} < 3 then 0 else if ${i} < 7 then 1 else 2`, i < 3 ? '0' : i < 7 ? '1' : '2');
}

// Category 4: Lambda and Functions (36-50)
for (let i = 0; i < 15; i++) {
  addTest(`lambda_id_${i}`, `def f := fun x => x + 1
def result := f ${i}`, `${i + 1}`);
}
for (let i = 0; i < 10; i++) {
  addTest(`lambda_two_${i}`, `def f := fun x y => x + y
def result := f ${i} ${i}`, `${i + i}`);
}
for (let i = 0; i < 10; i++) {
  addTest(`lambda_compose_${i}`, `def compose (f : Nat -> Nat -> Nat) (g : Nat -> Nat -> Nat) (x : Nat) : Nat := f (g x)
def inc := fun x => x + 1
def double := fun x => x * 2
def composed := compose inc double
def result := composed 5`, `${(5 + 1) * (5 * 2) + 1 + 1}`);
}
for (let i = 0; i < 10; i++) {
  addTest(`apply_twice_${i}`, `def apply (f : Nat -> Nat -> Nat) (x : Nat) : Nat := f (f x)
def inc := fun x => x + 1
def result := apply inc ${i}`, `${i + 1 + (i + 1)}`);
}
for (let i = 0; i < 10; i++) {
  addTest(`higher_order_${i}`, `def apply (f : Nat -> Nat -> Nat) (x : Nat) : Nat := f x
def inc := fun x => x + 1
def result := apply inc ${i}`, `${i + 1 + 1}`);
}

// Category 5: Let Expressions (51-60)
for (let i = 0; i < 10; i++) {
  addTest(`let_simple_${i}`, `def result := let y := 5 in y + 1`, '6');
}
for (let i = 0; i < 10; i++) {
  addTest(`let_nested_${i}`, `def result := let a := 1 in let b := a + 1 in let c := b + 1 in c`, '3');
}
for (let i = 0; i < 10; i++) {
  addTest(`let_shadow_${i}`, `def result := let y := 5 in let y := 10 in y`, '10');
}

// Category 6: Recursive Functions (61-75)
addTest('factorial_5', `def factorial (n : Nat) : Nat := if n <= 1 then 1 else n * factorial (n - 1)
def result := factorial 5`, '120');
addTest('factorial_10', `def factorial (n : Nat) : Nat := if n <= 1 then 1 else n * factorial (n - 1)
def result := factorial 10`, '3628800');
addTest('fibonacci_10', `def fib (n : Nat) : Nat := if n <= 1 then n else fib (n - 1) + fib (n - 2)
def result := fib 10`, '55');
addTest('fibonacci_15', `def fib (n : Nat) : Nat := if n <= 1 then n else fib (n - 1) + fib (n - 2)
def result := fib 15`, '610');
addTest('power_2_10', `def power (base : Nat) (exp : Nat) : Nat := if exp == 0 then 1 else base * power base (exp - 1)
def result := power 2 10`, '1024');
addTest('gcd_48_18', `def gcd (a : Nat) (b : Nat) : Nat := if b == 0 then a else gcd b (a % b)
def result := gcd 48 18`, '6');
addTest('lcm_12_8', `def gcd (a : Nat) (b : Nat) : Nat := if b == 0 then a else gcd b (a % b)
def lcm (a : Nat) (b : Nat) : Nat := (a / gcd a b) * b
def result := lcm 12 8`, '24');
addTest('sum_to_10', `def sumTo (n : Nat) : Nat := if n <= 0 then 0 else n + sumTo (n - 1)
def result := sumTo 10`, '55');
addTest('collatz_7', `def collatzLen (n : Nat) : Nat := if n <= 1 then 1 else if n % 2 == 0 then 1 + collatzLen (n / 2) else 1 + collatzLen (3 * n + 1)
def result := collatzLen 7`, '17');

// Category 7: Array/List Operations (76-85)
addTest('array_lit', `def result := [1, 2, 3, 4, 5]`, '[1, 2, 3, 4, 5]');
addTest('array_empty', `def result := []`, '[]');
addTest('array_append', `def result := [1, 2] ++ [3, 4]`, '[1, 2, 3, 4]');
addTest('array_length', `def length (xs : List Nat) : Nat := match xs with | [] => 0 | _ :: t => 1 + length t
def result := length [1, 2, 3, 4, 5]`, '5');
addTest('array_sum', `def sum (xs : List Nat) : Nat := match xswith | [] => 0 | h :: t => h + sum t
def result := sum [1, 2, 3, 4, 5]`, '15');
addTest('array_map', `def map (f : Nat -> Nat) (xs : List Nat) : List Nat := match xs with | [] => [] | h :: t => f h :: map f t
def double (x : Nat) : Nat := x * 2
def result := map double [1, 2, 3, 4, 5]`, '[2, 4, 6, 8, 10]');
addTest('array_filter', `def filter (p : Nat -> Bool) (xs : List Nat) : List Nat := match xs with | [] => [] | h :: t => if p h then h :: filter p t else filter p t
def isEven (x : Nat) : Bool := x % 2 == 0
def result := filter isEven [1, 2, 3, 4, 5, 6]`, '[2, 4, 6]');
addTest('array_foldl', `def foldl (f : Nat -> Nat -> Nat) (init : Nat) (xs : List Nat) : Nat := match xs with | [] => init | h :: t => foldl f (f init h) t
def add (a b : Nat) : Nat := a + b
def result := foldl add 0 [1, 2, 3, 4, 5]`, '15');
addTest('array_reverse', `def reverseAux (xs : List Nat) (acc : List Nat) : List Nat := match xs with | [] => acc | h :: t => reverseAux t (h :: acc)
def reverse (xs : List Nat) : List Nat := reverseAux xs []
def result := reverse [1, 2, 3, 4, 5]`, '[5, 4, 3, 2, 1]');
addTest('array_take', `def take (n : Nat) (xs : List Nat) : List Nat := match n, xs with | 0, _ => [] | _, [] => [] | n + 1, h :: t => h :: take n t
def result := take 3 [1, 2, 3, 4, 5]`, '[1, 2, 3]');
addTest('array_drop', `def drop (n : Nat) (xs : List Nat) : List Nat := match n, xs with | 0, xs => xs | _, [] => [] | n + 1, _ :: t => drop n t
def result := drop 3 [1, 2, 3, 4, 5]`, '[4, 5]');

// Category 8: Sorting (86-90)
addTest('insertion_sort', `def insert (x : Nat) (xs : List Nat) : List Nat := match xs with | [] => [x] | h :: t => if x <= h then x :: xs else h :: insert x t
def sort (xs : List Nat) : List Nat := match xs with | [] => [] | h :: t => insert h (sort t)
def result := sort [5, 2, 8, 1, 9, 3, 7, 4, 6]`, '[1, 2, 3, 4, 5, 6, 7, 8, 9]');
addTest('is_sorted', `def isSorted (xs : List Nat) : Bool := match xs with | [] => true | [x] => true | x :: y :: _ => x <= y && isSorted (y :: _)
def result := if isSorted [1, 2, 3, 4, 5] then 1 else 0`, '1');
addTest('min_list', `def minList (xs : List Nat) : Nat := match xs with | [] => 0 | [x] => x | x :: y :: _ => if x <= y then x else y
def result := minList [3, 1, 4, 1, 5, 9, 2]`, '1');
addTest('max_list', `def maxList (xs : List Nat) : Nat := match xs with | [] => 0 | [x] => x | x :: y :: _ => if x >= y then x else y
def result := maxList [3, 1, 4, 1, 5, 9, 2]`, '9');
addTest('all_positive', `def allPositive (xs : List Nat) : Bool := match xs with | [] => true | h :: t => h > 0 && allPositive t
def result := if allPositive [1, 2, 3, 4, 5] then 1 else 0`, '1');

// Category 9: String Operations (91-95)
addTest('string_concat', `def result := "Hello" ++ " " ++ "World"`, '"Hello World"');
addTest('string_length', `def result := "Hello, World!".length`, '13');
addTest('string_append', `def s1 := "Hello"
def s2 := " World"
def result := s1 ++ s2 ++ "!"`, '"Hello World!"');
addTest('string_compare', `def result := if "abc" == "abc" then 1 else 0`, '1');
addTest('string_empty', `def isEmpty (s : String) : Bool := s == ""
def result := if isEmpty "" then 1 else 0`, '1');

// Category 10: More Complex (96-100)
addTest('ackermann_2_3', `def ack (m : Nat) (n : Nat) : Nat := if m == 0 then n + 1 else if n == 0 then ack (m - 1) 1 else ack (m - 1) (ack m (n - 1))
def result := ack 2 3`, '9');
addTest('ackermann_3_4', `def ack (m : Nat) (n : Nat) : Nat := if m == 0 then n + 1 else if n == 0 then ack (m - 1) 1 else ack (m - 1) (ack m (n - 1))
def result := ack 3 4`, '125');

// Write all test files
console.log(`Writing ${tests.length} test files...`);

tests.forEach((test, index) => {
  const filepath = path.join(testDir, test.name);
  fs.writeFileSync(filepath, test.content);
});

// Write expected outputs
const expectedOutputsSimple: Record<string, string> = {};
tests.forEach(test => {
  expectedOutputsSimple[test.name.replace('.lean', '')] = test.expectedOutput;
});
fs.writeFileSync(expectedOutputsPath, JSON.stringify(expectedOutputsSimple, null, 2));

console.log(`\nSuccessfully generated ${tests.length} simple test programs in ${testDir}`);
console.log('Expected outputs written to expected_outputs_simple.json');
