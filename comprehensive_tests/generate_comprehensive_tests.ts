#!/usr/bin/env npx ts-node
// Generate 100 comprehensive, complicated Lean4 test programs

import * as fs from 'fs';
import * as path from 'path';

const testDir = path.join(__dirname, 'programs');

// Ensure test directory exists
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Test categories
const tests: { name: string; content: string; expectedOutput: string }[] = [];

// Helper to add test
const addTest = (name: string, content: string, expectedOutput: string) => {
  tests.push({ name: `${tests.length.toString().padStart(3, '0')}_${name}.lean`, content, expectedOutput });
};

// ============================================================================
// Category 1: Advanced Arithmetic and Mathematical Functions (1-15)
// ============================================================================

addTest('ackermann_function', `
-- Ackermann function - a deeply recursive mathematical function
def ack : Nat -> Nat -> Nat
  | 0, n => n + 1
  | m + 1, 0 => ack m 1
  | m + 1, n + 1 => ack m (ack (m + 1) n)

def result := ack 3 4
`, '125');

addTest('fibonacci_memoized', `
-- Fibonacci with accumulator (tail-recursive style)
def fibAux : Nat -> Nat -> Nat -> Nat
  | 0, a, _ => a
  | n + 1, a, b => fibAux n b (a + b)

def fib (n : Nat) : Nat := fibAux n 0 1

def result := fib 20
`, '6765');

addTest('factorial_with_accumulator', `
-- Factorial with tail recursion
def factAux : Nat -> Nat -> Nat
  | 0, acc => acc
  | n + 1, acc => factAux n (acc * (n + 1))

def factorial (n : Nat) : Nat := factAux n 1

def result := factorial 10
`, '3628800');

addTest('collatz_sequence_length', `
-- Collatz conjecture sequence length
def collatzLen (n : Nat) : Nat :=
  if n <= 1 then 1
  else if n % 2 == 0 then 1 + collatzLen (n / 2)
  else 1 + collatzLen (3 * n + 1)

def result := collatzLen 27
`, '112');

addTest('gcd_euclidean', `
-- Euclidean GCD algorithm
def gcd (a : Nat) (b : Nat) : Nat :=
  if b == 0 then a
  else gcd b (a % b)

def result := gcd 252 105
`, '21');

addTest('lcm_computation', `
-- LCM using GCD
def gcd (a : Nat) (b : Nat) : Nat :=
  if b == 0 then a else gcd b (a % b)

def lcm (a : Nat) (b : Nat) : Nat :=
  if a == 0 || b == 0 then 0
  else (a / gcd a b) * b

def result := lcm 21 6
`, '42');

addTest('power_function_fast', `
-- Fast exponentiation by squaring
def power (base : Nat) (exp : Nat) : Nat :=
  if exp == 0 then 1
  else if exp % 2 == 0 then
    let half := power base (exp / 2)
    half * half
  else
    base * power base (exp - 1)

def result := power 2 15
`, '32768');

addTest('is_prime', `
-- Simple primality test
def divides (d : Nat) (n : Nat) : Bool :=
  if d == 0 then false
  else n % d == 0

def isPrimeAux (n : Nat) (d : Nat) : Bool :=
  if d * d > n then true
  else if divides d n then false
  else isPrimeAux n (d + 1)

def isPrime (n : Nat) : Bool :=
  if n < 2 then false
  else isPrimeAux n 2

def result := if isPrime 97 then 1 else 0
`, '1');

addTest('nth_prime', `
-- Find the nth prime number
def divides (d : Nat) (n : Nat) : Bool :=
  if d == 0 then false else n % d == 0

def isPrimeAux (n : Nat) (d : Nat) : Bool :=
  if d * d > n then true
  else if divides d n then false
  else isPrimeAux n (d + 1)

def isPrime (n : Nat) : Bool :=
  if n < 2 then false else isPrimeAux n 2

def nextPrime (n : Nat) : Nat :=
  if isPrime (n + 1) then n + 1
  else nextPrime (n + 1)

def nthPrimeAux (count : Nat) (current : Nat) : Nat :=
  if count == 0 then current
  else nthPrimeAux (count - 1) (nextPrime current)

def nthPrime (n : Nat) : Nat := nthPrimeAux n 1

def result := nthPrime 10
`, '29');

addTest('digit_sum', `
-- Sum of digits of a number
def digitSum (n : Nat) : Nat :=
  if n == 0 then 0
  else (n % 10) + digitSum (n / 10)

def result := digitSum 12345
`, '15');

addTest('reverse_digits', `
-- Reverse the digits of a number
def reverseAux (n : Nat) (acc : Nat) : Nat :=
  if n == 0 then acc
  else reverseAux (n / 10) (acc * 10 + n % 10)

def reverse (n : Nat) : Nat := reverseAux n 0

def result := reverse 12345
`, '54321');

addTest('is_palindrome', `
-- Check if a number is a palindrome
def reverseAux (n : Nat) (acc : Nat) : Nat :=
  if n == 0 then acc
  else reverseAux (n / 10) (acc * 10 + n % 10)

def isPalindrome (n : Nat) : Bool :=
  n == reverseAux n 0

def result := if isPalindrome 12321 then 1 else 0
`, '1');

