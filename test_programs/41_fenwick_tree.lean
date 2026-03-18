-- Test 41: Fenwick Tree (Binary Indexed Tree)
def fenwickBuild (n : Nat) : Array Nat := Array.mkArray n 0

def fenwickLSB (i : Nat) : Nat := i.land (i.xor (i - 1))

def fenwickUpdate (ft : Array Nat) (i : Nat) (delta : Nat) : Array Nat :=
  if i < ft.size then
    let newFt := ft.set! i (ft.get! i + delta)
    let nextIdx := i + fenwickLSB (i + 1)
    if nextIdx < ft.size then fenwickUpdate newFt nextIdx delta
    else newFt
  else ft

def fenwickPrefixSum (ft : Array Nat) (i : Nat) : Nat :=
  if i = 0 then ft.get! 0
  else if i < ft.size then
    ft.get! i + fenwickPrefixSum ft (i - fenwickLSB (i + 1))
  else 0

def fenwickRangeSum (ft : Array Nat) (l r : Nat) : Nat :=
  if l = 0 then fenwickPrefixSum ft r
  else fenwickPrefixSum ft r - fenwickPrefixSum ft (l - 1)

def buildFromArray (arr : Array Nat) : Array Nat :=
  let n := arr.size
  let ft := fenwickBuild n
  (List.range n).foldl (fun acc i => fenwickUpdate acc i (arr.get! i)) ft

def arr := #[3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3]
def ft := buildFromArray (arr.map (fun x => if x < 0 then 0 else x))

def q1 := fenwickPrefixSum ft 0
def q2 := fenwickPrefixSum ft 4
def q3 := fenwickPrefixSum ft 10
def q4 := fenwickRangeSum ft 2 6
def q5 := fenwickRangeSum ft 0 10

def arr2 := #[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
def ft2 := buildFromArray arr2

def q6 := fenwickPrefixSum ft2 9
def q7 := fenwickRangeSum ft2 4 7
def q8 := fenwickRangeSum ft2 0 4

def x := q1 + q2 + q3 + q4 + q5 + q6 + q7 + q8
