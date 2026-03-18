-- Test 32: Polynomial evaluation
def evalPoly : List Nat -> Nat -> Nat
  | [], _ => 0
  | coeffs, x =>
    let rec eval : List Nat -> Nat -> Nat -> Nat
      | [], _, _ => 0
      | [c], _, _ => c
      | c :: cs, pow, val =>
        c * pow + eval cs (pow * val) val
    eval coeffs 1 x

def polyAdd : List Nat -> List Nat -> List Nat
  | [], ys => ys
  | xs, [] => xs
  | x :: xs, y :: ys => (x + y) :: polyAdd xs ys

def polyMul : List Nat -> List Nat -> List Nat
  | [], _ => []
  | _, [] => []
  | [x], ys => ys.map (fun y => x * y)
  | xs, ys =>
    let rec mul : Nat -> List Nat -> List Nat -> List Nat
      | _, [], _ => []
      | 0, _, _ => []
      | n + 1, a :: as, bs =>
        let scaled := bs.map (fun b => b * a)
        let rest := mul n as bs
        scaled ++ [0] ++ rest
    let result := mul xs.length xs ys
    result

def p1 := [1, 2, 3]
def p2 := [4, 5]
def e1 := evalPoly p1 2
def e2 := evalPoly p2 3
def sum := polyAdd p1 p2
def x := e1 + e2

-- Output results
#eval e1
#eval e2
#eval sum
#eval x
