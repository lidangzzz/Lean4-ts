-- Applicative operations (simulated)
def pureOption (x : Nat) : Option Nat := Option.some x

def apOption (f : Option (Nat -> Nat)) (x : Option Nat) : Option Nat :=
  match f, x with
  | Option.some g, Option.some v => Option.some (g v)
  | _, _ => Option.none

def double (x : Nat) : Nat := x * 2

def result := match apOption (pureOption double) (pureOption 21) with
  | Option.none => 0
  | Option.some v => v
