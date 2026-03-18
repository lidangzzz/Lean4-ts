-- Test 86: KMP Pattern Matching
def computeLPS (pattern : String) : Array Nat :=
  let m := pattern.length
  let lps := Array.mkArray m 0
  let rec compute (i len : Nat) (arr : Array Nat) : Array Nat :=
    if i >= m then arr
    else
      let rec findLen (l : Nat) : Nat :=
        if l = 0 then 0
        else if pattern.get! (l - 1) = pattern.get! i then l
        else findLen (arr.get! (l - 1))
      let newLen := findLen len
      let newLen' := if pattern.get! i = pattern.get! newLen then newLen + 1 else newLen
      compute (i + 1) newLen' (arr.set! i newLen')
  compute 1 0 lps

def kmpSearch (text pattern : String) : List Nat :=
  let n := text.length
  let m := pattern.length
  if m = 0 || m > n then []
  else
    let lps := computeLPS pattern
    let rec search (i j : Nat) (matches : List Nat) : List Nat :=
      if i >= n then matches.reverse
      else if text.get! i = pattern.get! j then
        if j = m - 1 then
          search (i + 1) 0 ((i - m + 1) :: matches)
        else
          search (i + 1) (j + 1) matches
      else if j > 0 then
        search i (lps.get! (j - 1)) matches
      else
        search (i + 1) 0 matches
    search 0 0 []

def text1 := "ABABDABACDABABCABAB"
def pattern1 := "ABABCABAB"
def matches1 := kmpSearch text1 pattern1
def lps1 := computeLPS pattern1

def text2 := "AAAAAA"
def pattern2 := "AAA"
def matches2 := kmpSearch text2 pattern2

def text3 := "mississippi"
def pattern3 := "issip"
def matches3 := kmpSearch text3 pattern3

def x := matches1.length + matches2.length + matches3.length + lps1.size
