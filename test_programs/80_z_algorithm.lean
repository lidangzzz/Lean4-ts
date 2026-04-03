-- Test 80: Z-Algorithm (simplified)
partial def zSearch (text pattern : String) : List Nat :=
  let n := text.length
  let m := pattern.length
  let rec find (i : Nat) (found : List Nat) : List Nat :=
    if i + m > n then found.reverse
    else
      let sub := (text.drop i).take m
      if sub == pattern then
        find (i + 1) (i :: found)
      else
        find (i + 1) found
  find 0 []

def countMatches (text pattern : String) : Nat :=
  (zSearch text pattern).length

def text1 := "ababcababa"
def pattern1 := "aba"
def result1 := zSearch text1 pattern1
def cnt1 := countMatches text1 pattern1

def text2 := "aaaaa"
def pattern2 := "aa"
def result2 := zSearch text2 pattern2
def cnt2 := countMatches text2 pattern2

def text3 := "mississippi"
def pattern3 := "issi"
def result3 := zSearch text3 pattern3
def cnt3 := countMatches text3 pattern3

def x := cnt1 + cnt2 + cnt3 + result1.length + result2.length + result3.length
#eval x
