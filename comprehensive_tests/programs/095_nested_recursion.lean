-- Nested recursion (Ackermann-like)
def nestedRec : Nat -> Nat -> Nat
  | 0, n => n + 1
  | m + 1, 0 => nestedRec m 1
  | m + 1, n + 1 => nestedRec m (nestedRec (m + 1) n)

def result := nestedRec 2 3