addTest('binomial_coefficient', `
-- Binomial coefficient (n choose k)
def fact (n : Nat) : Nat :=
  if n <= 1 then 1 else n * fact (n - 1)

def choose (n : Nat) (k : Nat) : Nat :=
  if k > n then 0
  else fact n / (fact k * fact (n - k))

def result := choose 10 4
`, '210');

addTest('catalan_number', `
-- nth Catalan number
def fact (n : Nat) : Nat :=
  if n <= 1 then 1 else n * fact (n - 1)

def choose (n : Nat) (k : Nat) : Nat :=
  if k > n then 0
  else fact n / (fact k * fact (n - k))

def catalan (n : Nat) : Nat :=
  choose (2 * n) n / (n + 1)

def result := catalan 7
`, '429');

addTest('tribonacci', `
-- Tribonacci sequence
def trib : Nat -> Nat
  | 0 => 0
  | 1 => 0
  | 2 => 1
  | n + 1 => trib n + trib (n - 1) + trib (n - 2)

def result := trib 15
`, '927');

// ============================================================================
// Category 2: List and Array Operations (16-30)
// ============================================================================

addTest('list_length', `
-- Length of a list
def length (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | _ :: tail => 1 + length tail

def mylist := [1, 2, 3, 4, 5]
def result := length mylist
`, '5');

addTest('list_sum', `
-- Sum of a list
def sum (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | head :: tail => head + sum tail

def result := sum [1, 2, 3, 4, 5]
`, '15');

addTest('list_product', `
-- Product of a list
def product (xs : List Nat) : Nat :=
  match xs with
  | [] => 1
  | head :: tail => head * product tail

def result := product [1, 2, 3, 4, 5]
`, '120');

addTest('list_reverse', `
-- Reverse a list
def reverseAux (xs : List Nat) (acc : List Nat) : List Nat :=
  match xs with
  | [] => acc
  | head :: tail => reverseAux tail (head :: acc)

def reverse (xs : List Nat) : List Nat := reverseAux xs []

def result := reverse [1, 2, 3, 4, 5]
`, '[5, 4, 3, 2, 1]');

addTest('list_map', `
-- Map a function over a list
def map (f : Nat -> Nat) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail => f head :: map f tail

def double (x : Nat) : Nat := x * 2

def result := map double [1, 2, 3, 4, 5]
`, '[2, 4, 6, 8, 10]');

addTest('list_filter', `
-- Filter a list
def filter (p : Nat -> Bool) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail =>
    if p head then head :: filter p tail
    else filter p tail

def isEven (x : Nat) : Bool := x % 2 == 0

def result := filter isEven [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
`, '[2, 4, 6, 8, 10]');

addTest('list_fold_left', `
-- Left fold
def foldl (f : Nat -> Nat -> Nat) (init : Nat) (xs : List Nat) : Nat :=
  match xs with
  | [] => init
  | head :: tail => foldl f (f init head) tail

def result := foldl (fun acc x => acc + x) 0 [1, 2, 3, 4, 5]
`, '15');

addTest('list_fold_right', `
-- Right fold
def foldr (f : Nat -> Nat -> Nat) (init : Nat) (xs : List Nat) : Nat :=
  match xs with
  | [] => init
  | head :: tail => f head (foldr f init tail)

def result := foldr (fun x acc => x + acc) 0 [1, 2, 3, 4, 5]
`, '15');

addTest('list_append', `
-- Append two lists
def append (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs with
  | [] => ys
  | head :: tail => head :: append tail ys

def result := append [1, 2, 3] [4, 5, 6]
`, '[1, 2, 3, 4, 5, 6]');

addTest('list_concat', `
-- Concatenate a list of lists
def concat (xss : List (List Nat)) : List Nat :=
  match xss with
  | [] => []
  | head :: tail => append head (concat tail)
where
  append (xs : List Nat) (ys : List Nat) : List Nat :=
    match xs with
    | [] => ys
    | h :: t => h :: append t ys

def result := concat [[1, 2], [3, 4], [5, 6]]
`, '[1, 2, 3, 4, 5, 6]');

addTest('list_take', `
-- Take first n elements
def take (n : Nat) (xs : List Nat) : List Nat :=
  match n, xs with
  | 0, _ => []
  | _, [] => []
  | n + 1, head :: tail => head :: take n tail

def result := take 3 [1, 2, 3, 4, 5]
`, '[1, 2, 3]');

addTest('list_drop', `
-- Drop first n elements
def drop (n : Nat) (xs : List Nat) : List Nat :=
  match n, xs with
  | 0, xs => xs
  | _, [] => []
  | n + 1, _ :: tail => drop n tail

def result := drop 3 [1, 2, 3, 4, 5]
`, '[4, 5]');

addTest('list_nth', `
-- Get nth element (0-indexed)
def nth (n : Nat) (xs : List Nat) : Nat :=
  match n, xs with
  | 0, head :: _ => head
  | n + 1, _ :: tail => nth n tail
  | _, [] => 0

def result := nth 2 [10, 20, 30, 40, 50]
`, '30');

addTest('list_replicate', `
-- Replicate element n times
def replicate (n : Nat) (x : Nat) : List Nat :=
  match n with
  | 0 => []
  | n + 1 => x :: replicate n x

def result := replicate 5 42
`, '[42, 42, 42, 42, 42]');

