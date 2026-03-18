-- Test 30: Comprehensive list operations
def head : List Nat → Option Nat
  | [] => none
  | h :: _ => some h

def tail : List Nat → Option (List Nat)
  | [] => none
  | _ :: t => some t

def last : List Nat → Option Nat
  | [] => none
  | [x] => some x
  | _ :: t => last t

def init : List Nat → Option (List Nat)
  | [] => none
  | [x] => some []
  | h :: t => match init t with
    | none => none
    | some t' => some (h :: t')

def reverse : List Nat → List Nat
  | [] => []
  | h :: t => reverse t ++ [h]

def concat : List (List Nat) → List Nat
  | [] => []
  | h :: t => h ++ concat t

def intersperse : Nat → List Nat → List Nat
  | _, [] => []
  | _, [x] => [x]
  | sep, h :: t => h :: sep :: intersperse sep t

def intercalate : List Nat → List (List Nat) → List Nat
  | _, [] => []
  | sep, [x] => x
  | sep, h :: t => h ++ sep ++ intercalate sep t

def testList := [1, 2, 3, 4, 5]
def h := match head testList with | some v => v | none => 0
def l := match last testList with | some v => v | none => 0
def rev := reverse testList
def revSum := List.foldl (fun a b => a + b) 0 rev
def inter := intersperse 0 testList
def interSum := List.foldl (fun a b => a + b) 0 inter
def x := h + l + revSum + interSum
