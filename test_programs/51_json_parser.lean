-- Test 51: JSON Parser (simplified)
inductive JsonValue where
  | null : JsonValue
  | bool : Bool → JsonValue
  | num : Nat → JsonValue
  | str : String → JsonValue
  | arr : List JsonValue → JsonValue
  | obj : List (String × JsonValue) → JsonValue
  deriving Repr

partial def jsonFormat : JsonValue → String
  | JsonValue.null => "null"
  | JsonValue.bool b => if b then "true" else "false"
  | JsonValue.num n => toString n
  | JsonValue.str s => "\"" ++ s ++ "\""
  | JsonValue.arr elems => "[" ++ String.intercalate ", " (elems.map jsonFormat) ++ "]"
  | JsonValue.obj fields => "{" ++ String.intercalate ", " (fields.map fun (k, v) => "\"" ++ k ++ "\": " ++ jsonFormat v) ++ "}"

partial def jsonDepth : JsonValue → Nat
  | JsonValue.null => 0
  | JsonValue.bool _ => 0
  | JsonValue.num _ => 0
  | JsonValue.str _ => 0
  | JsonValue.arr elems => 1 + (elems.map jsonDepth).foldl max 0
  | JsonValue.obj fields => 1 + (fields.map (jsonDepth ∘ (·.snd))).foldl max 0

partial def jsonSize : JsonValue → Nat
  | JsonValue.null => 1
  | JsonValue.bool _ => 1
  | JsonValue.num _ => 1
  | JsonValue.str _ => 1
  | JsonValue.arr elems => 1 + (elems.map jsonSize).sum
  | JsonValue.obj fields => 1 + (fields.map (jsonSize ∘ (·.snd))).sum

partial def jsonCountStrings : JsonValue → Nat
  | JsonValue.str _ => 1
  | JsonValue.arr elems => (elems.map jsonCountStrings).sum
  | JsonValue.obj fields => (fields.map (jsonCountStrings ∘ (·.snd))).sum
  | _ => 0

partial def jsonCountNumbers : JsonValue → Nat
  | JsonValue.num _ => 1
  | JsonValue.arr elems => (elems.map jsonCountNumbers).sum
  | JsonValue.obj fields => (fields.map (jsonCountNumbers ∘ (·.snd))).sum
  | _ => 0

def j1 := JsonValue.arr [
  JsonValue.num 1,
  JsonValue.num 2,
  JsonValue.num 3
]

def j2 := JsonValue.obj [
  ("name", JsonValue.str "Alice"),
  ("age", JsonValue.num 30),
  ("active", JsonValue.bool true),
  ("tags", JsonValue.arr [JsonValue.str "a", JsonValue.str "b"])
]

def j3 := JsonValue.obj [
  ("users", JsonValue.arr [
    JsonValue.obj [("id", JsonValue.num 1), ("name", JsonValue.str "Bob")],
    JsonValue.obj [("id", JsonValue.num 2), ("name", JsonValue.str "Carol")]
  ]),
  ("meta", JsonValue.obj [
    ("total", JsonValue.num 2),
    ("page", JsonValue.num 1)
  ])
]

def s1 := jsonFormat j1
def s2 := jsonFormat j2
def s3 := jsonFormat j3

def d1 := jsonDepth j1
def d2 := jsonDepth j2
def d3 := jsonDepth j3

def sz1 := jsonSize j1
def sz2 := jsonSize j2
def sz3 := jsonSize j3

def strCount := jsonCountStrings j3
def numCount := jsonCountNumbers j3

def x := d1 + d2 + d3 + sz1 + sz2 + sz3 + strCount + numCount

-- Output results
#eval s!"JSON 1: {s1}"
#eval s!"JSON 2: {s2}"
#eval s!"Depth 1: {d1}, Depth 2: {d2}, Depth 3: {d3}"
#eval s!"Size 1: {sz1}, Size 2: {sz2}, Size 3: {sz3}"
#eval s!"String count: {strCount}, Number count: {numCount}"
#eval s!"Total x: {x}"
