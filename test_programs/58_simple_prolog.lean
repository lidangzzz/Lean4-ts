-- Test 58: Simple Prolog-like resolution
inductive PrologTerm where
  | atom : String → PrologTerm
  | var : String → PrologTerm
  | compound : String → List PrologTerm → PrologTerm
deriving Repr, Inhabited

inductive PrologGoal where
  | fact : PrologTerm → PrologGoal
  | rule : PrologTerm → List PrologTerm → PrologGoal
deriving Repr

-- Check if a variable occurs in a term
partial def prologOccurs (name : String) : PrologTerm → Bool
  | PrologTerm.atom _ => false
  | PrologTerm.var n => n == name
  | PrologTerm.compound _ args => args.any (prologOccurs name)

-- Apply bindings to a term
partial def applyBindings (term : PrologTerm) (bindings : List (String × PrologTerm)) : PrologTerm :=
  match term with
  | PrologTerm.atom _ => term
  | PrologTerm.var n =>
    match bindings.find? (fun (name, _) => name == n) with
    | some (_, t) => applyBindings t bindings
    | none => term
  | PrologTerm.compound name args =>
    PrologTerm.compound name (args.map (fun a => applyBindings a bindings))

-- Unify two terms
partial def unify (t1 t2 : PrologTerm) (bindings : List (String × PrologTerm)) : Option (List (String × PrologTerm)) :=
  let t1' := applyBindings t1 bindings
  let t2' := applyBindings t2 bindings
  match t1', t2' with
  | PrologTerm.atom a, PrologTerm.atom b => if a == b then some bindings else none
  | PrologTerm.var n, t =>
    if prologOccurs n t then none else some ((n, t) :: bindings)
  | t, PrologTerm.var n =>
    if prologOccurs n t then none else some ((n, t) :: bindings)
  | PrologTerm.compound n1 args1, PrologTerm.compound n2 args2 =>
    if n1 == n2 && args1.length == args2.length then
      (List.zip args1 args2).foldlM (fun bs (a1, a2) => unify a1 a2 bs) bindings
    else none
  | _, _ => none

-- Simple knowledge base
def facts : List PrologTerm := [
  PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.atom "bob"],
  PrologTerm.compound "parent" [PrologTerm.atom "bob", PrologTerm.atom "carol"]
]

-- Try to match a query against facts
partial def solveQuery (query : PrologTerm) (facts : List PrologTerm) : List (List (String × PrologTerm)) :=
  facts.filterMap (fun fact => unify query fact [])

-- Test queries
def query1 := PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.var "Y"]
def query2 := PrologTerm.compound "parent" [PrologTerm.var "X", PrologTerm.atom "carol"]
def query3 := PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.atom "bob"]

def result1 := solveQuery query1 facts
def result2 := solveQuery query2 facts
def result3 := solveQuery query3 facts

def totalResults := result1.length + result2.length + result3.length

#eval s!"Query 1 (parent alice Y): {result1.length} solutions"
#eval s!"Query 2 (parent X carol): {result2.length} solutions"
#eval s!"Query 3 (parent alice bob): {result3.length} solutions"
#eval s!"Total results: {totalResults}"
#eval s!"Facts count: {facts.length}"
