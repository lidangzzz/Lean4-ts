-- GADT-like pattern matching
inductive Expr : Type -> Type where
  | nat : Nat -> Expr Nat
  | bool : Bool -> Expr Bool
  | add : Expr Nat -> Expr Nat -> Expr Nat
  | if_ : Expr Bool -> Expr Nat -> Expr Nat -> Expr Nat

def eval : Expr t -> Nat
  | Expr.nat n => n
  | Expr.add e1 e2 => eval e1 + eval e2
  | Expr.if_ c e1 e2 => match c with
    | Expr.bool true => eval e1
    | Expr.bool false => eval e2
    | _ => 0
  | _ => 0

def myExpr := Expr.if_ (Expr.bool true) (Expr.add (Expr.nat 10) (Expr.nat 5)) (Expr.nat 0)
def result := eval myExpr
