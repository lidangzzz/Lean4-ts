-- Test 93: Wavelet Tree (for rank/select queries)
inductive WaveletNode where | leaf | node : Array Nat → WaveletNode → WaveletNode → WaveletNode

def waveletBuild (arr : List Nat) (lo hi : Nat) : WaveletNode :=
  if lo >= hi || arr.isEmpty then WaveletNode.leaf
  else if lo = hi then WaveletNode.leaf
  else
    let mid := (lo + hi) / 2
    let left := arr.filter (fun x => x <= mid)
    let right := arr.filter (fun x => x > mid)
    let bitmap := arr.map (fun x => if x <= mid then 0 else 1)
    WaveletNode.node bitmap.toArray (waveletBuild left lo mid) (waveletBuild right (mid + 1) hi)

def waveletRank (t : WaveletNode) (val : Nat) (pos : Nat) (lo hi : Nat) : Nat :=
  match t with
  | WaveletNode.leaf => 0
  | WaveletNode.node bitmap left right =>
    if lo >= hi then 0
    else
      let mid := (lo + hi) / 2
      let bits := bitmap.take (pos + 1)
      if val <= mid then
        let leftPos := bits.foldl (fun acc b => if b = 0 then acc + 1 else acc) 0
        waveletRank left val (leftPos - 1) lo mid
      else
        let rightPos := bits.foldl (fun acc b => if b = 1 then acc + 1 else acc) 0
        waveletRank right val (rightPos - 1) (mid + 1) hi

def waveletCount (t : WaveletNode) : Nat :=
  match t with
  | WaveletNode.leaf => 0
  | WaveletNode.node bitmap left right =>
    bitmap.size + waveletCount left + waveletCount right

def arr := [2, 5, 1, 7, 4, 8, 3, 6]
def wt := waveletBuild arr 1 8

def cnt := waveletCount wt

def x := cnt + arr.sum
