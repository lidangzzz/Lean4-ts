-- Test 85: Rabin-Karp String Matching
def rabinKarpHash (s : String) (base mod : Nat) : Nat :=
  s.toList.foldl (fun acc c => (acc * base + c.toNat) % mod) 0

def rabinKarpSearch (text pattern : String) : List Nat :=
  let n := text.length
  let m := pattern.length
  if m > n then []
  else
    let base := 256
    let mod := 1000000007
    let pHash := rabinKarpHash pattern base mod
    let rec computeHash (i : Nat) (h : Nat) : Nat :=
      if i >= m then h
      else computeHash (i + 1) ((h * base + (text.get! i).toNat) % mod)
    let initialHash := computeHash 0 0
    let highestPow := (List.range m).foldl (fun acc _ => (acc * base) % mod) 1
    let rec search (i : Nat) (tHash : Nat) (matches : List Nat) : List Nat :=
      if i + m > n then matches.reverse
      else
        let newHash :=
          if i = 0 then tHash
          else
            let old := (text.get! (i - 1)).toNat * highestPow % mod
            let new' := (text.get! (i + m - 1)).toNat
            ((tHash + mod - old) * base + new') % mod
        let isMatch :=
          if newHash = pHash then
            let rec check (j : Nat) : Bool :=
              if j >= m then true
              else if text.get! (i + j) ≠ pattern.get! j then false
              else check (j + 1)
            check 0
          else false
        if isMatch then
          search (i + 1) newHash (i :: matches)
        else
          search (i + 1) newHash matches
    search 0 initialHash []

def text1 := "GEEKS FOR GEEKS"
def pattern1 := "GEEK"
def matches1 := rabinKarpSearch text1 pattern1

def text2 := "ABABABABABA"
def pattern2 := "ABA"
def matches2 := rabinKarpSearch text2 pattern2

def text3 := "the quick brown fox"
def pattern3 := "fox"
def matches3 := rabinKarpSearch text3 pattern3

def x := matches1.length + matches2.length + matches3.length
