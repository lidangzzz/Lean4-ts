-- Test 21: Nested pattern matching
def matchNested : List (List Nat) → Nat
  | [] => 0
  | [[]] => 1
  | [[_]] => 2
  | [[_, _]] => 3
  | [[_, _, _]] => 4
  | _ :: _ :: _ :: _ => 5
  | _ :: _ => 6

def r1 := matchNested []
def r2 := matchNested [[]]
def r3 := matchNested [[1]]
def r4 := matchNested [[1, 2]]
def r5 := matchNested [[1, 2, 3]]
def r6 := matchNested [[1], [2], [3], [4]]
def r7 := matchNested [[1], [2]]
def x := r1 + r2 + r3 + r4 + r5 + r6 + r7

#eval r1
#eval r2
#eval r3
#eval r4
#eval r5
#eval r6
#eval r7
#eval x
