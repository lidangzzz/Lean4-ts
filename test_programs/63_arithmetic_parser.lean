-- Test 63: Parser Combinators (simulated)
inductive ParseResult where | mk : String → Nat → ParseResult

def parseChar (c : Char) (s : String) : Option ParseResult :=
  if s.length > 0 && s.get! 0 = c then
    some (ParseResult.mk (s.drop 1) 1)
  else none

def parseString (str : String) (s : String) : Option ParseResult :=
  if s.startsWith str then
    some (ParseResult.mk (s.drop str.length) str.length)
  else none

def parseAnyChar (chars : String) (s : String) : Option ParseResult :=
  if s.length > 0 && chars.contains (s.get! 0) then
    some (ParseResult.mk (s.drop 1) 1)
  else none

def parseMany (parser : String → Option ParseResult) (s : String) : ParseResult :=
  let rec loop (remaining : String) (count : Nat) : ParseResult :=
    match parser remaining with
    | some (ParseResult.mk rest c) => loop rest (count + c)
    | none => ParseResult.mk remaining count
  loop s 0

def parseMany1 (parser : String → Option ParseResult) (s : String) : Option ParseResult :=
  match parser s with
  | some (ParseResult.mk rest1 c1) =>
    let (ParseResult.mk rest2 c2) := parseMany parser rest1
    some (ParseResult.mk rest2 (c1 + c2))
  | none => none

def parseDigit (s : String) : Option ParseResult := parseAnyChar "0123456789" s

def parseDigits (s : String) : Option ParseResult := parseMany1 parseDigit s

def parseLetter (s : String) : Option ParseResult := parseAnyChar "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" s

def parseIdentifier (s : String) : Option ParseResult :=
  match parseLetter s with
  | some (ParseResult.mk rest1 c1) =>
    let (ParseResult.mk rest2 c2) := parseMany (fun x => parseLetter x <|> parseDigit x) rest1
    some (ParseResult.mk rest2 (c1 + c2))
  | none => none
where
  (<|>) (p1 p2 : String → Option ParseResult) (s : String) : Option ParseResult :=
    match p1 s with
    | some r => some r
    | none => p2 s

def parseWhitespace (s : String) : Option ParseResult := parseAnyChar " \t\n\r" s

def parseSpaces (s : String) : ParseResult := parseMany parseWhitespace s

def parseInt (s : String) : Option (ParseResult × Nat) :=
  let (ParseResult.mk s' _) := parseSpaces s
  match parseDigits s' with
  | some (ParseResult.mk rest count) =>
    let num := (s'.take count).toNat!
    let (ParseResult.mk rest' _) := parseSpaces rest
    some (ParseResult.mk rest' count, num)
  | none => none

def parseExpr (s : String) : Option (ParseResult × Nat) :=
  let rec parseTerm (s : String) : Option (ParseResult × Nat) :=
    match parseInt s with
    | some (rest, n) =>
      let (ParseResult.mk s' _) := parseSpaces (match rest with | ParseResult.mk r _ => r)
      match parseChar '+' s' with
      | some rest' => match parseTerm (match rest' with | ParseResult.mk r _ => r) with
        | some (_, n2) => some (rest', n + n2)
        | none => some (rest, n)
      | none => some (rest, n)
    | none => none
  parseTerm s

def test1 := "123"
def p1 := parseDigits test1
def test2 := "abc123"
def p2 := parseIdentifier test2
def test3 := "   456   "
def p3 := parseInt test3
def test4 := "1 + 2 + 3"
def p4 := parseExpr test4

def x := (match p1 with | some (ParseResult.mk _ c) => c | none => 0) +
         (match p2 with | some (ParseResult.mk _ c) => c | none => 0) +
         (match p3 with | some (_, n) => n | none => 0) +
         (match p4 with | some (_, n) => n | none => 0)
