-- Test 20: Zip variations
def zip : List Nat → List Nat → List (Nat × Nat)
  | [], _ => []
  | _, [] => []
  | h1 :: t1, h2 :: t2 => (h1, h2) :: zip t1 t2

def zipWith : (Nat → Nat → Nat) → List Nat → List Nat → List Nat
  | _, [], _ => []
  | _, _, [] => []
  | f, h1 :: t1, h2 :: t2 => f h1 h2 :: zipWith f t1 t2

def unzip : List (Nat × Nat) → List Nat × List Nat
  | [] => ([], [])
  | (a, b) :: t =>
    let (as, bs) := unzip t
    (a :: as, b :: bs)

def l1 := [1, 2, 3, 4, 5]
def l2 := [10, 20, 30, 40, 50]
def zipped := zip l1 l2
def sums := zipWith (fun a b => a + b) l1 l2
def sumSums := sums.foldl (fun a b => a + b) 0
def unzipped : List Nat × List Nat := unzip zipped
def sumUnzipped := unzipped.1.foldl (fun a b => a + b) 0 + unzipped.2.foldl (fun a b => a + b) 0
def x := sumSums + sumUnzipped

-- Output results
#eval zipped
#eval sums
#eval sumSums
#eval unzipped
#eval sumUnzipped
#eval x
