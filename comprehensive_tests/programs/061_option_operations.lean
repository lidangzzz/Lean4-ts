-- Option type operations
inductive Option (α : Type) where
  | none : Option α
  | some : α -> Option α

def optionMap (f : Nat -> Nat) (o : Option Nat) : Option Nat :=
  match o with
  | Option.none => Option.none
  | Option.some v => Option.some (f v)

def optionGetOrElse (o : Option Nat) (default : Nat) : Nat :=
  match o with
  | Option.none => default
  | Option.some v => v

def double (x : Nat) : Nat := x * 2

def someVal := Option.some 21
def result := optionGetOrElse (optionMap double someVal) 0
