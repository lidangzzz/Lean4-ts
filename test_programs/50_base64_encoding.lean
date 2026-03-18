-- Test 50: Base64 Encoding/Decoding
def base64Chars := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

def charAt (s : String) (i : Nat) : Char := s.get! i

def base64Encode (s : String) : String :=
  let bytes := s.toList.map Char.toNat
  let rec encodeBytes (remaining : List Nat) (acc : String) : String :=
    match remaining with
    | [] => acc
    | [b1] =>
      let i1 := b1 / 4
      let i2 := (b1 % 4) * 16
      acc ++ String.mk [charAt base64Chars i1, charAt base64Chars i2, '=', '=']
    | [b1, b2] =>
      let i1 := b1 / 4
      let i2 := ((b1 % 4) * 16) + (b2 / 16)
      let i3 := (b2 % 16) * 4
      acc ++ String.mk [charAt base64Chars i1, charAt base64Chars i2, charAt base64Chars i3, '=']
    | b1 :: b2 :: b3 :: rest =>
      let i1 := b1 / 4
      let i2 := ((b1 % 4) * 16) + (b2 / 16)
      let i3 := ((b2 % 16) * 4) + (b3 / 64)
      let i4 := b3 % 64
      encodeBytes rest (acc ++ String.mk [
        charAt base64Chars i1,
        charAt base64Chars i2,
        charAt base64Chars i3,
        charAt base64Chars i4
      ])
  encodeBytes bytes ""

def base64Index (c : Char) : Nat :=
  let idx := base64Chars.toList.indexOf? c
  idx.getD 0

def base64Decode (s : String) : String :=
  let chars := s.toList.filter (fun c => c ≠ '=')
  let rec decodeChars (remaining : List Char) (acc : String) : String :=
    match remaining with
    | [] => acc
    | c1 :: c2 :: c3 :: c4 :: rest =>
      let i1 := base64Index c1
      let i2 := base64Index c2
      let i3 := base64Index c3
      let i4 := base64Index c4
      let b1 := i1 * 4 + i2 / 16
      let b2 := (i2 % 16) * 16 + i3 / 4
      let b3 := (i3 % 4) * 64 + i4
      decodeChars rest (acc ++ String.mk [Char.ofNat b1, Char.ofNat b2, Char.ofNat b3])
    | c1 :: c2 :: rest =>
      let i1 := base64Index c1
      let i2 := base64Index c2
      let b1 := i1 * 4 + i2 / 16
      decodeChars rest (acc ++ String.mk [Char.ofNat b1])
    | _ => acc
  decodeChars chars ""

def test1 := "Hello"
def enc1 := base64Encode test1
def dec1 := base64Decode enc1
def match1 := test1 = dec1

def test2 := "Hello, World!"
def enc2 := base64Encode test2
def dec2 := base64Decode enc2
def match2 := test2 = dec2

def test3 := "The quick brown fox jumps over the lazy dog"
def enc3 := base64Encode test3
def dec3 := base64Decode enc3
def match3 := test3 = dec3

def test4 := "A"
def enc4 := base64Encode test4
def dec4 := base64Decode enc4
def match4 := test4 = dec4

def test5 := "AB"
def enc5 := base64Encode test5
def dec5 := base64Decode enc5
def match5 := test5 = dec5

def x := (if match1 then 1 else 0) + (if match2 then 1 else 0) +
         (if match3 then 1 else 0) + (if match4 then 1 else 0) +
         (if match5 then 1 else 0) + enc1.length + enc2.length + enc3.length
