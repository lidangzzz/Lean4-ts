-- Test 60: Pattern Matching Engine
inductive Pattern where
  | wildcard : Pattern
  | literal : Nat → Pattern
  | variable : String → Pattern
  | constructor : String → List Pattern → Pattern

inductive Value where
  | literal : Nat → Value
  | constructor : String → List Value → Value

def matchPattern (pattern : Pattern) (value : Value) : Option (List (String × Value)) :=
  match pattern, value with
  | Pattern.wildcard, _ => some []
  | Pattern.literal p, Value.literal v =>
    if p = v then some [] else none
  | Pattern.variable name, v => some [(name, v)]
  | Pattern.constructor name1 patterns, Value.constructor name2 values =>
    if name1 = name2 && patterns.length = values.length then
      let pairs := patterns.zip values
      let results := pairs.map (fun (p, v) => matchPattern p v)
      if results.all (fun r => r.isSome) then
        some (results.foldl (fun acc r => acc ++ r.getD []) [])
      else none
    else none
  | _, _ => none

def patternSize : Pattern → Nat
  | Pattern.wildcard => 1
  | Pattern.literal _ => 1
  | Pattern.variable _ => 1
  | Pattern.constructor _ patterns => 1 + (patterns.map patternSize).sum

def valueSize : Value → Nat
  | Value.literal _ => 1
  | Value.constructor _ values => 1 + (values.map valueSize).sum

def countWildcards : Pattern → Nat
  | Pattern.wildcard => 1
  | Pattern.literal _ => 0
  | Pattern.variable _ => 0
  | Pattern.constructor _ patterns => (patterns.map countWildcards).sum

def countVariables : Pattern → Nat
  | Pattern.wildcard => 0
  | Pattern.literal _ => 0
  | Pattern.variable _ => 1
  | Pattern.constructor _ patterns => (patterns.map countVariables).sum

def p1 := Pattern.wildcard
def v1 := Value.literal 42
def m1 := matchPattern p1 v1

def p2 := Pattern.literal 5
def v2 := Value.literal 5
def m2 := matchPattern p2 v2

def p3 := Pattern.literal 5
def v3 := Value.literal 10
def m3 := matchPattern p3 v3

def p4 := Pattern.constructor "Some" [Pattern.variable "x"]
def v4 := Value.constructor "Some" [Value.literal 100]
def m4 := matchPattern p4 v4

def p5 := Pattern.constructor "Pair" [Pattern.wildcard, Pattern.variable "y"]
def v5 := Value.constructor "Pair" [Value.literal 1, Value.literal 2]
def m5 := matchPattern p5 v5

def p6 := Pattern.constructor "List" [Pattern.constructor "Cons" [Pattern.literal 1, Pattern.wildcard]]
def v6 := Value.constructor "List" [Value.constructor "Cons" [Value.literal 1, Value.constructor "Nil" []]]
def m6 := matchPattern p6 v6

def x := patternSize p1 + patternSize p2 + patternSize p4 + patternSize p5 + patternSize p6 +
         valueSize v1 + valueSize v4 + valueSize v5 + valueSize v6 +
         countWildcards p5 + countVariables p4 +
         (match m1 with | some _ => 1 | none => 0) +
         (match m2 with | some _ => 1 | none => 0) +
         (match m3 with | some _ => 1 | none => 0) +
         (match m4 with | some l => l.length | none => 0) +
         (match m5 with | some l => l.length | none => 0) +
         (match m6 with | some _ => 1 | none => 0)
