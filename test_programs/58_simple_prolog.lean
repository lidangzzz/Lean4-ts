-- Test 58: Simple Prolog-like Resolution
inductive PrologTerm where
  | atom : String → PrologTerm
  | var : String → PrologTerm
  | compound : String → List PrologTerm → PrologTerm

def prologOccurs (name : String) : PrologTerm → Bool
  | PrologTerm.atom _ => false
  | PrologTerm.var n => n = name
  | PrologTerm.compound _ args => args.any (prologOccurs name)

inductive PrologGoal where
  | fact : PrologTerm → PrologGoal
  | rule : PrologTerm → List PrologTerm → PrologGoal

def unify (t1 t2 : PrologTerm) : Option (List (String × PrologTerm)) :=
  let rec doUnify (a b : PrologTerm) (bindings : List (String × PrologTerm)) : Option (List (String × PrologTerm)) :=
    match a, b with
    | PrologTerm.atom n1, PrologTerm.atom n2 =>
      if n1 = n2 then some bindings else none
    | PrologTerm.var n, t =>
      match bindings.find? (fun (name, _) => name = n) with
      | some (_, bound) => doUnify bound t bindings
      | none =>
        match t with
        | PrologTerm.var m =>
          if n = m then some bindings
          else if prologOccurs n t then none
          else some ((n, t) :: bindings)
        | _ => some ((n, t) :: bindings)
    | t, PrologTerm.var n =>
      match bindings.find? (fun (name, _) => name = n) with
      | some (_, bound) => doUnify t bound bindings
      | none =>
        if prologOccurs n t then none
        else some ((n, t) :: bindings)
    | PrologTerm.compound n1 args1, PrologTerm.compound n2 args2 =>
      if n1 = n2 && args1.length = args2.length then
        (args1.zip args2).foldlM (fun acc (a, b) => doUnify a b acc) bindings
      else none
    | _, _ => none
  doUnify t1 t2 []

def applyBindings (term : PrologTerm) (bindings : List (String × PrologTerm)) : PrologTerm :=
  match term with
  | PrologTerm.atom _ => term
  | PrologTerm.var n =>
    match bindings.find? (fun (name, _) => name = n) with
    | some (_, t) => applyBindings t bindings
    | none => term
  | PrologTerm.compound n args =>
    PrologTerm.compound n (args.map (fun a => applyBindings a bindings))

def goals := [
  PrologGoal.fact (PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.atom "bob"]),
  PrologGoal.fact (PrologTerm.compound "parent" [PrologTerm.atom "bob", PrologTerm.atom "carol"]),
  PrologGoal.rule
    (PrologTerm.compound "grandparent" [PrologTerm.var "X", PrologTerm.var "Z"])
    [PrologTerm.compound "parent" [PrologTerm.var "X", PrologTerm.var "Y"],
     PrologTerm.compound "parent" [PrologTerm.var "Y", PrologTerm.var "Z"]]
]

def query1 := PrologTerm.compound "parent" [PrologTerm.var "X", PrologTerm.atom "bob"]
def query2 := PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.var "Y"]

def result1 := unify query1 (PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.atom "bob"])
def result2 := unify query2 (PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.atom "bob"])

def x := (match result1 with | some _ => 1 | none => 0) +
         (match result2 with | some b => b.length | none => 0) +
         goals.length