addTest('list_range', `
-- Generate range [0, n)
def range (n : Nat) : List Nat :=
  let aux : Nat -> List Nat -> List Nat
    | 0, acc => acc
    | n + 1, acc => aux n (n :: acc)
  aux n []

def result := range 5
`, '[0, 1, 2, 3, 4]');

// ============================================================================
// Category 3: Sorting Algorithms (31-40)
// ============================================================================

addTest('insertion_sort', `
-- Insertion sort
def insert (x : Nat) (xs : List Nat) : List Nat :=
  match xs with
  | [] => [x]
  | head :: tail =>
    if x <= head then x :: xs
    else head :: insert x tail

def insertionSort (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail => insert head (insertionSort tail)

def result := insertionSort [5, 2, 8, 1, 9, 3, 7, 4, 6]
`, '[1, 2, 3, 4, 5, 6, 7, 8, 9]');

addTest('merge_sort', `
-- Merge sort
def merge (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs, ys with
  | [], ys => ys
  | xs, [] => xs
  | x :: xs', y :: ys' =>
    if x <= y then x :: merge xs' ys
    else y :: merge xs ys'

def split (xs : List Nat) : (List Nat × List Nat) :=
  match xs with
  | [] => ([], [])
  | [x] => ([x], [])
  | x :: y :: rest =>
    let (left, right) := split rest
    (x :: left, y :: right)

def mergeSort (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | [x] => [x]
  | _ =>
    let (left, right) := split xs
    merge (mergeSort left) (mergeSort right)

def result := mergeSort [5, 2, 8, 1, 9, 3, 7, 4, 6]
`, '[1, 2, 3, 4, 5, 6, 7, 8, 9]');

addTest('quicksort', `
-- Quicksort
def filter (p : Nat -> Bool) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail =>
    if p head then head :: filter p tail
    else filter p tail

def append (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs with
  | [] => ys
  | head :: tail => head :: append tail ys

def quicksort (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | pivot :: rest =>
    let left := filter (fun x => x < pivot) rest
    let right := filter (fun x => x >= pivot) rest
    append (quicksort left) (pivot :: quicksort right)

def result := quicksort [5, 2, 8, 1, 9, 3, 7, 4, 6]
`, '[1, 2, 3, 4, 5, 6, 7, 8, 9]');

addTest('bubble_sort', `
-- Bubble sort (single pass)
def bubble (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | [x] => [x]
  | x :: y :: rest =>
    if x <= y then x :: bubble (y :: rest)
    else y :: bubble (x :: rest)

def bubbleSort (n : Nat) (xs : List Nat) : List Nat :=
  match n with
  | 0 => xs
  | n + 1 => bubbleSort n (bubble xs)

def result := bubbleSort 10 [5, 2, 8, 1, 9, 3, 7, 4, 6]
`, '[1, 2, 3, 4, 5, 6, 7, 8, 9]');

addTest('selection_sort', `
-- Selection sort
def minimum (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | [x] => x
  | x :: xs' =>
    let m := minimum xs'
    if x <= m then x else m

def remove (x : Nat) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | head :: tail =>
    if head == x then tail
    else head :: remove x tail

def selectionSort (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | _ =>
    let m := minimum xs
    m :: selectionSort (remove m xs)

def result := selectionSort [5, 2, 8, 1, 9, 3, 7, 4, 6]
`, '[1, 2, 3, 4, 5, 6, 7, 8, 9]');

addTest('is_sorted', `
-- Check if a list is sorted
def isSorted (xs : List Nat) : Bool :=
  match xs with
  | [] => true
  | [_] => true
  | x :: y :: rest =>
    if x <= y then isSorted (y :: rest)
    else false

def result := if isSorted [1, 2, 3, 4, 5] then 1 else 0
`, '1');

addTest('count_inversions', `
-- Count inversions in a list
def countInv (x : Nat) (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | head :: tail =>
    if x > head then 1 + countInv x tail
    else countInv x tail

def countInversions (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | head :: tail => countInv head tail + countInversions tail

def result := countInversions [3, 1, 4, 1, 5, 9, 2, 6]
`, '10');

addTest('find_max', `
-- Find maximum element
def max (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | [x] => x
  | x :: xs' =>
    let m := max xs'
    if x >= m then x else m

def result := max [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
`, '9');

addTest('find_min', `
-- Find minimum element
def min (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | [x] => x
  | x :: xs' =>
    let m := min xs'
    if x <= m then x else m

def result := min [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
`, '1');

addTest('remove_duplicates', `
-- Remove duplicates from sorted list
def dedup (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | [x] => [x]
  | x :: y :: rest =>
    if x == y then dedup (y :: rest)
    else x :: dedup (y :: rest)

def result := dedup [1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 4, 5]
`, '[1, 2, 3, 4, 5]');

// ============================================================================
// Category 4: Tree Data Structures (41-50)
// ============================================================================

addTest('tree_size', `
-- Binary tree size
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeSize (t : Tree Nat) : Nat :=
  match t with
  | Tree.leaf => 0
  | Tree.node _ left right => 1 + treeSize left + treeSize right

def myTree := Tree.node 1 (Tree.node 2 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def result := treeSize myTree
`, '3');

