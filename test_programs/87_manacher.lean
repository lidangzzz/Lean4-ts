-- Test 87: Manacher's Algorithm (Longest Palindromic Substring)
def manacher (s : String) : Nat :=
  let n := s.length
  let t := "#" ++ String.intercalate "#" (s.toList.map String.mk) ++ "#"
  let m := t.length
  let p := Array.mkArray m 0
  let rec process (i center right : Nat) (arr : Array Nat) : Nat :=
    if i >= m then (arr.toList).foldl max 0
    else
      let mirror := 2 * center - i
      let baseLen :=
        if i < right then min (right - i) (arr.get! mirror)
        else 0
      let rec expand (l r len : Nat) : Nat :=
        if l = 0 || r >= m - 1 then len
        else if t.get! (l - 1) = t.get! (r + 1) then expand (l - 1) (r + 1) (len + 2)
        else len
      let newLen := expand (i - baseLen) (i + baseLen) baseLen
      let (newCenter, newRight) :=
        if i + newLen / 2 > right then (i, i + newLen / 2)
        else (center, right)
      process (i + 1) newCenter newRight (arr.set! i newLen)
  process 0 0 0 p

def m1 := manacher "babad"
def m2 := manacher "cbbd"
def m3 := manacher "a"
def m4 := manacher "ac"
def m5 := manacher "racecar"
def m6 := manacher "aaaa"

def x := m1 + m2 + m3 + m4 + m5 + m6
