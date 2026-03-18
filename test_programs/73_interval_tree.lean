-- Test 73: Interval Tree
inductive Interval where | mk : Int → Int → Interval

def intervalStart : Interval → Int | Interval.mk s _ => s
def intervalEnd : Interval → Int | Interval.mk _ e => e

def intervalsOverlap (i1 i2 : Interval) : Bool :=
  intervalStart i1 <= intervalEnd i2 && intervalStart i2 <= intervalEnd i1

def intervalContains (i : Interval) (p : Int) : Bool :=
  intervalStart i <= p && p <= intervalEnd i

def intervalLength (i : Interval) : Nat :=
  (intervalEnd i - intervalStart i).toNat

inductive IntervalTree where | leaf | node : Interval → Int → IntervalTree → IntervalTree → IntervalTree

def maxEnd : IntervalTree → Int
  | IntervalTree.leaf => 0
  | IntervalTree.node _ maxE _ _ => maxE

def intervalInsert (tree : IntervalTree) (i : Interval) : IntervalTree :=
  match tree with
  | IntervalTree.leaf =>
    IntervalTree.node i (intervalEnd i) IntervalTree.leaf IntervalTree.leaf
  | IntervalTree.node interval maxE left right =>
    if intervalStart i < intervalStart interval then
      let newLeft := intervalInsert left i
      IntervalTree.node interval (max maxE (maxEnd newLeft)) newLeft right
    else
      let newRight := intervalInsert right i
      IntervalTree.node interval (max maxE (maxEnd newRight)) left newRight

def intervalSearch (tree : IntervalTree) (i : Interval) : Option Interval :=
  match tree with
  | IntervalTree.leaf => none
  | IntervalTree.node interval _ left right =>
    if intervalsOverlap interval i then some interval
    else if intervalStart i > maxEnd left then intervalSearch right i
    else
      match intervalSearch left i with
      | some result => some result
      | none => intervalSearch right i

def findAllOverlapping (tree : IntervalTree) (i : Interval) : List Interval :=
  match tree with
  | IntervalTree.leaf => []
  | IntervalTree.node interval _ left right =>
    let inLeft := findAllOverlapping left i
    let inRight := findAllOverlapping right i
    if intervalsOverlap interval i then interval :: inLeft ++ inRight
    else inLeft ++ inRight

def intervals := [
  Interval.mk 15 20, Interval.mk 10 30, Interval.mk 17 19,
  Interval.mk 5 20, Interval.mk 12 15, Interval.mk 30 40
]

def tree := intervals.foldl intervalInsert IntervalTree.leaf

def query1 := Interval.mk 14 16
def result1 := intervalSearch tree query1
def all1 := findAllOverlapping tree query1

def query2 := Interval.mk 21 23
def result2 := intervalSearch tree query2

def query3 := Interval.mk 35 45
def result3 := intervalSearch tree query3
def all3 := findAllOverlapping tree query3

def x := (match result1 with | some _ => 1 | none => 0) +
         (match result2 with | some _ => 1 | none => 0) +
         (match result3 with | some _ => 1 | none => 0) +
         all1.length + all3.length
