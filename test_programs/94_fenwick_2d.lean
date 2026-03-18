-- Test 94: 2D Fenwick Tree
def fenwick2DBuild (n m : Nat) : Array (Array Nat) :=
  Array.mkArray n (Array.mkArray m 0)

def fenwick2DUpdate (ft : Array (Array Nat)) (x y delta : Nat) : Array (Array Nat) :=
  let n := ft.size
  let rec updateRow (i : Nat) (arr : Array (Array Nat)) : Array (Array Nat) :=
    if i >= n then arr
    else
      let m := (arr.get! i).size
      let rec updateCol (j : Nat) (row : Array Nat) : Array Nat :=
        if j >= m then row
        else
          updateCol (j + (j + 1).land (j.xor (j + 1))) (row.set! j (row.get! j + delta))
      let newRow := updateCol y (arr.get! i)
      updateRow (i + (i + 1).land (i.xor (i + 1))) (arr.set! i newRow)
  updateRow x ft

def fenwick2DSum (ft : Array (Array Nat)) (x y : Nat) : Nat :=
  let rec sumRow (i : Nat) (total : Nat) : Nat :=
    if i = 0 then total
    else
      let row := ft.get! (i - 1)
      let rec sumCol (j : Nat) (t : Nat) : Nat :=
        if j = 0 then t
        else sumCol (j - (j).land (j.xor (j - 1))) (t + row.get! (j - 1))
      sumRow (i - (i).land (i.xor (i - 1))) (total + sumCol (y + 1) 0)
  sumRow (x + 1) 0

def ft0 := fenwick2DBuild 4 4
def ft1 := fenwick2DUpdate ft0 1 1 5
def ft2 := fenwick2DUpdate ft1 2 2 10
def ft3 := fenwick2DUpdate ft2 3 3 15

def s1 := fenwick2DSum ft3 3 3
def s2 := fenwick2DSum ft3 2 2
def s3 := fenwick2DSum ft3 1 1

def x := s1 + s2 + s3
