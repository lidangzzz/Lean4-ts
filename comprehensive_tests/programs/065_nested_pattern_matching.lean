-- Nested pattern matching
def matchNested (p : Nat × (List Nat)) : Nat :=
  match p with
  | (0, []) => 0
  | (0, x :: _) => x
  | (n, []) => n
  | (n, x :: xs) => n + x + matchNested (n - 1, xs)

def result := matchNested (3, [1, 2, 3])
