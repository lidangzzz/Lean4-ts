-- Functor operations (simulated)
def mapOption (f : Nat -> Nat) (o : Option Nat) : Option Nat :=
  match o with
  | Option.none => Option.none
  | Option.some v => Option.some (f v)

def mapList (f : Nat -> Nat) (xs : List Nat) : List Nat :=
  match xs with
  | [] => []
  | h :: t => f h :: mapList f t

def double (x : Nat) : Nat := x * 2

def result := match mapOption double (Option.some 21) with
  | Option.none => 0
  | Option.some v => v
