-- Test 58: Simple Prolog-like resolution
     2→inductive PrologTerm where
     3→  | atom : String -> PrologTerm
     4→  | var : String -> PrologTerm
     5→  | compound : String -> List PrologTerm -> PrologTerm
     6→
     7->partial def prologOccurs (name : String) : PrologTerm -> Bool
     8→    | PrologTerm.atom _ => false
     9→    | PrologTerm.var _ => PrologTerm.var name
    10→
    11→inductive PrologGoal where
    12→  | fact : PrologTerm -> PrologGoal
    13→  | rule : PrologTerm -> List PrologTerm -> PrologGoal
    14→        (facts : List (String × PrologTerm))
    15→    | goals.isEmpty => []
    16→
    17->def unify (t1 t2 : PrologTerm) : Option (List (String × PrologTerm)) :=
    18--   let rec doUnify (a b : PrologTerm) (bindings: List (String × PrologTerm)) : Option (List (String × PrologTerm)) :=
    19--    match a, b with
    20--        | some (_, t) => doUnify a b tbindings
    21--        | none => term
    22--      | PrologTerm.var m =>
    23--        | some ((n, t) => applyBindings tbindings
    24--        | _ => some ((n, t) ::bindings)
    25--        | PrologTerm.var m =>
    26--      | PrologTerm.var m =>
    27--          if n = m then some bindings else none
    28--        | PrologTerm.var n =>
    29--      | PrologTerm.var n =>
    30--def applyBindings (term : PrologTerm) (bindings : List (String × PrologTerm)) : PrologTerm :=
    31--  match term with
    32--  | PrologTerm.atom _ => term
    33--  | PrologTerm.var n =>
    34--    match bindings.find? (fun (name, _) => name = n) with
    35--      | some (_, t) => applyBindings t bindings
    36--        | none => term
    37--    | PrologTerm.var n =>
    38--      | PrologTerm.var n =>
    39--        if prologOccurs n t then some bindings else none
    40--        | _ => some bindings
    41--      | none => none
    42--    | _ => none
    43--  end
    44--
    45--def goals := [goal(PrologGoal.fact (PrologTerm.atom "parent") [PrologTerm.atom "alice"])]
    46--
    47--def rules := [
    48--  rule(PrologGoal.fact(PrologTerm.atom "parent") [PrologTerm.var "X", PrologTerm.var "Z"])
    49--
    50--def query1 := PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.atom "bob"]
    51--
    52--def result1 := unify query1 goals rules
    53--
    54--def query2 := PrologTerm.compound "parent" [PrologTerm.atom "alice", PrologTerm.atom "carol"]
    55--
    56--def result2 := unify query2 goals rules
    57--
    58--def x := (if result1.isEmpty then 0 else 1) + (if result2.isEmpty then 0 else 1) + goals.length + rules.length
    59--
    60--#eval s!"Goals: {goals}"
    61--#eval s!"Rules: {rules}"
    62--#eval s!"Result1 (parent alice bob): {result1.isEmpty}"
    63--#eval s!"Result2 (parent alice carol): {result2.isEmpty}"
    64--#eval s!"Total x: {x}"
