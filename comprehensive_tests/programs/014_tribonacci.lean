-- Tribonacci sequence
def trib : Nat -> Nat
  | 0 => 0
  | 1 => 0
  | 2 => 1
  | n + 1 => trib n + trib (n - 1) + trib (n - 2)

def result := trib 15
