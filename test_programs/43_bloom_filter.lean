-- Test 43: Bloom Filter (probabilistic set membership)
def hash1 (s : String) : Nat :=
  s.toList.foldl (fun acc c => (acc * 31 + c.toNat) % 1000000007) 0

def hash2 (s : String) : Nat :=
  s.toList.foldl (fun acc c => (acc * 37 + c.toNat) % 1000000009) 0

def hash3 (s : String) : Nat :=
  s.toList.foldl (fun acc c => (acc * 41 + c.toNat) % 1000000021) 0

def bloomSize := 1000

def bloomInit : Array Bool := Array.mkArray bloomSize false

def bloomAdd (bf : Array Bool) (s : String) : Array Bool :=
  let h1 := hash1 s % bloomSize
  let h2 := hash2 s % bloomSize
  let h3 := hash3 s % bloomSize
  bf.set! h1 true |>.set! h2 true |>.set! h3 true

def bloomContains (bf : Array Bool) (s : String) : Bool :=
  let h1 := hash1 s % bloomSize
  let h2 := hash2 s % bloomSize
  let h3 := hash3 s % bloomSize
  bf.get! h1 && bf.get! h2 && bf.get! h3

def words := ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew"]

def bf := words.foldl bloomAdd bloomInit

def c1 := bloomContains bf "apple"
def c2 := bloomContains bf "banana"
def c3 := bloomContains bf "cherry"
def c4 := bloomContains bf "zebra"
def c5 := bloomContains bf "aardvark"
def c6 := bloomContains bf "fig"
def c7 := bloomContains bf "grapefruit"

def nums := ["1", "2", "3", "4", "5", "10", "20", "30", "40", "50"]
def bf2 := nums.foldl bloomAdd bloomInit

def c8 := bloomContains bf2 "1"
def c9 := bloomContains bf2 "5"
def c10 := bloomContains bf2 "100"

def x := (if c1 then 1 else 0) + (if c2 then 1 else 0) + (if c3 then 1 else 0) +
         (if c4 then 1 else 0) + (if c5 then 1 else 0) + (if c6 then 1 else 0) +
         (if c7 then 1 else 0) + (if c8 then 1 else 0) + (if c9 then 1 else 0) +
         (if c10 then 1 else 0)
