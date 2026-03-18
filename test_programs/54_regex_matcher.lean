-- Test 54: Regex Matcher (simplified pattern matching)
def matchChar (c : Char) (s : String) : Bool :=
  s.length > 0 && s.get! 0 = c

def matchDot (s : String) : Bool := s.length > 0

def matchLiteral (pattern : String) (s : String) : Bool :=
  s.startsWith pattern

def matchAnyOf (chars : String) (s : String) : Bool :=
  s.length > 0 && chars.contains (s.get! 0)

def matchNoneOf (chars : String) (s : String) : Bool :=
  s.length > 0 && !chars.contains (s.get! 0)

def matchDigit (s : String) : Bool :=
  s.length > 0 && (s.get! 0).isDigit

def matchAlpha (s : String) : Bool :=
  s.length > 0 && (s.get! 0).isAlpha

def matchWhitespace (s : String) : Bool :=
  s.length > 0 && (s.get! 0).isWhitespace

def matchStar (matcher : String → Bool) (s : String) : List String :=
  let rec loop (remaining : String) (acc : List String) : List String :=
    if remaining.isEmpty then remaining :: acc
    else if matcher remaining then
      let rest := remaining.drop 1
      loop rest (remaining :: acc)
    else remaining :: acc
  loop s []

def matchPlus (matcher : String → Bool) (s : String) : List String :=
  if matcher s then (matchStar matcher (s.drop 1)).map (s.take 1 ++ ·) else []

def matchOptional (matcher : String → Bool) (s : String) : List String :=
  if matcher s then [s.take 1, ""] else [""]

def countMatches (pattern : String → Bool) (text : String) : Nat :=
  let rec count (pos : Nat) (acc : Nat) : Nat :=
    if pos >= text.length then acc
    else
      let substr := text.drop pos
      if pattern substr then count (pos + 1) (acc + 1)
      else count (pos + 1) acc
  count 0 0

def findAllDigits (s : String) : Nat := countMatches matchDigit s

def findAllAlpha (s : String) : Nat := countMatches matchAlpha s

def findAllWhitespace (s : String) : Nat := countMatches matchWhitespace s

def text1 := "Hello 123 World 456 Test 789"
def d1 := findAllDigits text1
def a1 := findAllAlpha text1
def w1 := findAllWhitespace text1

def text2 := "   abc   def   ghi   "
def d2 := findAllDigits text2
def a2 := findAllAlpha text2
def w2 := findAllWhitespace text2

def text3 := "1a2b3c4d5e6f7g8h9i0j"
def d3 := findAllDigits text3
def a3 := findAllAlpha text3
def w3 := findAllWhitespace text3

def x := d1 + a1 + w1 + d2 + a2 + w2 + d3 + a3 + w3
