-- Kleisli composition for Option
inductive Option (α : Type) where
  | none : Option α
  | some : α -> Option α

def optionBind (x : Option Nat) (f : Nat -> Option Nat) : Option Nat :=
  match x with
  | Option.none => Option.none
  | Option.some v => f v

def safeDiv (x : Nat) (y : Nat) : Option Nat :=
  if y == 0 then Option.none else Option.some (x / y)

def kleisliCompose (f : Nat -> Option Nat) (g : Nat -> Option Nat) (x : Nat) : Option Nat :=
  match f x with
  | Option.none => Option.none
  | Option.some v => g v

def divBy2 := safeDiv 100
def divBy5 := safeDiv 20

def composed := kleisliCompose divBy2 divBy5
def result := match composed 2 with
  | Option.none => 0
  | Option.some v => v
