-- Test 42: Skip List implementation (simplified)
inductive SkipNode where | mk : Nat → List SkipNode → SkipNode
  deriving Repr

def skipHeight (n : SkipNode) : Nat :=
  match n with | SkipNode.mk _ nexts => 1 + (nexts.map skipHeight).foldl max 0

partial def skipContains (levels : List SkipNode) (target : Nat) : Bool :=
  match levels with
  | [] => false
  | SkipNode.mk v nexts :: rest =>
    if v = target then true
    else if v < target then skipContains nexts target  -- Search in lower level
    else skipContains rest target  -- Search next at this level

partial def skipInsert (levels : List SkipNode) (v : Nat) (height : Nat) : List SkipNode :=
  match levels, height with
  | [], _ => [SkipNode.mk v []]
  | (SkipNode.mk headVal nexts) :: rest, h =>
    if v < headVal then SkipNode.mk v [] :: levels
    else SkipNode.mk headVal (skipInsert nexts v (h - 1)) :: rest

def randomHeight (seed : Nat) : Nat :=
  let rec loop (s : Nat) (h : Nat) : Nat :=
    if h >= 4 then h
    else if s % 2 = 0 then loop (s / 2) (h + 1)
    else h
  loop seed 1

def buildSkipList (xs : List Nat) : List SkipNode :=
  xs.foldl (fun (levels : List SkipNode) (x : Nat) =>
    let h := randomHeight (x * 17 + 31)
    skipInsert levels x h) []

def sl1 := buildSkipList [1, 3, 5, 7, 9, 2, 4, 6, 8, 10]

def x := sl1.length * 10 + (match sl1 with | [] => 0 | h :: _ => skipHeight h)

-- Output results
#eval s!"Skip list length: {sl1.length}"
#eval s!"First element height: {match sl1 with | [] => 0 | h :: _ => skipHeight h}"
#eval s!"Contains 3: {skipContains sl1 3}"
#eval s!"Contains 7: {skipContains sl1 7}"
#eval s!"Contains 100: {skipContains sl1 100}"
#eval s!"Computed x: {x}"
