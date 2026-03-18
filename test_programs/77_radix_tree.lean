-- Test 77: Radix Tree (Prefix Tree for Bits)
inductive RadixNode where | mk : List Bool → Option Nat → List RadixNode → RadixNode

def bitsToString (bits : List Bool) : String :=
  String.intercalate "" (bits.map (fun b => if b then "1" else "0"))

def commonPrefix (bits1 bits2 : List Bool) : List Bool :=
  let rec find (b1 b2 acc : List Bool) : List Bool :=
    match b1, b2 with
    | [], _ | _, [] => acc.reverse
    | h1 :: t1, h2 :: t2 =>
      if h1 = h2 then find t1 t2 (h1 :: acc)
      else acc.reverse
  find bits1 bits2 []

def radixInsert (node : RadixNode) (bits : List Bool) (value : Nat) : RadixNode :=
  match node with
  | RadixNode.mk nodeBits nodeVal children =>
    let cp := commonPrefix bits nodeBits
    if cp.length = nodeBits.length then
      let remaining := bits.drop cp.length
      if remaining.isEmpty then
        RadixNode.mk nodeBits (some value) children
      else
        let matchingChild := children.find? (fun child =>
          match child with
          | RadixNode.mk cb _ _ =>
            !commonPrefix remaining cb |>.isEmpty
        )
        match matchingChild with
        | some child =>
          let newChild := radixInsert child remaining value
          let newChildren := children.map (fun c =>
            if c = child then newChild else c
          )
          RadixNode.mk nodeBits nodeVal newChildren
        | none =>
          let newChild := RadixNode.mk remaining (some value) []
          RadixNode.mk nodeBits nodeVal (newChild :: children)
    else
      RadixNode.mk cp nodeVal [
        RadixNode.mk (nodeBits.drop cp.length) nodeVal children,
        RadixNode.mk (bits.drop cp.length) (some value) []
      ]

def radixSearch (node : RadixNode) (bits : List Bool) : Option Nat :=
  match node with
  | RadixNode.mk nodeBits nodeVal children =>
    if bits.take nodeBits.length = nodeBits then
      let remaining := bits.drop nodeBits.length
      if remaining.isEmpty then nodeVal
      else
        let matchingChild := children.find? (fun child =>
          match child with
          | RadixNode.mk cb _ _ =>
            remaining.take cb.length = cb
        )
        match matchingChild with
        | some child => radixSearch child remaining
        | none => none
    else none

def natToBits (n : Nat) : List Bool :=
  let rec toBits (x : Nat) (acc : List Bool) : List Bool :=
    if x = 0 then if acc.isEmpty then [false] else acc
    else toBits (x / 2) ((x % 2 = 1) :: acc)
  toBits n []

def radixCount (node : RadixNode) : Nat :=
  match node with
  | RadixNode.mk _ nodeVal children =>
    (match nodeVal with | some _ => 1 | none => 0) +
    (children.map radixCount).sum

def radixDepth (node : RadixNode) : Nat :=
  match node with
  | RadixNode.mk _ _ [] => 1
  | RadixNode.mk _ _ children =>
    1 + (children.map radixDepth).foldl max 0

def rt1 := RadixNode.mk [] none []
def rt2 := radixInsert rt1 (natToBits 5) 5
def rt3 := radixInsert rt2 (natToBits 6) 6
def rt4 := radixInsert rt3 (natToBits 10) 10
def rt5 := radixInsert rt4 (natToBits 15) 15

def s1 := radixSearch rt5 (natToBits 5)
def s2 := radixSearch rt5 (natToBits 6)
def s3 := radixSearch rt5 (natToBits 10)
def s4 := radixSearch rt5 (natToBits 7)
def cnt := radixCount rt5
def dpt := radixDepth rt5

def x := (match s1 with | some n => n | none => 0) +
         (match s2 with | some n => n | none => 0) +
         (match s3 with | some n => n | none => 0) +
         (match s4 with | some n => n | none => 0) +
         cnt + dpt
