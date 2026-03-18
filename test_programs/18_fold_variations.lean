-- Test 18: Fold variations
def foldl : (Nat → Nat → Nat) → Nat → List Nat → Nat
  | _, acc, [] => acc
  | f, acc, h :: t => foldl f (f acc h) t

def foldr : (Nat → Nat → Nat) → Nat → List Nat → Nat
  | _, acc, [] => acc
  | f, acc, h :: t => f h (foldr f acc t)

def foldl1 : (Nat → Nat → Nat) → List Nat → Nat
  | _, [] => 0
  | f, h :: t => foldl f h t

def foldr1 : (Nat → Nat → Nat) → List Nat → Nat
  | _, [] => 0
  | f, [x] => x
  | f, h :: t => f h (foldr1 f t)

def nums := [1, 2, 3, 4, 5]
def sumL := foldl (fun a b => a + b) 0 nums
def sumR := foldr (fun a b => a + b) 0 nums
def prodL := foldl (fun a b => a * b) 1 nums
def prodR := foldr (fun a b => a * b) 1 nums
def x := sumL + sumR + prodL + prodR