addTest('tree_height', `
-- Binary tree height
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeHeight (t : Tree Nat) : Nat :=
  match t with
  | Tree.leaf => 0
  | Tree.node _ left right =>
    let lh := treeHeight left
    let rh := treeHeight right
    1 + (if lh >= rh then lh else rh)

def myTree := Tree.node 1 (Tree.node 2 (Tree.node 4 Tree.leaf Tree.leaf) Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def result := treeHeight myTree
`, '3');

addTest('tree_sum', `
-- Sum of all values in a tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeSum (t : Tree Nat) : Nat :=
  match t with
  | Tree.leaf => 0
  | Tree.node v left right => v + treeSum left + treeSum right

def myTree := Tree.node 10 (Tree.node 5 Tree.leaf Tree.leaf) (Tree.node 15 (Tree.node 3 Tree.leaf Tree.leaf) Tree.leaf)
def result := treeSum myTree
`, '33');

addTest('tree_flatten', `
-- Flatten tree to list (in-order traversal)
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def append (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs with
  | [] => ys
  | h :: t => h :: append t ys

def treeFlatten (t : Tree Nat) : List Nat :=
  match t with
  | Tree.leaf => []
  | Tree.node v left right =>
    append (treeFlatten left) (v :: treeFlatten right)

def myTree := Tree.node 2 (Tree.node 1 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def result := treeFlatten myTree
`, '[1, 2, 3]');

addTest('tree_map', `
-- Map a function over a tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeMap (f : Nat -> Nat) (t : Tree Nat) : Tree Nat :=
  match t with
  | Tree.leaf => Tree.leaf
  | Tree.node v left right => Tree.node (f v) (treeMap f left) (treeMap f right)

def double (x : Nat) : Nat := x * 2

def myTree := Tree.node 1 (Tree.node 2 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def resultTree := treeMap double myTree
`, 'Tree.node 2 (Tree.node 4 Tree.leaf Tree.leaf) (Tree.node 6 Tree.leaf Tree.leaf)');

addTest('tree_member', `
-- Check if element is in tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeMember (x : Nat) (t : Tree Nat) : Bool :=
  match t with
  | Tree.leaf => false
  | Tree.node v left right =>
    if v == x then true
    else treeMember x left || treeMember x right

def myTree := Tree.node 5 (Tree.node 3 (Tree.node 1 Tree.leaf Tree.leaf) (Tree.node 4 Tree.leaf Tree.leaf)) (Tree.node 8 Tree.leaf Tree.leaf)
def result := if treeMember 4 myTree then 1 else 0
`, '1');

addTest('tree_is_bst', `
-- Check if tree is a binary search tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def isBstAux (t : Tree Nat) (lo : Nat) (hi : Nat) : Bool :=
  match t with
  | Tree.leaf => true
  | Tree.node v left right =>
    v >= lo && v <= hi && isBstAux left lo (v - 1) && isBstAux right (v + 1) hi

def isBst (t : Tree Nat) : Bool := isBstAux t 0 1000

def goodTree := Tree.node 5 (Tree.node 3 Tree.leaf Tree.leaf) (Tree.node 7 Tree.leaf Tree.leaf)
def result := if isBst goodTree then 1 else 0
`, '1');

addTest('tree_mirror', `
-- Mirror a tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def treeMirror (t : Tree Nat) : Tree Nat :=
  match t with
  | Tree.leaf => Tree.leaf
  | Tree.node v left right => Tree.node v (treeMirror right) (treeMirror left)

def myTree := Tree.node 1 (Tree.node 2 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf Tree.leaf)
def result := treeMirror myTree
`, 'Tree.node 1 (Tree.node 3 Tree.leaf Tree.leaf) (Tree.node 2 Tree.leaf Tree.leaf)');

addTest('tree_count_leaves', `
-- Count leaves in a tree
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def countLeaves (t : Tree Nat) : Nat :=
  match t with
  | Tree.leaf => 1
  | Tree.node _ left right => countLeaves left + countLeaves right

def myTree := Tree.node 1 (Tree.node 2 Tree.leaf Tree.leaf) (Tree.node 3 Tree.leaf (Tree.node 4 Tree.leaf Tree.leaf))
def result := countLeaves myTree
`, '3');

addTest('tree_level_order', `
-- Get elements at a specific level
inductive Tree (α : Type) where
  | leaf : Tree α
  | node : α -> Tree α -> Tree α -> Tree α

def append (xs : List Nat) (ys : List Nat) : List Nat :=
  match xs with
  | [] => ys
  | h :: t => h :: append t ys

def getLevel (t : Tree Nat) (level : Nat) : List Nat :=
  match t, level with
  | Tree.leaf, _ => []
  | Tree.node v _ _, 0 => [v]
  | Tree.node _ left right, n + 1 =>
    append (getLevel left n) (getLevel right n)

def myTree := Tree.node 1 (Tree.node 2 (Tree.node 4 Tree.leaf Tree.leaf) (Tree.node 5 Tree.leaf Tree.leaf)) (Tree.node 3 Tree.leaf Tree.leaf)
def result := getLevel myTree 2
`, '[4, 5]');

// ============================================================================
// Category 5: Higher-Order Functions and Composition (51-60)
// ============================================================================

