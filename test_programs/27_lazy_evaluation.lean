-- Test 27: Lazy evaluation patterns (simplified)
def take : Nat -> List Nat -> List Nat
  | 0, _ => []
  | _, [] => []
  | n + 1, h :: t => h :: take n t

-- Generate a finite sequence using iteration
def iterateN (f : Nat -> Nat) (x : Nat) (n : Nat) : List Nat :=
  match n with
  | 0 => []
  | n + 1 => x :: iterateN f (f x) n

def naturals := iterateN (fun x => x + 1) 0 10
def first10 := naturals
def sum10 := first10.foldl (fun a b => a + b) 0

-- Generate fibonacci sequence
def fibsFromN (a : Nat) (b : Nat) (n : Nat) : List Nat :=
  match n with
  | 0 => []
  | n + 1 => a :: fibsFromN b (a + b) n

def fibs := fibsFromN 0 1 10
def first10Fibs := fibs
def sumFibs := first10Fibs.foldl (fun a b => a + b) 0

def x := sum10 + sumFibs

-- Output results
#eval first10
#eval sum10
#eval first10Fibs
#eval sumFibs
#eval x
