-- Test 48: Huffman Coding (simplified)
inductive HuffTree where | leaf : Char → Nat → HuffTree | node : Nat → HuffTree → HuffTree → HuffTree
  deriving Inhabited, Repr

def huffWeight : HuffTree → Nat
  | HuffTree.leaf _ w => w
  | HuffTree.node w _ _ => w

def huffFreq (s : String) : List (Char × Nat) :=
  let chars := s.toList
  let freqs := chars.foldl (fun acc c =>
    let current := acc.find? (fun (ch, _) => ch = c)
    match current with
    | some (_, cnt) => acc.map (fun (ch, n) => if ch = c then (ch, n + 1) else (ch, n))
    | none => (c, 1) :: acc
  ) []
  freqs.toArray.qsort (fun a b => a.2 > b.2) |>.toList

partial def buildHuffAux (trees : List HuffTree) : HuffTree :=
  match trees with
  | [t] => t
  | _ =>
    let sorted := trees.toArray.qsort (fun a b => huffWeight a < huffWeight b) |>.toList
    match sorted with
    | t1 :: t2 :: rest =>
      let combined := HuffTree.node (huffWeight t1 + huffWeight t2) t1 t2
      buildHuffAux (combined :: rest)
    | _ => trees.head!

def buildHuff (freqs : List (Char × Nat)) : HuffTree :=
  let leaves := freqs.map (fun (c, w) => HuffTree.leaf c w)
  buildHuffAux leaves

def huffCodeLength : HuffTree → Nat → List (Char × Nat)
  | HuffTree.leaf c _, depth => [(c, depth)]
  | HuffTree.node _ l r, depth =>
    huffCodeLength l (depth + 1) ++ huffCodeLength r (depth + 1)

def avgCodeLength (s : String) : Nat :=
  let freqs := huffFreq s
  let tree := buildHuff freqs
  let codes := huffCodeLength tree 0
  let total := s.length
  let weightedSum := codes.foldl (fun acc (c, len) =>
    let cnt := (freqs.find? (fun (ch, _) => ch = c)).getD (c, 1) |>.snd
    acc + len * cnt) 0
  if total > 0 then (weightedSum * 100) / total else 0

def text1 := "AAAAABBBCCDAA"
def freq1 := huffFreq text1
def tree1 := buildHuff freq1
def codes1 := huffCodeLength tree1 0
def avg1 := avgCodeLength text1

def text2 := "the quick brown fox jumps over the lazy dog"
def freq2 := huffFreq text2
def tree2 := buildHuff freq2
def codes2 := huffCodeLength tree2 0
def avg2 := avgCodeLength text2

def text3 := "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
def freq3 := huffFreq text3
def tree3 := buildHuff freq3
def codes3 := huffCodeLength tree3 0
def avg3 := avgCodeLength text3

def x := codes1.length + codes2.length + codes3.length + avg1 + avg2 + avg3

-- Output results
#eval s!"Text1: {text1}"
#eval s!"Frequencies: {freq1}"
#eval s!"Code lengths: {codes1}"
#eval s!"Avg code length (x100): {avg1}"
#eval s!"Text2 avg code length (x100): {avg2}"
#eval s!"Text3 avg code length (x100): {avg3}"
#eval s!"Total x: {x}"
