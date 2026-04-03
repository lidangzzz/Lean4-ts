-- Test 100: Advanced Bloom Filter with multiple hash functions
inductive BloomResult where | probablyPresent | definitelyAbsent

def hash1 (s : String) : Nat :=
  s.foldl (fun acc c => (acc * 31 + c.toNat) % 1000000007) 0

def hash2 (s : String) : Nat :=
  s.foldl (fun acc c => (acc * 37 + c.toNat) % 1000000009) 0

def hash3 (s : String) : Nat :=
  s.foldl (fun acc c => (acc * 41 + c.toNat) % 1000000021) 0

def bloomSize := 1000

def initBloom : List Bool := List.replicate bloomSize false

def setBit (bits : List Bool) (idx : Nat) : List Bool :=
  if idx < bits.length then
    bits.take idx ++ [true] ++ bits.drop (idx + 1)
  else bits

def bloomAdd (bits : List Bool) (s : String) : List Bool :=
  let h1 := hash1 s % bloomSize
  let h2 := hash2 s % bloomSize
  let h3 := hash3 s % bloomSize
  setBit (setBit (setBit bits h1) h2) h3

def bloomContains (bits : List Bool) (s : String) : Bool :=
  let h1 := hash1 s % bloomSize
  let h2 := hash2 s % bloomSize
  let h3 := hash3 s % bloomSize
  let checkBit (idx : Nat) : Bool :=
    if idx < bits.length then bits.getD idx false else false
  checkBit h1 && checkBit h2 && checkBit h3

def bloomCheck (bits : List Bool) (s : String) : BloomResult :=
  if bloomContains bits s then BloomResult.probablyPresent
  else BloomResult.definitelyAbsent

def testWords := ["apple", "banana", "cherry", "date", "elderberry"]

def bloom1 := testWords.foldl bloomAdd initBloom

def r1 := bloomCheck bloom1 "apple"
def r2 := bloomCheck bloom1 "banana"
def r3 := bloomCheck bloom1 "fig"
def r4 := bloomCheck bloom1 "grape"

def countResult : BloomResult -> Nat
  | BloomResult.probablyPresent => 1
  | BloomResult.definitelyAbsent => 0

def x := countResult r1 + countResult r2 + countResult r3 + countResult r4

#eval r1
#eval r2
#eval r3
#eval r4
#eval x
