-- Test 49: LZW Compression (simplified simulation)
def lzwInitDict : List (String × Nat) :=
  (List.range 256).map (fun i => (String.mk [Char.ofNat i], i))

def lzwLookup (dict : List (String × Nat)) (s : String) : Option Nat :=
  dict.find? (fun (str, _) => str = s) |>.map snd

def lzwAdd (dict : List (String × Nat)) (s : String) (code : Nat) : List (String × Nat) :=
  (s, code) :: dict

def lzwEncode (s : String) : List Nat :=
  let chars := s.toList
  let rec encode (remaining : List Char) (current : String) (dict : List (String × Nat)) (nextCode : Nat) (output : List Nat) : List Nat :=
    match remaining with
    | [] =>
      match lzwLookup dict current with
      | some code => code :: output
      | none => output
    | c :: rest =>
      let extended := current ++ String.mk [c]
      match lzwLookup dict extended with
      | some _ => encode rest extended dict nextCode output
      | none =>
        match lzwLookup dict current with
        | some code =>
          let newDict := lzwAdd dict extended nextCode
          encode rest (String.mk [c]) newDict (nextCode + 1) (code :: output)
        | none => encode rest (String.mk [c]) dict nextCode output
  (encode chars "" lzwInitDict 256 []).reverse

def lzwDecode (codes : List Nat) : String :=
  let initDict := lzwInitDict
  let rec decode (remaining : List Nat) (prev : String) (dict : List (String × Nat)) (nextCode : Nat) (output : String) : String :=
    match remaining with
    | [] => output
    | code :: rest =>
      let entry :=
        match lzwLookup dict (String.mk [Char.ofNat code]) with
        | some _ => String.mk [Char.ofNat code]
        | none =>
          match dict.find? (fun (_, c) => c = code) with
          | some (s, _) => s
          | none => prev ++ String.mk [prev.get! 0]
      let newOutput := output ++ entry
      let newDict := if nextCode < 4096 then lzwAdd dict (prev ++ entry.take 1) nextCode else dict
      decode rest entry newDict (nextCode + 1) newOutput
  match codes with
  | [] => ""
  | first :: rest =>
    let firstStr := String.mk [Char.ofNat first]
    decode rest firstStr lzwInitDict 256 firstStr

def test1 := "TOBEORNOTTOBEORTOBEORNOT"
def enc1 := lzwEncode test1
def encLen1 := enc1.length

def test2 := "ABABABABABABABABABABABABAB"
def enc2 := lzwEncode test2
def encLen2 := enc2.length

def test3 := "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
def enc3 := lzwEncode test3
def encLen3 := enc3.length

def x := encLen1 + encLen2 + encLen3 + (enc1.head? |>.getD 0) + (enc2.head? |>.getD 0) + (enc3.head? |>.getD 0)
