-- Test 27: Lazy evaluation patterns
def take : Nat → List Nat → List Nat
  | 0, _ => []
  | _, [] => []
  | n + 1, h :: t => h :: take n t

def repeat : Nat → List Nat
  | x => x :: repeat x

def iterate : (Nat → Nat) → Nat → List Nat
  | f, x => x :: iterate f (f x)

def naturals := iterate (fun x => x + 1) 0
def first10 := take 10 naturals
def sum10 := foldl (fun a b => a + b) 0 first10

def fibs := 
  let rec fibsFrom : Nat → Nat → List Nat
    | a, b => a :: fibsFrom b (a + b)
  fibsFrom 0 1

def first10Fibs := take 10 fibs
def sumFibs := foldl (fun a b => a + b) 0 first10Fibs

def x := sum10 + sumFibs
