-- Test 62: Monad Transformers (simulated)
inductive OptionM (α : Type) where | none : OptionM α | some : α → OptionM α

def pureOption (a : Nat) : OptionM Nat := OptionM.some a

def bindOption (ma : OptionM Nat) (f : Nat → OptionM Nat) : OptionM Nat :=
  match ma with
  | OptionM.none => OptionM.none
  | OptionM.some a => f a

def mapOption (f : Nat → Nat) (ma : OptionM Nat) : OptionM Nat :=
  match ma with
  | OptionM.none => OptionM.none
  | OptionM.some a => OptionM.some (f a)

def safeDiv (a b : Nat) : OptionM Nat :=
  if b = 0 then OptionM.none else OptionM.some (a / b)

def safeHead (l : List Nat) : OptionM Nat :=
  match l with
  | [] => OptionM.none
  | h :: _ => OptionM.some h

def safeTail (l : List Nat) : OptionM (List Nat) :=
  match l with
  | [] => OptionM.none
  | _ :: t => OptionM.some t

def safeNth (l : List Nat) (n : Nat) : OptionM Nat :=
  match n with
  | 0 => safeHead l
  | n + 1 =>
    match safeTail l with
    | OptionM.none => OptionM.none
    | OptionM.some t => safeNth t n

def computation1 : OptionM Nat :=
  match safeDiv 100 5 with
  | OptionM.none => OptionM.none
  | OptionM.some x1 =>
    match safeDiv x1 2 with
    | OptionM.none => OptionM.none
    | OptionM.some x2 => OptionM.some (x2 + 1)

def computation2 : OptionM Nat :=
  match safeHead [10, 20, 30] with
  | OptionM.none => OptionM.none
  | OptionM.some x1 =>
    match safeDiv x1 5 with
    | OptionM.none => OptionM.none
    | OptionM.some x2 =>
      match safeDiv x2 2 with
      | OptionM.none => OptionM.none
      | OptionM.some x3 =>
        match safeDiv x3 2 with
        | OptionM.none => OptionM.none
        | OptionM.some x4 => OptionM.some (x4 * 3)

def computation3 : OptionM Nat :=
  match safeDiv 10 0 with
  | OptionM.none => OptionM.none
  | OptionM.some x => OptionM.some (x + 1)

def computation4 : OptionM Nat :=
  match safeNth [1, 2, 3, 4, 5] 2 with
  | OptionM.none => OptionM.none
  | OptionM.some x => OptionM.some (x * 10)

def result1 := match computation1 with | OptionM.some x => x | OptionM.none => 0
def result2 := match computation2 with | OptionM.some x => x | OptionM.none => 0
def result3 := match computation3 with | OptionM.some x => x | OptionM.none => 0
def result4 := match computation4 with | OptionM.some x => x | OptionM.none => 0

def x := result1 + result2 + result3 + result4
