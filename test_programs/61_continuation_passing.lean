-- Test 61: Continuation Passing Style (simplified)
def addCPS (a b : Nat) (k : Nat → Nat) : Nat := k (a + b)

def mulCPS (a b : Nat) (k : Nat → Nat) : Nat := k (a * b)
def subCPS (a b : Nat) (k : Nat → Nat) : Nat :=
  if a >= b then k (a - b) else k 0

def eqCPS (a b : Nat) (k : Bool → Nat) : Nat := k (a = b)
def factorialCPS (n : Nat) (k : Nat → Nat) : Nat :=
  if n = 0 then k 1
  else factorialCPS (n - 1) (fun r => k (n * r))
def fibCPS (n : Nat) (k : Nat → Nat) : Nat :=
  if n <= 1 then k n
  else fibCPS (n - 1) (fun r1 =>
       fibCPS (n - 2) (fun r2 => k (r1 + r2)))
def sumListCPS (lst : List Nat) (k : Nat → Nat) : Nat :=
  match lst with
  | [] => k 0
  | h :: t => sumListCPS t (fun r => k (h + r))
def f1 := factorialCPS 5 (fun x => x)
def f2 := factorialCPS 10 (fun x => x)
def f3 := fibCPS 10 (fun x => x)
def f4 := fibCPS 15 (fun x => x)
def l1 := sumListCPS [1, 2, 3, 4, 5] (fun x => x)
def l2 := sumListCPS (List.range 10) (fun x => x)
def m1 := (List.map (fun x => x * 2) (List.range 5)).sum
def f5 := (List.filter (fun x => x % 2 = 0) (List.range 10)).sum
def x := f1 + f2 + f3 + f4 + l1 + l2 + m1 + f5

#eval s!"Factorial 5: {f1}"
#eval s!"Factorial 10: {f2}"
#eval s!"Fibonacci 10: {f3}"
#eval s!"Fibonacci 15: {f4}"
#eval s!"Sum [1,2,3,4,5]: {l1}"
#eval s!"Sum range 10: {l2}"
#eval s!"Sum map (*2) range 5: {m1}"
#eval s!"Sum filter even range 10: {f5}"
#eval s!"Total x: {x}"
