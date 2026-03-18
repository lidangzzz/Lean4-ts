-- Test 50: Base64 Encoding/Decoding
def base64Chars : String := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

-- Get character at position using list operations
def getCharAt (s : String) (i : Nat) : Char :=
  s.toList.getD i 'A'

-- Find index of character in base64 alphabet
def findCharIndex (c : Char) : Nat :=
  let rec find (chars : List Char) (idx : Nat) : Nat :=
    match chars with
    | [] => 0
    | h :: t => if h = c then idx else find t (idx + 1)
  find base64Chars.toList 0

-- Base64 encode a string
def base64Encode (s : String) : String :=
  let bytes := s.toList.map Char.toNat
  let rec encode (remaining : List Nat) (acc : String) : String :=
    match remaining with
    | [] => acc
    | [b1] =>
      let i1 := b1 / 4
      let i2 := (b1 % 4) * 16
      acc ++ String.ofList [getCharAt base64Chars i1, getCharAt base64Chars i2, '=', '=']
    | [b1, b2] =>
      let i1 := b1 / 4
      let i2 := ((b1 % 4) * 16) + (b2 / 16)
      let i3 := (b2 % 16) * 4
      acc ++ String.ofList [getCharAt base64Chars i1, getCharAt base64Chars i2, getCharAt base64Chars i3, '=']
    | b1 :: b2 :: b3 :: rest =>
      let i1 := b1 / 4
      let i2 := ((b1 % 4) * 16) + (b2 / 16)
      let i3 := ((b2 % 16) * 4) + (b3 / 64)
      let i4 := b3 % 64
      encode rest (acc ++ String.ofList [
        getCharAt base64Chars i1,
        getCharAt base64Chars i2,
        getCharAt base64Chars i3,
        getCharAt base64Chars i4
      ])
  encode bytes ""

-- Base64 decode a string
def base64Decode (s : String) : String :=
  let chars := s.toList.filter (fun c => c ≠ '=')
  let rec decode (remaining : List Char) (acc : String) : String :=
    match remaining with
    | [] => acc
    | c1 :: c2 :: c3 :: c4 :: rest =>
      let i1 := findCharIndex c1
      let i2 := findCharIndex c2
      let i3 := findCharIndex c3
      let i4 := findCharIndex c4
      let b1 := i1 * 4 + i2 / 16
      let b2 := (i2 % 16) * 16 + i3 / 4
      let b3 := (i3 % 4) * 64 + i4
      decode rest (acc ++ String.ofList [Char.ofNat b1, Char.ofNat b2, Char.ofNat b3])
    | c1 :: c2 :: rest =>
      let i1 := findCharIndex c1
      let i2 := findCharIndex c2
      let b1 := i1 * 4 + i2 / 16
      decode rest (acc ++ String.ofList [Char.ofNat b1])
    | _ => acc
  decode chars ""

def test1 := "Hello"
def enc1 := base64Encode test1
def dec1 := base64Decode enc1
def match1 : Bool := test1 == dec1

def test2 := "Hello, World!"
def enc2 := base64Encode test2
def dec2 := base64Decode enc2
def match2 : Bool := test2 == dec2

def test3 := "The quick brown fox jumps over the lazy dog"
def enc3 := base64Encode test3
def dec3 := base64Decode enc3
def match3 : Bool := test3 == dec3

def test4 := "A"
def enc4 := base64Encode test4
def dec4 := base64Decode enc4
def match4 : Bool := test4 == dec4

def test5 := "AB"
def enc5 := base64Encode test5
def dec5 := base64Decode enc5
def match5 : Bool := test5 == dec5

def x := (if match1 = true then 1 else 0) + (if match2 = true then 1 else 0) +
         (if match3 = true then 1 else 0) + (if match4 = true then 1 else 0) +
         (if match5 = true then 1 else 0) + enc1.length + enc2.length + enc3.length

-- Output results
#eval s!"Test1: {test1} -> {enc1}"
#eval s!"Decoded: {dec1}, Match: {match1}"
#eval s!"Test2: {test2} -> {enc2}"
#eval s!"Decoded: {dec2}, Match: {match2}"
#eval s!"Test3 encoded length: {enc3.length}"
#eval s!"Decoded match: {match3}"
#eval s!"Total x: {x}"
