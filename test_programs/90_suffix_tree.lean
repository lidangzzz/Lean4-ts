-- Test 90: Suffix Tree (simplified Ukkonen)
inductive SuffixNode where | mk : List (String × SuffixNode) → SuffixNode

def suffixTreeBuild (s : String) : SuffixNode :=
  let n := s.length
  let rec addSuffix (node : SuffixNode) (suffix : String) : SuffixNode :=
    match node with
    | SuffixNode.mk children =>
      let matching := children.find? (fun (edge, _) => suffix.take 1 = edge.take 1)
      match matching with
      | some (edge, child) =>
        let cp := edge.zip suffix |>.takeWhile (fun (a, b) => a = b) |>.map fst
        let edgePrefix := String.mk cp
        if edgePrefix.length = edge.length then
          let remaining := suffix.drop edgePrefix.length
          SuffixNode.mk (children.map (fun (e, c) =>
            if e = edge then (e, addSuffix c remaining) else (e, c)
          ))
        else
          let edgeSuffix := edge.drop edgePrefix.length
          let suffixSuffix := suffix.drop edgePrefix.length
          let newChild := SuffixNode.mk [
            (edgeSuffix, child),
            (suffixSuffix, SuffixNode.mk [])
          ]
          SuffixNode.mk (children.map (fun (e, c) =>
            if e = edge then (edgePrefix, newChild) else (e, c)
          ))
      | none =>
        SuffixNode.mk ((suffix, SuffixNode.mk []) :: children)
  let suffixes := (List.range n).map (fun i => s.drop i)
  suffixes.foldl addSuffix (SuffixNode.mk [])

def suffixTreeCount (node : SuffixNode) : Nat :=
  match node with
  | SuffixNode.mk children =>
    1 + (children.map (fun (_, child) => suffixTreeCount child)).sum

def suffixTreeDepth (node : SuffixNode) : Nat :=
  match node with
  | SuffixNode.mk [] => 1
  | SuffixNode.mk children =>
    1 + (children.map (fun (_, child) => suffixTreeDepth child)).foldl max 0

def st1 := suffixTreeBuild "banana"
def c1 := suffixTreeCount st1
def d1 := suffixTreeDepth st1

def st2 := suffixTreeBuild "abc"
def c2 := suffixTreeCount st2
def d2 := suffixTreeDepth st2

def x := c1 + d1 + c2 + d2
