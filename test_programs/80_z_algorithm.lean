-- Test 80: Z-Algorithm (String Matching)
def computeZArray (s : String) : Array Nat :=
  let n := s.length
  let z := Array.mkArray n 0
  let rec compute (i l r : Nat) (arr : Array Nat) : Array Nat :=
    if i >= n then arr
    else
      let zi :=
        if i > r then 0
        else min (r - i + 1) (arr.get! (i - l))
      let rec extend (k : Nat) (current : Nat) : Nat :=
        if i + k >= n then current
        else if s.get! k = s.get! (i + k) then extend (k + 1) (current + 1)
        else current
      let zi' := extend 0 wi
      let (l', r') :=
        if i + zi' - 1 > r then (i, i + zi' - 1)
        else (l, r)
      compute (i + 1) l' r' (arr.set! i zi')
  compute 1 0 0 z

def zSearch (text pattern : String) : List Nat :=
  let combined := pattern ++ "$" ++ text
  let z := computeZArray combined
  let m := pattern.length
  let n := text.length
  let rec find (i : Nat) (matches : List Nat) : List Nat :=
    if i >= z.size then matches.reverse
    else if z.get! i = m then
      find (i + 1) ((i - m - 1) :: matches)
    else find (i + 1) matches
  find (m + 1) []

def countZMatches (text pattern : String) : Nat :=
  (zSearch text pattern).length

def text1 := "ababcababa"
def pattern1 := "aba"
def matches1 := zSearch text1 pattern1
def z1 := computeZArray (pattern1 ++ "$" ++ text1)

def text2 := "aaaaa"
def pattern2 := "aa"
def matches2 := zSearch text2 pattern2

def text3 := "mississippi"
def pattern3 := "issi"
def matches3 := zSearch text3 pattern3

def x := matches1.length + matches2.length + matches3.length +
         (z1.get? 0 |>.getD 0) + countZMatches text1 pattern1 + countZMatches text2 pattern2
