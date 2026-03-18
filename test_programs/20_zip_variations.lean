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
def sumSums := foldl (fun a b => a + b) 0 sums
def (unzipped1, unzipped2) := unzip zipped
def sumUnzipped := foldl (fun a b => a + b) 0 unzipped1 + foldl (fun a b => a + b) 0 unzipped2
def x := sumSums + sumUnzipped
