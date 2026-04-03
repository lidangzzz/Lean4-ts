-- Test 78: Aho-Corasick Pattern Matching (simplified)
partial def findAllPositions (text : String) (pattern : String) : List Nat :=
  let rec find (pos : Nat) (positions : List Nat) : List Nat :=
    if pos + pattern.length > text.length then positions.reverse
    else
      let isMatch : Bool := (text.drop pos).take pattern.length == pattern
      if isMatch then
        find (pos + 1) (pos :: positions)
      else find (pos + 1) positions
  find 0 []

def countPattern (text : String) (pattern : String) : Nat :=
  (findAllPositions text pattern).length

def text := "ababcababa"
def patterns := ["aba", "bab", "ab"]

def cnt1 := countPattern text "aba"
def cnt2 := countPattern text "bab"
def cnt3 := countPattern text "ab"

def pos1 := findAllPositions text "aba"
def pos2 := findAllPositions text "ab"

def x := cnt1 + cnt2 + cnt3 + pos1.length + pos2.length
#eval x
