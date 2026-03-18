-- Test 4: Fibonacci variants
def fib : Nat → Nat
  | 0 => 0
  | 1 => 1
  | n + 2 => fib n + fib (n + 1)

def fibFast : Nat → Nat
  | n => 
    let rec loop : Nat → Nat → Nat → Nat
      | 0, a, _ => a
      | n, a, b => loop (n - 1) b (a + b)
    loop n 0 1

def fibList : Nat → List Nat
  | 0 => []
  | 1 => [1]
  | n + 1 => 
    let prev := fibList n
    match prev with
    | [] => [1]
    | [x] => [x, x]
    | h1 :: h2 :: _ => (h1 + h2) :: prev

def f20 := fib 20
def f20f := fibFast 20
def fList := fibList 10
def x := f20 + f20f
