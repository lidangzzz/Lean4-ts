-- Test 39: Trie (Prefix Tree) implementation
inductive Trie where | mk : Bool -> List (Char × Trie) -> Trie

def emptyTrie : Trie := Trie.mk false []

def trieFindChild : List (Char × Trie) -> Char -> Option Trie
  | [], _ => none
  | (c, t) :: rest, x =>
    if c = x then some t
    else trieFindChild rest x

-- Work with character lists instead of strings
def trieInsertChars : Trie -> List Char -> Trie
  | Trie.mk isEnd children, [] => Trie.mk true children
  | Trie.mk isEnd children, c :: rest =>
    match trieFindChild children c with
    | some child =>
      let newChild := trieInsertChars child rest
      let newChildren := children.map fun (ch, t) =>
        if ch = c then (ch, newChild) else (ch, t)
      if children.any fun (ch, _) => ch = c then
        Trie.mk isEnd newChildren
      else
        Trie.mk isEnd ((c, trieInsertChars emptyTrie rest) :: children)
    | none =>
      Trie.mk isEnd ((c, trieInsertChars emptyTrie rest) :: children)

def trieInsert (t : Trie) (s : String) : Trie :=
  trieInsertChars t s.toList

def trieContainsChars : Trie -> List Char -> Bool
  | Trie.mk isEnd _, [] => isEnd
  | Trie.mk _ children, c :: rest =>
    match trieFindChild children c with
    | some child => trieContainsChars child rest
    | none => false

def trieContains (t : Trie) (s : String) : Bool :=
  trieContainsChars t s.toList

def trieStartsWithChars : Trie -> List Char -> Bool
  | Trie.mk _ _, [] => true
  | Trie.mk _ children, c :: rest =>
    match trieFindChild children c with
    | some child => trieStartsWithChars child rest
    | none => false

def trieStartsWith (t : Trie) (s : String) : Bool :=
  trieStartsWithChars t s.toList

partial def trieCountWords : Trie -> Nat
  | Trie.mk isEnd children =>
    (if isEnd then 1 else 0) + (children.map (fun p => trieCountWords p.2)).sum

partial def trieCountNodes : Trie -> Nat
  | Trie.mk _ children => 1 + (children.map (fun p => trieCountNodes p.2)).sum

def words := ["cat", "car", "card", "care", "careful", "cars", "dog", "dodge", "door"]

def trie := words.foldl (fun t w => trieInsert t w) emptyTrie

def c1 := trieContains trie "cat"
def c2 := trieContains trie "car"
def c3 := trieContains trie "card"
def c4 := trieContains trie "careful"
def c5 := trieContains trie "ca"
def c6 := trieContains trie "cataract"
def c7 := trieContains trie "dog"
def c8 := trieContains trie "door"
def c9 := trieContains trie "dodge"
def c10 := trieContains trie "do"

def sw1 := trieStartsWith trie "ca"
def sw2 := trieStartsWith trie "do"
def sw3 := trieStartsWith trie "ze"

def wc := trieCountWords trie
def nc := trieCountNodes trie

def x := (if c1 then 1 else 0) + (if c2 then 1 else 0) + (if c3 then 1 else 0) +
         (if c4 then 1 else 0) + (if c5 then 1 else 0) + (if c6 then 1 else 0) +
         (if c7 then 1 else 0) + (if c8 then 1 else 0) + (if c9 then 1 else 0) +
         (if c10 then 1 else 0) + (if sw1 then 1 else 0) + (if sw2 then 1 else 0) +
         (if sw3 then 1 else 0) + wc + nc

-- Output results
#eval c1
#eval c2
#eval c3
#eval c4
#eval c5
#eval c6
#eval c7
#eval c8
#eval c9
#eval c10
#eval sw1
#eval sw2
#eval sw3
#eval wc
#eval nc
#eval x