addTest('function_composition', `
-- Function composition
def compose (f : Nat -> Nat) (g : Nat -> Nat) (x : Nat) : Nat :=
  f (g x)

def double (x : Nat) : Nat := x * 2
def inc (x : Nat) : Nat := x + 1

def doubleThenInc := compose inc double
def result := doubleThenInc 5
`, '11');

addTest('curry_uncurry', `
-- Curry and uncurry
def curry (f : Nat × Nat -> Nat) (x : Nat) (y : Nat) : Nat :=
  f (x, y)

def uncurry (f : Nat -> Nat -> Nat) (p : Nat × Nat) : Nat :=
  f p.1 p.2

def addPair (p : Nat × Nat) : Nat := p.1 + p.2
def addCurried := curry addPair

def result := addCurried 3 4
`, '7');

addTest('flip_function', `
-- Flip function arguments
def flip (f : Nat -> Nat -> Nat) (y : Nat) (x : Nat) : Nat :=
  f x y

def sub (x : Nat) (y : Nat) : Nat := x - y
def flippedSub := flip sub

def result := flippedSub 3 10
`, '7');

addTest('const_function', `
-- Constant function
def const (x : Nat) (_ : Nat) : Nat := x

def always42 := const 42
def result := always42 100
`, '42');

addTest('apply_function', `
-- Apply function
def apply (f : Nat -> Nat) (x : Nat) : Nat := f x

def double (x : Nat) : Nat := x * 2
def result := apply double 21
`, '42');

addTest('identity_function', `
-- Identity function
def id (x : Nat) : Nat := x

def result := id 42
`, '42');

addTest('church_numerals', `
-- Church numerals
def churchZero (f : Nat -> Nat) (x : Nat) : Nat := x

def churchSucc (n : (Nat -> Nat) -> Nat -> Nat) (f : Nat -> Nat) (x : Nat) : Nat :=
  f (n f x)

def churchAdd (m n : (Nat -> Nat) -> Nat -> Nat) (f : Nat -> Nat) (x : Nat) : Nat :=
  m f (n f x)

def churchMul (m n : (Nat -> Nat) -> Nat -> Nat) (f : Nat -> Nat) (x : Nat) : Nat :=
  m (n f) x

def toNat (n : (Nat -> Nat) -> Nat -> Nat) : Nat :=
  n (fun x => x + 1) 0

def one := churchSucc churchZero
def two := churchSucc one
def three := churchSucc two

def six := churchMul two three
def result := toNat six
`, '6');

addTest('y_combinator_simulation', `
-- Simulated Y combinator using recursion
def fix (f : (Nat -> Nat) -> Nat -> Nat) (x : Nat) : Nat :=
  f (fix f) x

def factGen (rec : Nat -> Nat) (n : Nat) : Nat :=
  if n <= 1 then 1 else n * rec (n - 1)

def factorial := fix factGen

def result := factorial 5
`, '120');

addTest('pipeline_operator', `
-- Pipeline-style function application
def pipe (x : Nat) (f : Nat -> Nat) : Nat := f x

def double (x : Nat) : Nat := x * 2
def inc (x : Nat) : Nat := x + 1
def square (x : Nat) : Nat := x * x

def result := 5 |> square |> double |> inc
where
  (|>) (x : Nat) (f : Nat -> Nat) : Nat := f x
`, '51');

addTest(' Kleisli_composition', `
-- Kleisli composition for Option
inductive Option (α : Type) where
  | none : Option α
  | some : α -> Option α

def optionBind (x : Option Nat) (f : Nat -> Option Nat) : Option Nat :=
  match x with
  | Option.none => Option.none
  | Option.some v => f v

def safeDiv (x : Nat) (y : Nat) : Option Nat :=
  if y == 0 then Option.none else Option.some (x / y)

def kleisliCompose (f : Nat -> Option Nat) (g : Nat -> Option Nat) (x : Nat) : Option Nat :=
  match f x with
  | Option.none => Option.none
  | Option.some v => g v

def divBy2 := safeDiv 100
def divBy5 := safeDiv 20

def composed := kleisliCompose divBy2 divBy5
def result := match composed 2 with
  | Option.none => 0
  | Option.some v => v
`, '2');

// ============================================================================
// Category 6: Inductive Types and Pattern Matching (61-70)
// ============================================================================

addTest('peano_arithmetic', `
-- Peano natural numbers
inductive Peano where
  | zero : Peano
  | succ : Peano -> Peano

def peanoToInt : Peano -> Nat
  | Peano.zero => 0
  | Peano.succ n => 1 + peanoToInt n

def peanoAdd : Peano -> Peano -> Peano
  | Peano.zero, n => n
  | Peano.succ m, n => Peano.succ (peanoAdd m n)

def two := Peano.succ (Peano.succ Peano.zero)
def three := Peano.succ (Peano.succ (Peano.succ Peano.zero))

def result := peanoToInt (peanoAdd two three)
`, '5');

addTest('option_operations', `
-- Option type operations
inductive Option (α : Type) where
  | none : Option α
  | some : α -> Option α

def optionMap (f : Nat -> Nat) (o : Option Nat) : Option Nat :=
  match o with
  | Option.none => Option.none
  | Option.some v => Option.some (f v)

def optionGetOrElse (o : Option Nat) (default : Nat) : Nat :=
  match o with
  | Option.none => default
  | Option.some v => v

def double (x : Nat) : Nat := x * 2

def someVal := Option.some 21
def result := optionGetOrElse (optionMap double someVal) 0
`, '42');

