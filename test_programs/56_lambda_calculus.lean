-- Test 56: Lambda Calculus Interpreter
inductive LambdaTerm where
  | var : Nat -> LambdaTerm
  | app : LambdaTerm -> LambdaTerm -> LambdaTerm
  | lam : Nat -> LambdaTerm -> LambdaTerm

def freeVars : LambdaTerm -> List Nat
  | LambdaTerm.var x => [x]
  | LambdaTerm.app f a => freeVars f ++ freeVars a
  | LambdaTerm.lam x body => freeVars body |>.filter (fun v => v != x)

def maxVar : LambdaTerm -> Nat
  | LambdaTerm.var x => x
  | LambdaTerm.app f a => max (maxVar f) (maxVar a)
  | LambdaTerm.lam x body => max x (maxVar body)

partial def substitute (body : LambdaTerm) (x : Nat) (replacement : LambdaTerm) : LambdaTerm :=
  match body with
  | LambdaTerm.var y => if y = x then replacement else body
  | LambdaTerm.app f a => LambdaTerm.app (substitute f x replacement) (substitute a x replacement)
  | LambdaTerm.lam y b =>
    if y = x then body
    else if freeVars replacement |>.contains y then
      let freshY := max (maxVar body + 1) (maxVar replacement + 1)
      LambdaTerm.lam freshY (substitute (substitute b y (LambdaTerm.var freshY)) x replacement)
    else LambdaTerm.lam y (substitute b x replacement)

def isRedex : LambdaTerm -> Bool
  | LambdaTerm.app (LambdaTerm.lam _ _) _ => true
  | _ => false

partial def reduce1 : LambdaTerm -> Option LambdaTerm
  | LambdaTerm.app (LambdaTerm.lam x body) arg => some (substitute body x arg)
  | LambdaTerm.app f a =>
    match reduce1 f with
    | some f' => some (LambdaTerm.app f' a)
    | none => match reduce1 a with
      | some a' => some (LambdaTerm.app f a')
      | none => none
  | LambdaTerm.lam x body =>
    match reduce1 body with
    | some body' => some (LambdaTerm.lam x body')
    | none => none
  | _ => none

partial def reduceN (term : LambdaTerm) (fuel : Nat) : LambdaTerm :=
  match fuel with
  | 0 => term
  | n + 1 =>
    match reduce1 term with
    | some term' => reduceN term' n
    | none => term

def termSize : LambdaTerm -> Nat
  | LambdaTerm.var _ => 1
  | LambdaTerm.app f a => 1 + termSize f + termSize a
  | LambdaTerm.lam _ body => 1 + termSize body

def termDepth : LambdaTerm -> Nat
  | LambdaTerm.var _ => 0
  | LambdaTerm.app f a => 1 + max (termDepth f) (termDepth a)
  | LambdaTerm.lam _ body => 1 + termDepth body

def idTerm := LambdaTerm.lam 0 (LambdaTerm.var 0)
def constTerm := LambdaTerm.lam 0 (LambdaTerm.lam 1 (LambdaTerm.var 0))
def flipTerm := LambdaTerm.lam 0 (LambdaTerm.lam 1 (LambdaTerm.lam 2
  (LambdaTerm.app (LambdaTerm.app (LambdaTerm.var 1) (LambdaTerm.var 2)) (LambdaTerm.var 0))))

def appId := LambdaTerm.app idTerm (LambdaTerm.var 42)
def reducedId := reduceN appId 10

def appConst := LambdaTerm.app (LambdaTerm.app constTerm (LambdaTerm.var 1)) (LambdaTerm.var 2)
def reducedConst := reduceN appConst 10

def s1 := termSize idTerm
def s2 := termSize constTerm
def s3 := termSize flipTerm
def d1 := termDepth idTerm
def d2 := termDepth constTerm
def d3 := termDepth flipTerm

def x := s1 + s2 + s3 + d1 + d2 + d3 + (termSize reducedId) + (termSize reducedConst)

-- Output results
#eval s!"idTerm size: {s1}, depth: {d1}"
#eval s!"constTerm size: {s2}, depth: {d2}"
#eval s!"flipTerm size: {s3}, depth: {d3}"
#eval s!"reducedId size: {termSize reducedId}"
#eval s!"reducedConst size: {termSize reducedConst}"
#eval s!"Total x: {x}"
