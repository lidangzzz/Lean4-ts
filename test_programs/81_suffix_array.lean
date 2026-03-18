-- Test 81: Suffix Array Construction
def buildSuffixArray (s : String) : Array Nat :=
  let n := s.length
  let sa := (List.range n).toArray
  sa.qsort (fun i j =>
    let rec compareSuffix (a b : Nat) : Bool :=
      if a >= n && b >= n then a < b
      else if a >= n then true
      else if b >= n then false
      else if s.get! a ≠ s.get! b then s.get! a < s.get! b
      else compareSuffix (a + 1) (b + 1)
    compareSuffix i j
  )

def buildLCPArray (s : String) (sa : Array Nat) : Array Nat :=
  let n := s.length
  let lcp := Array.mkArray n 0
  let rec compute (i h : Nat) (arr : Array Nat) : Array Nat :=
    if i >= n then arr
    else
      let sa_i := sa.get! i
      let rec calcLCP (j k len : Nat) : Nat :=
        if j >= n || k >= n then len
        else if s.get! j = s.get! k then calcLCP (j + 1) (k + 1) (len + 1)
        else len
      let lcp_i := calcLCP sa_i (sa.get! (i + 1)) 0
      compute (i + 1) (if lcp_i > 0 then lcp_i - 1 else 0) (arr.set! i lcp_i)
  compute 0 0 lcp

def s1 := "banana"
def sa1 := buildSuffixArray s1
def lcp1 := buildLCPArray s1 sa1

def s2 := "abracadabra"
def sa2 := buildSuffixArray s2
def lcp2 := buildLCPArray s2 sa2

def countDistinctSubstrings (s : String) (sa lcp : Array Nat) : Nat :=
  let n := s.length
  let rec count (i total : Nat) : Nat :=
    if i >= n then total
    else
      let suffixLen := n - sa.get! i
      let lcpVal := if i > 0 then lcp.get! (i - 1) else 0
      count (i + 1) (total + suffixLen - lcpVal)
  count 0 0

def ds1 := countDistinctSubstrings s1 sa1 lcp1
def ds2 := countDistinctSubstrings s2 sa2 lcp2

def x := sa1.size + sa2.size + lcp1.size + lcp2.size + ds1 + ds2
