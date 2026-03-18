-- Test 36: Simple type checker
inductive SimpleType where
  | nat : SimpleType
  | bool : SimpleType
  | fun : SimpleType -> SimpleType -> SimpleType
deriving BEq, Repr

inductive Term where
  | num : Nat -> Term
  | bool : Bool -> Term
  | add : Term -> Term -> Term
  | if_ : Term -> Term -> Term -> Term
  | lam : String -> SimpleType -> Term -> Term
  | app : Term -> Term -> Term

def typeCheck : Term -> Option SimpleType
  | Term.num _ => some SimpleType.nat
  | Term.bool _ => some SimpleType.bool
  | Term.add t1 t2 =>
    match typeCheck t1, typeCheck t2 with
    | some SimpleType.nat, some SimpleType.nat => some SimpleType.nat
    | _, _ => none
  | Term.if_ cond then_ else_ =>
    match typeCheck cond, typeCheck then_, typeCheck else_ with
    | some SimpleType.bool, some t1, some t2 => if t1 == t2 then some t1 else none
    | _, _, _ => none
  | Term.lam _ ty body =>
    match typeCheck body with
    | some ret => some (SimpleType.fun ty ret)
    | none => none
  | Term.app fn arg =>
    match typeCheck fn, typeCheck arg with
    | some (SimpleType.fun param ret), some argTy => if param == argTy then some ret else none
    | _, _ => none

def t1 := Term.num 42
def t2 := Term.add (Term.num 1) (Term.num 2)
def t3 := Term.if_ (Term.bool true) (Term.num 1) (Term.num 2)
def r1 := if typeCheck t1 == some SimpleType.nat then 1 else 0
def r2 := if typeCheck t2 == some SimpleType.nat then 1 else 0
def r3 := if typeCheck t3 == some SimpleType.nat then 1 else 0
def x := r1 + r2 + r3

-- Output results
#eval r1
#eval r2
#eval r3
#eval x
