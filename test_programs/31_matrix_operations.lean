-- Test 31: Matrix operations
-- Helper function to get element at index
def listGet? : List Nat -> Nat -> Option Nat
  | [], _ => none
  | h :: _, 0 => some h
  | _ :: t, n + 1 => listGet? t n

def matrixGet : Nat -> Nat -> Nat -> List Nat -> Nat
  | row, col, width, m =>
    let idx := row * width + col
    match listGet? m idx with
    | some v => v
    | none => 0

def matrixRow : Nat -> Nat -> List Nat -> List Nat
  | row, width, m =>
    let start := row * width
    let rec getRow : Nat -> List Nat -> List Nat
      | 0, _ => []
      | n + 1, [] => []
      | n + 1, h :: t => h :: getRow n t
    getRow width (m.drop start)

def matrixCol : Nat -> Nat -> Nat -> List Nat -> List Nat
  | _, 0, _, _ => []
  | col, width, height, m =>
    let rec getCol : Nat -> Nat -> List Nat -> List Nat
      | _, 0, _ => []
      | c, h + 1, [] => []
      | c, h + 1, _ :: t =>
        match listGet? t (c - 1) with
        | some v => v :: getCol c h (t.drop width)
        | none => getCol c h (t.drop width)
    getCol col height m

def matrixSum : Nat -> List Nat -> Nat
  | _, [] => 0
  | _, m => m.foldl (fun a b => a + b) 0

def mat := [1, 2, 3, 4, 5, 6, 7, 8, 9]
def w := 3
def sum := matrixSum w mat
def elem := matrixGet 1 1 w mat
def row1 := matrixRow 1 w mat
def x := sum + elem

-- Output results
#eval sum
#eval elem
#eval row1
#eval x
