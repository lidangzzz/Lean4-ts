-- Test 14: Graph BFS traversal
def bfsAux : Graph → List Nat → List Nat → List Nat
  | _, [], visited => visited
  | g, h :: t, visited =>
    if visited.contains h then bfsAux g t visited
    else
      let visited := h :: visited
      let ns := neighbors g h
      let newQueue := t ++ ns
      bfsAux g newQueue visited

def bfs : Graph → Nat → List Nat
  | g, start => bfsAux g [start] []

def testGraph := Graph.mk [(1, [2, 3]), (2, [4, 5]), (3, [6]), (4, []), (5, []), (6, [])]
def traversal := bfs testGraph 1
def count := length traversal
def x := count