addTest('either_type', `
-- Either type (Sum type)
inductive Either (α : Type) (β : Type) where
  | left : α -> Either α β
  | right : β -> Either α β

def eitherMap (f : Nat -> Nat) (e : Either Nat Nat) : Either Nat Nat :=
  match e with
  | Either.left v => Either.left (f v)
  | Either.right v => Either.right (f v)

def eitherFold (e : Either Nat Nat) : Nat :=
  match e with
  | Either.left v => v
  | Either.right v => v * 2

def myEither := Either.right 21
def result := eitherFold (eitherMap (fun x => x + 1) myEither)
`, '44');

addTest('pair_operations', `
-- Pair (Tuple) operations
def fst (p : Nat × Nat) : Nat := p.1
def snd (p : Nat × Nat) : Nat := p.2

def swap (p : Nat × Nat) : Nat × Nat := (p.2, p.1)
def pairMap (f : Nat -> Nat) (p : Nat × Nat) : Nat × Nat := (f p.1, f p.2)

def myPair := (10, 20)
def result := fst (swap (pairMap (fun x => x * 2) myPair))
`, '40');

addTest('list_pattern_matching', `
-- Complex list pattern matching
def describeList (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | [x] => x
  | [x, y] => x + y
  | x :: y :: z :: _ => x + y + z

def result := describeList [1, 2, 3, 4, 5]
`, '6');

addTest('nested_pattern_matching', `
-- Nested pattern matching
def matchNested (p : Nat × (List Nat)) : Nat :=
  match p with
  | (0, []) => 0
  | (0, x :: _) => x
  | (n, []) => n
  | (n, x :: xs) => n + x + matchNested (n - 1, xs)

def result := matchNested (3, [1, 2, 3])
`, '9');

addTest('as_patterns', `
-- As-patterns
def headAndTail (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | h :: t => h + match t with
    | [] => 0
    | h2 :: _ => h2

def result := headAndTail [10, 20, 30]
`, '30');

addTest('view_patterns', `
-- Simulated view patterns using helper functions
def isEven (n : Nat) : Bool := n % 2 == 0

def classify (n : Nat) : Nat :=
  if isEven n then
    if n == 0 then 0 else 1
  else
    if n == 1 then 2 else 3

def result := classify 42
`, '1');

addTest('dependent_pattern', `
-- Pattern matching with dependent types (simplified)
inductive Vect (α : Type) : Nat -> Type where
  | nil : Vect α 0
  | cons : α -> Vect α n -> Vect α (n + 1)

def vectLength (v : Vect Nat n) : Nat := n

def myVect := Vect.cons 1 (Vect.cons 2 (Vect.cons 3 Vect.nil))
def result := vectLength myVect
`, '3');

addTest('gadt_pattern', `
-- GADT-like pattern matching
inductive Expr : Type -> Type where
  | nat : Nat -> Expr Nat
  | bool : Bool -> Expr Bool
  | add : Expr Nat -> Expr Nat -> Expr Nat
  | if_ : Expr Bool -> Expr Nat -> Expr Nat -> Expr Nat

def eval : Expr t -> Nat
  | Expr.nat n => n
  | Expr.add e1 e2 => eval e1 + eval e2
  | Expr.if_ c e1 e2 => match c with
    | Expr.bool true => eval e1
    | Expr.bool false => eval e2
    | _ => 0
  | _ => 0

def myExpr := Expr.if_ (Expr.bool true) (Expr.add (Expr.nat 10) (Expr.nat 5)) (Expr.nat 0)
def result := eval myExpr
`, '15');

// ============================================================================
// Category 7: Propositions and Proofs (71-80)
// ============================================================================

addTest('and_proposition', `
-- Conjunction
inductive And (p : Prop) (q : Prop) : Prop where
  | intro : p -> q -> And p q

def andElimLeft (h : And true true) : Bool := true
def result := if andElimLeft And.intro then 1 else 0
`, '1');

addTest('or_proposition', `
-- Disjunction
inductive Or (p : Prop) (q : Prop) : Prop where
  | inl : p -> Or p q
  | inr : q -> Or p q

def orElim (h : Or true false) : Bool :=
  match h with
  | Or.inl _ => true
  | Or.inr _ => false

def result := if orElim Or.inl then 1 else 0
`, '1');

addTest('exists_proposition', `
-- Existential
inductive Exists (p : Nat -> Prop) : Prop where
  | intro : (x : Nat) -> p x -> Exists p

def existsNat := Exists.intro 42
def result := 42
`, '42');

addTest('equality_proof', `
-- Equality
inductive Eq (a : Nat) : Nat -> Prop where
  | refl : Eq a a

def eqRefl : Eq 5 5 := Eq.refl
def result := 5
`, '5');

addTest('natural_number_properties', `
-- Properties of natural numbers
def addZero (n : Nat) : Nat := n + 0
def addSucc (n m : Nat) : Nat := n + (m + 1)

def zeroAdd (n : Nat) : Nat := 0 + n

def result := addZero 5 + zeroAdd 3
`, '8');

