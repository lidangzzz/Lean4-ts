-- Test 84: Longest Palindromic Substring
def isPalindrome (s : String) : Bool :=
  let n := s.length
  let rec check (i : Nat) : Bool :=
    if i >= n / 2 then true
    else if s.get! i ≠ s.get! (n - 1 - i) then false
    else check (i + 1)
  check 0

def longestPalindrome (s : String) : String :=
  let n := s.length
  let rec find (i maxLen maxStart : Nat) : Nat × Nat :=
    if i >= n then (maxLen, maxStart)
    else
      let rec expandOdd (l r len : Nat) : Nat :=
        if l = 0 || r >= n - 1 then len
        else if s.get! (l - 1) = s.get! (r + 1) then expandOdd (l - 1) (r + 1) (len + 2)
        else len
      let rec expandEven (l r len : Nat) : Nat :=
        if s.get! l ≠ s.get! r then 0
        else if l = 0 || r >= n - 1 then len
        else if s.get! (l - 1) = s.get! (r + 1) then expandEven (l - 1) (r + 1) (len + 2)
        else len
      let oddLen := expandOdd i i 1
      let evenLen := if i < n - 1 then expandEven i (i + 1) 2 else 0
      let newMax := if oddLen > maxLen then oddLen else if evenLen > maxLen then evenLen else maxLen
      let newStart :=
        if oddLen > maxLen then i - oddLen / 2
        else if evenLen > maxLen then i - evenLen / 2 + 1
        else maxStart
      find (i + 1) newMax newStart
  let (len, start) := find 0 0 0
  s.drop start |>.take len

def p1 := longestPalindrome "babad"
def p2 := longestPalindrome "cbbd"
def p3 := longestPalindrome "racecar"
def p4 := longestPalindrome "abcdef"

def x := p1.length + p2.length + p3.length + p4.length
