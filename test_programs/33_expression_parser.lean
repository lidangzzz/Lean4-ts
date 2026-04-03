-- Test 33: Expression evaluation (simulated parser)
inductive Expr where
  | num : Nat → Expr
  | add : Expr → Expr → Expr
  | mul : Expr → Expr → Expr
  | sub : Expr → Expr → Expr

def eval : Expr → Nat
  | Expr.num n => n
  | Expr.add e1 e2 => eval e1 + eval e2
  | Expr.mul e1 e2 => eval e1 * eval e2
  | Expr.sub e1 e2 => 
    let v1 := eval e1
    let v2 := eval e2
    if v1 >= v2 then v1 - v2 else 0

def exprDepth : Expr → Nat
  | Expr.num _ => 1
  | Expr.add e1 e2 => 1 + max (exprDepth e1) (exprDepth e2)
  | Expr.mul e1 e2 => 1 + max (exprDepth e1) (exprDepth e2)
  | Expr.sub e1 e2 => 1 + max (exprDepth e1) (exprDepth e2)

def exprSize : Expr → Nat
  | Expr.num _ => 1
  | Expr.add e1 e2 => 1 + exprSize e1 + exprSize e2
  | Expr.mul e1 e2 => 1 + exprSize e1 + exprSize e2
  | Expr.sub e1 e2 => 1 + exprSize e1 + exprSize e2

def e1 := Expr.add (Expr.num 3) (Expr.mul (Expr.num 4) (Expr.num 5))
def e2 := Expr.sub (Expr.mul (Expr.add (Expr.num 2) (Expr.num 3)) (Expr.num 4)) (Expr.num 5)
def v1 := eval e1
def v2 := eval e2
def d := exprDepth e2
def s := exprSize e2
def x := v1 + v2 + d + s

#eval v1
#eval v2
#eval d
#eval s
#eval x
