-- Traversable operations
def traverseOption (f : Nat -> Option Nat) (xs : List Nat) : Option (List Nat) :=
  match xs with
  | [] => Option.some []
  | h :: t =>
    match f h, traverseOption f t with
    | Option.some v, Option.some vs => Option.some (v :: vs)
    | _, _ => Option.none

def safeHalf (x : Nat) : Option Nat :=
  if x % 2 == 0 then Option.some (x / 2) else Option.none

def result := match traverseOption safeHalf [2, 4, 6, 8] with
  | Option.none => 0
  | Option.some vs => match vs with
    | [] => 0
    | h :: _ => h
