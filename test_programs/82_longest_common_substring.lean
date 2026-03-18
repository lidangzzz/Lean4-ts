-- Test 82: Longest Common Substring
def longestCommonSubstring (s1 s2 : String) : String :=
  let n1 := s1.length
  let n2 := s2.length
  let rec find (i j maxLen maxEnd : Nat) : Nat × Nat :=
    if i >= n1 then (maxLen, maxEnd)
    else
      let rec checkJ (jInner maxLenInner maxEndInner : Nat) : Nat × Nat :=
        if jInner >= n2 then (maxLenInner, maxEndInner)
        else
          let rec count (k len : Nat) : Nat :=
            if i + k >= n1 || jInner + k >= n2 then len
            else if s1.get! (i + k) = s2.get! (jInner + k) then count (k + 1) (len + 1)
            else len
          let len := count 0 0
          if len > maxLenInner then
            checkJ (jInner + 1) len (i + len - 1)
          else
            checkJ (jInner + 1) maxLenInner maxEndInner
      let (newMaxLen, newMaxEnd) := checkJ j maxLen maxEnd
      find (i + 1) 0 newMaxLen newMaxEnd
  let (len, endPos) := find 0 0 0 0
  s1.drop (endPos + 1 - len) |>.take len

def lcs1 := longestCommonSubstring "abcdef" "xyzabc"
def lcs2 := longestCommonSubstring "banana" "apple"
def lcs3 := longestCommonSubstring "programming" "gram"
def lcs4 := longestCommonSubstring "hello world" "world hello"

def x := lcs1.length + lcs2.length + lcs3.length + lcs4.length
