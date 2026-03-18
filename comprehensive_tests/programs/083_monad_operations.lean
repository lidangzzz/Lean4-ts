-- Monad operations (simulated)
def pureOption (x : Nat) : Option Nat := Option.some x

def bindOption (x : Option Nat) (f : Nat -> Option Nat) : Option Nat :=
  match x with
  | Option.none => Option.none
  | Option.some v => f v

def safeDiv (x : Nat) (y : Nat) : Option Nat :=
  if y == 0 then Option.none else Option.some (x / y)

def computation := bindOption (safeDiv 100 2) (fun x => safeDiv x 5)

def result := match computation with
  | Option.none => 0
  | Option.some v => v
