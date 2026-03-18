-- Test 78: Aho-Corasick Pattern Matching (simplified)
def buildFailureLinks (patterns : List String) : Array Nat :=
  let n := patterns.length
  Array.mkArray n 0

def ahoSearch (text : String) (patterns : List String) : List (Nat × String) :=
  let rec search (remaining : String) (pos : Nat) (matches : List (Nat × String)) : List (Nat × String) :=
    if remaining.isEmpty then matches.reverse
    else
      let c := remaining.get! 0
      let foundPatterns := patterns.filterIdx (fun idx p =>
        text.drop pos |>.take p.length = p
      )
      let newMatches := foundPatterns.map (fun (idx, p) => (pos, p))
      search (remaining.drop 1) (pos + 1) (newMatches ++ matches)
  search text 0 []

def countPatternOccurrences (text : String) (patterns : List String) : Nat :=
  (ahoSearch text patterns).length

def findAllPositions (text : String) (pattern : String) : List Nat :=
  let rec find (pos : Nat) (positions : List Nat) : List Nat :=
    if pos + pattern.length > text.length then positions.reverse
    else if text.drop pos |>.take pattern.length = pattern then
      find (pos + 1) (pos :: positions)
    else find (pos + 1) positions
  find 0 []

def text := "ababcababa"
def patterns := ["aba", "bab", "ab"]

def matches := ahoSearch text patterns
def cnt := countPatternOccurrences text patterns

def pos1 := findAllPositions text "aba"
def pos2 := findAllPositions text "ab"

def x := cnt + matches.length + pos1.length + pos2.length
