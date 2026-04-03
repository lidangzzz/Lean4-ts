-- Test 59: Unification Algorithm
inductive UTerm where
  | var : String → UTerm
  | const : String → UTerm
  | app : UTerm → UTerm → UTerm
deriving Repr

def occursIn (name : String) : UTerm → Bool
  | UTerm.var n => n = name
  | UTerm.const _ => false
  | UTerm.app f a => occursIn name f || occursIn name a

def substituteUTerm (term : UTerm) (name : String) (replacement : UTerm) : UTerm :=
  match term with
  | UTerm.var n => if n = name then replacement else term
  | UTerm.const _ => term
  | UTerm.app f a => UTerm.app (substituteUTerm f name replacement) (substituteUTerm a name replacement)

def applySubsts (term : UTerm) (substs : List (String × UTerm)) : UTerm :=
  substs.foldl (fun t (name, repl) => substituteUTerm t name repl) term

partial def unifyTerms (t1 t2 : UTerm) : Option (List (String × UTerm)) :=
  let rec unify (a b : UTerm) (substs : List (String × UTerm)) : Option (List (String × UTerm)) :=
    let a' := applySubsts a substs
    let b' := applySubsts b substs
    match a', b' with
    | UTerm.var n1, UTerm.var n2 =>
      if n1 = n2 then some substs else some ((n1, b') :: substs)
    | UTerm.var n, t =>
      if occursIn n t then none else some ((n, t) :: substs)
    | t, UTerm.var n =>
      if occursIn n t then none else some ((n, t) :: substs)
    | UTerm.const c1, UTerm.const c2 =>
      if c1 = c2 then some substs else none
    | UTerm.app f1 a1, UTerm.app f2 a2 =>
      match unify f1 f2 substs with
      | some substs' => unify a1 a2 substs'
      | none => none
    | _, _ => none
  unify t1 t2 []

def utermSize : UTerm → Nat
  | UTerm.var _ => 1
  | UTerm.const _ => 1
  | UTerm.app f a => 1 + utermSize f + utermSize a

def utermDepth : UTerm → Nat
  | UTerm.var _ => 0
  | UTerm.const _ => 0
  | UTerm.app f a => 1 + max (utermDepth f) (utermDepth a)

def utermCountVars : UTerm → Nat
  | UTerm.var _ => 1
  | UTerm.const _ => 0
  | UTerm.app f a => utermCountVars f + utermCountVars a

def t1 := UTerm.app (UTerm.app (UTerm.const "f") (UTerm.var "X")) (UTerm.var "Y")
def t2 := UTerm.app (UTerm.app (UTerm.const "f") (UTerm.const "a")) (UTerm.const "b")

def u1 := unifyTerms t1 t2

def t3 := UTerm.app (UTerm.const "g") (UTerm.var "X")
def t4 := UTerm.app (UTerm.const "g") (UTerm.app (UTerm.const "h") (UTerm.var "Y"))

def u2 := unifyTerms t3 t4

def t5 := UTerm.var "X"
def t6 := UTerm.app (UTerm.const "f") (UTerm.var "X")

def u3 := unifyTerms t5 t6

def s1 := utermSize t1
def s2 := utermSize t2
def s3 := utermSize t3
def s4 := utermSize t4

def v1 := utermCountVars t1
def v2 := utermCountVars t3

def x := s1 + s2 + s3 + s4 + v1 + v2 +
         (match u1 with | some l => l.length | none => 0) +
         (match u2 with | some l => l.length | none => 0) +
         (match u3 with | some _ => 0 | none => 1)

#eval s!"Term 1 size: {s1}"
#eval s!"Term 2 size: {s2}"
#eval s!"Term 3 size: {s3}"
#eval s!"Term 4 size: {s4}"
#eval s!"Vars in t1: {v1}"
#eval s!"Vars in t3: {v2}"
#eval s!"Unification t1 t2: {repr u1}"
#eval s!"Unification t3 t4: {repr u2}"
#eval s!"Unification t5 t6 (should fail): {repr u3}"
#eval s!"Total x: {x}"
