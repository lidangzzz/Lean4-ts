-- Test 11: Heapsort implementation
def parent : Nat → Nat := fun i => (i - 1) / 2
def leftChild : Nat → Nat := fun i => 2 * i + 1
def rightChild : Nat → Nat := fun i => 2 * i + 2

def heapify : List Nat → Nat → Nat → List Nat
  | arr, n, i =>
    let largest := i
    let l := leftChild i
    let r := rightChild i
    let largest := if l < n && arr.get? l > arr.get? largest then l else largest
    let largest := if r < n && arr.get? r > arr.get? largest then r else largest
    if largest != i then
      let temp := arr.get? i
      let arr := arr.set i (arr.get? largest)
      let arr := arr.set largest temp
      heapify arr n largest
    else arr

def buildHeap : List Nat → Nat → List Nat
  | arr, 0 => arr
  | arr, n + 1 => buildHeap (heapify arr (length arr) n) n

def heapsort : List Nat → List Nat
  | [] => []
  | arr =>
    let n := length arr
    let rec sort : List Nat → Nat → List Nat
      | arr, 0 => arr
      | arr, k =>
        let temp := arr.get? 0
        let arr := arr.set 0 (arr.get? (k - 1))
        let arr := arr.set (k - 1) temp
        let arr := heapify arr (k - 1) 0
        sort arr (k - 1)
    sort (buildHeap arr (n / 2)) n

-- Simple heap implementation using list
def x := 0