addTest('commutativity_proof', `
-- Commutativity of addition (computational)
def addComm (a b : Nat) : Nat := a + b
def addComm' (a b : Nat) : Nat := b + a

def checkComm (a b : Nat) : Bool :=
  addComm a b == addComm' a b

def result := if checkComm 5 3 then 1 else 0
`, '1');

addTest('associativity_proof', `
-- Associativity of addition (computational)
def addAssoc (a b c : Nat) : Nat := (a + b) + c
def addAssoc' (a b c : Nat) : Nat := a + (b + c)

def checkAssoc (a b c : Nat) : Bool :=
  addAssoc a b c == addAssoc' a b c

def result := if checkAssoc 1 2 3 then 1 else 0
`, '1');

addTest('transitivity_proof', `
-- Transitivity of less-than (computational)
def checkTrans (a b c : Nat) : Bool :=
  if a < b && b < c then a < c
  else true

def result := if checkTrans 1 2 3 then 1 else 0
`, '1');

addTest('induction_principle', `
-- Simulated induction
def sumTo : Nat -> Nat
  | 0 => 0
  | n + 1 => (n + 1) + sumTo n

-- sumTo n = n * (n + 1) / 2
def checkFormula (n : Nat) : Bool :=
  sumTo n == n * (n + 1) / 2

def result := if checkFormula 10 then 1 else 0
`, '1');

addTest('decidable_propositions', `
-- Decidable propositions
def isEven (n : Nat) : Bool := n % 2 == 0
def isOdd (n : Nat) : Bool := !isEven n

def evenOrOdd (n : Nat) : Bool :=
  isEven n || isOdd n

def result := if evenOrOdd 7 then 1 else 0
`, '1');

// ============================================================================
// Category 8: Type Classes and Polymorphism (81-88)
// ============================================================================

addTest('monoid_operations', `
-- Monoid type class (simulated)
def natAdd (a b : Nat) : Nat := a + b
def natZero : Nat := 0

def natMul (a b : Nat) : Nat := a * b
def natOne : Nat := 1

def sumList := List.foldl natAdd natZero
def prodList := List.foldl natMul natOne

def result := sumList [1, 2, 3, 4, 5]
`, '15');

addTest('functor_operations', `
-- Functor operations (simulated)
def mapOption (f : Nat -> Nat) (o : Option Nat) : Option Nat :=
  match o with
  | Option.none => Option.none
  | Option.some v => Option.some (f v)

def mapList (f : Nat -> Nat) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | h :: t => f h :: mapList f t

def double (x : Nat) : Nat := x * 2

def result := match mapOption double (Option.some 21) with
  | Option.none => 0
  | Option.some v => v
`, '42');

addTest('applicative_operations', `
-- Applicative operations (simulated)
def pureOption (x : Nat) : Option Nat := Option.some x

def apOption (f : Option (Nat -> Nat)) (x : Option Nat) : Option Nat :=
  match f, x with
  | Option.some g, Option.some v => Option.some (g v)
  | _, _ => Option.none

def double (x : Nat) : Nat := x * 2

def result := match apOption (pureOption double) (pureOption 21) with
  | Option.none => 0
  | Option.some v => v
`, '42');

addTest('monad_operations', `
-- Monad operations (simulated)
def pureOption (x : Nat) : Option Nat := Option.some x

def bindOption (x : Option Nat) (f : Nat -> Option Nat) : Option Nat :=
  match x with
  | Option.none => Option.none
  | Option.some v => f v

def safeDiv (x : Nat) (y : Nat) : Option Nat :=
  if y == 0 then Option.none else Option.some (x / y)

def computation := bindOption (safeDiv 100 2) (fun x => safeDiv x 5)

def result := match computation with
  | Option.none => 0
  | Option.some v => v
`, '10');

addTest('semigroup_operations', `
-- Semigroup operations
def stringAppend (s1 : String) (s2 : String) : String :=
  s1 ++ s2

def concatStrings (xs : List String) : String :=
  match xs with
  | [] => ""
  | h :: t => stringAppend h (concatStrings t)

def result := concatStrings ["Hello", ", ", "World", "!"]
`, '"Hello, World!"');

addTest('foldable_operations', `
-- Foldable operations
def foldLeft (f : Nat -> Nat -> Nat) (init : Nat) (xs : List Nat) : Nat :=
  match xs with
  | [] => init
  | h :: t => foldLeft f (f init h) t

def sumList := foldLeft (fun a b => a + b) 0
def prodList := foldLeft (fun a b => a * b) 1

def result := sumList [1, 2, 3, 4, 5] + prodList [1, 2, 3]
`, '21');

addTest('traversable_operations', `
-- Traversable operations
def traverseOption (f : Nat -> Option Nat) (xs : List Nat) : Option (List Nat) :=
  match xs with
  | [] => Option.some []
  | h :: t =>
    match f h, traverseOption f t with
    | Option.some v, Option.some vs => Option.some (v :: vs)
    | _, _ => Option.none

def safeHalf (x : Nat) : Option Nat :=
  if x % 2 == 0 then Option.some (x / 2) else Option.none

def result := match traverseOption safeHalf [2, 4, 6, 8] with
  | Option.none => 0
  | Option.some vs => match vs with
    | [] => 0
    | h :: _ => h
`, '1');

