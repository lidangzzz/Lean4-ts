-- Test 79: Boyer-Moore String Search (simplified)
def buildBadCharTable (pattern : String) : Array Nat :=
  let table := Array.mkArray 256 pattern.length
  let chars := pattern.toList
  let indexed := chars.zipWithIndex
  indexed.foldl (fun acc (c, i) =>
    let shift := max 1 (pattern.length - 1 - i)
    acc.set! c.toNat shift
  ) table

def boyerMooreSearch (text pattern : String) : List Nat :=
  let badChar := buildBadCharTable pattern
  let n := text.length
  let m := pattern.length
  let rec search (i : Nat) (matches : List Nat) : List Nat :=
    if i + m > n then matches.reverse
    else
      let rec compare (j : Nat) (matched : Bool) : Bool :=
        if j >= m then true
        else if text.get! (i + m - 1 - j) = pattern.get! (m - 1 - j) then
          compare (j + 1) matched
        else false
      if compare 0 true then
        search (i + m) (i :: matches)
      else
        let c := text.get! (i + m - 1)
        let shift := badChar.get! c.toNat
        search (i + shift) matches
  search 0 []

def countOccurrencesBM (text pattern : String) : Nat :=
  (boyerMooreSearch text pattern).length

def text1 := "abracadabra"
def pattern1 := "abra"
def matches1 := boyerMooreSearch text1 pattern1
def cnt1 := countOccurrencesBM text1 pattern1

def text2 := "aaaaaaaaaa"
def pattern2 := "aaa"
def matches2 := boyerMooreSearch text2 pattern2
def cnt2 := countOccurrencesBM text2 pattern2

def text3 := "the quick brown fox jumps over the lazy dog"
def pattern3 := "the"
def matches3 := boyerMooreSearch text3 pattern3
def cnt3 := countOccurrencesBM text3 pattern3

def x := cnt1 + cnt2 + cnt3 + matches1.length + matches2.length + matches3.length
