-- Flip function arguments
def flip (f : Nat -> Nat -> Nat) (y : Nat) (x : Nat) : Nat :=
  f x y

def sub (x : Nat) (y : Nat) : Nat := x - y
def flippedSub := flip sub

def result := flippedSub 3 10