addTest('bifunctor_operations', `
-- Bifunctor operations
def bimapEither (f : Nat -> Nat) (g : String -> String) (e : Either Nat String) : Either Nat String :=
  match e with
  | Either.left v => Either.left (f v)
  | Either.right v => Either.right (g v)

def double (x : Nat) : Nat := x * 2
def exclaim (s : String) : String := s ++ "!"

def myEither := Either.right "hello"
def result := match bimapEither double exclaim myEither with
  | Either.left _ => 0
  | Either.right s => s.length
`, '6');

// ============================================================================
// Category 9: String and Character Operations (89-94)
// ============================================================================

addTest('string_length', `
-- String length
def result := "Hello, World!".length
`, '13');

addTest('string_append', `
-- String append
def greeting := "Hello" ++ ", " ++ "World" ++ "!"
def result := greeting.length
`, '13');

addTest('string_to_list', `
-- String to list conversion
def stringToList (s : String) : List Char := s.toList

def result := stringToList "abc".length
`, '3');

addTest('char_operations', `
-- Character operations
def charVal := 'A'
def result := if charVal == 'A' then 1 else 0
`, '1');

addTest('string_reverse', `
-- String reverse
def reverseAux (s : String) (acc : String) : String :=
  if s.length == 0 then acc
  else reverseAux (s.drop 1) (s.get 0 :: acc)

def reverse (s : String) : String := reverseAux s ""

def result := reverse "hello".length
`, '5');

addTest('substring_operations', `
-- Substring operations
def takeString (n : Nat) (s : String) : String := s.take n
def dropString (n : Nat) (s : String) : String := s.drop n

def myString := "Hello, World!"
def result := (takeString 5 myString).length + (dropString 7 myString).length
`, '11');

// ============================================================================
// Category 10: Advanced Recursion Patterns (95-100)
// ============================================================================

addTest('mutual_recursion', `
-- Mutual recursion
def isEven : Nat -> Bool
  | 0 => true
  | n + 1 => isOdd n

def isOdd : Nat -> Bool
  | 0 => false
  | n + 1 => isEven n

def result := if isEven 100 && isOdd 99 then 1 else 0
`, '1');

addTest('nested_recursion', `
-- Nested recursion (Ackermann-like)
def nestedRec : Nat -> Nat -> Nat
  | 0, n => n + 1
  | m + 1, 0 => nestedRec m 1
  | m + 1, n + 1 => nestedRec m (nestedRec (m + 1) n)

def result := nestedRec 2 3
`, '9');

addTest('tail_recursion_optimization', `
-- Tail recursion
def sumToAux (n : Nat) (acc : Nat) : Nat :=
  match n with
  | 0 => acc
  | n + 1 => sumToAux n (acc + n + 1)

def sumTo (n : Nat) : Nat := sumToAux n 0

def result := sumTo 100
`, '5050');

addTest('course_of_values_recursion', `
-- Course-of-values recursion
def fib : Nat -> Nat
  | 0 => 0
  | 1 => 1
  | n + 2 => fib (n + 1) + fib n

def result := fib 15
`, '610');

addTest('divide_and_conquer', `
-- Divide and conquer (maximum subarray sum - simplified)
def max (a b : Nat) : Nat := if a >= b then a else b

def maxSumAux (xs : List Nat) (currentMax : Nat) (globalMax : Nat) : Nat :=
  match xs with
  | [] => globalMax
  | h :: t =>
    let newCurrent := max h (currentMax + h)
    let newGlobal := max globalMax newCurrent
    maxSumAux t newCurrent newGlobal

def maxSubarraySum (xs : List Nat) : Nat :=
  match xs with
  | [] => 0
  | h :: t => maxSumAux t h h

def result := maxSubarraySum [1, 2, 3, 4, 5]
`, '15');

addTest('dynamic_programming_fib', `
-- Dynamic programming style Fibonacci
def fibAux : Nat -> Nat -> Nat -> Nat -> Nat
  | 0, _, _, result => result
  | n + 1, prev2, prev1, _ => fibAux n prev1 (prev1 + prev2) prev1

def fibFast (n : Nat) : Nat :=
  if n == 0 then 0
  else if n == 1 then 1
  else fibAux (n - 1) 0 1 1

def result := fibFast 30
`, '832040');

// Write all test files
console.log(`Generating ${tests.length} comprehensive test files...`);

tests.forEach((test, index) => {
  const filepath = path.join(testDir, test.name);
  fs.writeFileSync(filepath, test.content.trim() + '\n');
  if ((index + 1) % 10 === 0) {
    console.log(`Generated ${index + 1} tests...`);
  }
});

// Write expected outputs as JSON
const expectedOutputs: Record<string, string> = {};
tests.forEach(test => {
  expectedOutputs[test.name.replace('.lean', '')] = test.expectedOutput;
});
fs.writeFileSync(
  path.join(__dirname, 'expected_outputs.json'),
  JSON.stringify(expectedOutputs, null, 2)
);

console.log(`\nSuccessfully generated ${tests.length} comprehensive test programs in ${testDir}`);
console.log('Expected outputs written to expected_outputs.json');
