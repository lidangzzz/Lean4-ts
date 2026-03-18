-- Test 83: Edit Distance (Levenshtein)
def editDistance (s1 s2 : String) : Nat :=
  let n1 := s1.length
  let n2 := s2.length
  let dp := Array.mkArray (n1 + 1) (Array.mkArray (n2 + 1) 0)
  let dp1 := (List.range (n1 + 1)).foldl (fun acc i =>
    acc.set! i ((acc.get! i).set! 0 i)
  ) dp
  let dp2 := (List.range (n2 + 1)).foldl (fun acc j =>
    acc.set! 0 ((acc.get! 0).set! j j)
  ) dp1
  let dp3 := (List.range n1).foldl (fun acc1 i =>
    (List.range n2).foldl (fun acc2 j =>
      let cost := if s1.get! i = s2.get! j then 0 else 1
      let del := (acc2.get! i).get! (j + 1) + 1
      let ins := (acc2.get! (i + 1)).get! j + 1
      let sub := (acc2.get! i).get! j + cost
      let minVal := min (min del ins) sub
      acc2.set! (i + 1) ((acc2.get! (i + 1)).set! (j + 1) minVal)
    ) acc1
  ) dp2
  (dp3.get! n1).get! n2

def d1 := editDistance "kitten" "sitting"
def d2 := editDistance "saturday" "sunday"
def d3 := editDistance "algorithm" "logarithm"
def d4 := editDistance "" "hello"
def d5 := editDistance "hello" "hello"
def d6 := editDistance "abc" "xyz"

def x := d1 + d2 + d3 + d4 + d5 + d6
