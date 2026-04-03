-- Test 79: Boyer-Moore String Search (simplified)
partial def boyerMooreSearch (text pattern : String) : List Nat :=
  let n := text.length
  let m := pattern.length
  let rec search (i : Nat) (foundMatches : List Nat) : List Nat :=
    if i + m > n then foundMatches.reverse
    else
      let rec compare (j : Nat) : Bool :=
        if j >= m then true
        else if (text.drop (i + m - 1 - j)).take 1 == (pattern.drop (m - 1 - j)).take 1 then
          compare (j + 1)
        else false
      if compare 0 then
        search (i + 1) (i :: foundMatches)
      else
        search (i + 1) foundMatches
  search 0 []

def countOccurrencesBM (text pattern : String) : Nat :=
  (boyerMooreSearch text pattern).length

def text1 := "abracadabra"
def pattern1 := "abra"
def result1 := boyerMooreSearch text1 pattern1
def cnt1 := countOccurrencesBM text1 pattern1

def text2 := "aaaaaaaaaa"
def pattern2 := "aaa"
def result2 := boyerMooreSearch text2 pattern2
def cnt2 := countOccurrencesBM text2 pattern2

def text3 := "the quick brown fox jumps over the lazy dog"
def pattern3 := "the"
def result3 := boyerMooreSearch text3 pattern3
def cnt3 := countOccurrencesBM text3 pattern3

def x := cnt1 + cnt2 + cnt3 + result1.length + result2.length + result3.length
#eval x
