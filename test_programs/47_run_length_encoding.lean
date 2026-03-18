-- Test 47: Run-Length Encoding
def rleEncode (s : String) : List (Char × Nat) :=
  let chars := s.toList
  let rec encode (remaining : List Char) (current : Char) (count : Nat) (acc : List (Char × Nat)) : List (Char × Nat) :=
    match remaining with
    | [] => (current, count) :: acc
    | c :: rest =>
      if c = current then encode rest current (count + 1) acc
      else encode rest c 1 ((current, count) :: acc)
  match chars with
  | [] => []
  | c :: rest => (encode rest c 1 []).reverse

def rleDecode (encoded : List (Char × Nat)) : String :=
  let chars := encoded.foldl (fun acc (c, n) =>
    acc ++ (List.range n |>.map (fun _ => c))) []
  String.ofList chars

def natToString (n : Nat) : String :=
  let rec digits (n : Nat) (acc : List Char) : List Char :=
    if n = 0 then if acc.isEmpty then ['0'] else acc
    else digits (n / 10) (Char.ofNat (n % 10 + Char.toNat '0') :: acc)
  String.ofList (digits n [])

def rleCompress (s : String) : String :=
  let encoded := rleEncode s
  let chars := encoded.foldl (fun acc (c, n) =>
    acc ++ [c] ++ (natToString n).toList) []
  String.ofList chars

def test1 := "AAAAABBBCCDAA"
def enc1 := rleEncode test1
def dec1 := rleDecode enc1
def match1 : Bool := test1 == dec1

def test2 := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
def enc2 := rleEncode test2
def dec2 := rleDecode enc2
def match2 : Bool := test2 == dec2

def test3 := "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
def enc3 := rleEncode test3
def dec3 := rleDecode enc3
def match3 : Bool := test3 == dec3

def test4 := "ABABABABABABABABABAB"
def enc4 := rleEncode test4
def dec4 := rleDecode enc4
def match4 : Bool := test4 == dec4

def encLen1 := enc1.length
def encLen2 := enc2.length
def encLen3 := enc3.length
def encLen4 := enc4.length

def x := (if match1 = true then 1 else 0) + (if match2 = true then 1 else 0) +
         (if match3 = true then 1 else 0) + (if match4 = true then 1 else 0) +
         encLen1 + encLen2 + encLen3 + encLen4

-- Output results
#eval s!"Test1: {test1} -> encoded: {enc1}"
#eval s!"Decoded: {dec1}, Match: {match1}"
#eval s!"Test2: {test2} -> encoded: {enc2}"
#eval s!"Decoded: {dec2}, Match: {match2}"
#eval s!"Test3 encoded length: {encLen3}, Match: {match3}"
#eval s!"Test4 encoded length: {encLen4}, Match: {match4}"
#eval s!"Total x: {x}"
