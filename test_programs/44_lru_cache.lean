-- Test 44: LRU Cache simulation
inductive CacheEntry where | mk : Nat → Nat → CacheEntry

def entryKey : CacheEntry → Nat | CacheEntry.mk k _ => k
def entryVal : CacheEntry → Nat | CacheEntry.mk _ v => v

def cacheSize := 5

def cacheGet (cache : List CacheEntry) (key : Nat) : Option (Nat × List CacheEntry) :=
  match cache with
  | [] => none
  | e :: rest =>
    if entryKey e = key then
      some (entryVal e, e :: rest.filter (fun x => entryKey x ≠ key))
    else
      match cacheGet rest key with
      | some (v, newRest) => some (v, e :: newRest)
      | none => none

def cachePut (cache : List CacheEntry) (key val : Nat) : List CacheEntry :=
  let filtered := cache.filter (fun e => entryKey e ≠ key)
  let newEntry := CacheEntry.mk key val
  if filtered.length >= cacheSize then
    newEntry :: filtered.take (cacheSize - 1)
  else
    newEntry :: filtered

def cacheContains (cache : List CacheEntry) (key : Nat) : Bool :=
  cache.any (fun e => entryKey e = key)

def cacheSize' (cache : List CacheEntry) : Nat := cache.length

def ops := [
  (1, 10), (2, 20), (3, 30), (4, 40), (5, 50),
  (1, 0),  -- get 1
  (6, 60), -- evicts 2 (least recently used)
  (2, 0),  -- get 2 (miss)
  (3, 0),  -- get 3
  (7, 70), -- evicts 4
  (4, 0),  -- get 4 (miss)
  (1, 0)   -- get 1
]

def processOps : List CacheEntry → List (Nat × Nat) → List CacheEntry
  | cache, [] => cache
  | cache, (k, v) :: rest =>
    if v = 0 then
      match cacheGet cache k with
      | some (_, newCache) => processOps newCache rest
      | none => processOps cache rest
    else
      processOps (cachePut cache k v) rest

def finalCache := processOps [] ops

def c1 := cacheContains finalCache 1
def c2 := cacheContains finalCache 2
def c3 := cacheContains finalCache 3
def c4 := cacheContains finalCache 4
def c5 := cacheContains finalCache 5
def c6 := cacheContains finalCache 6
def c7 := cacheContains finalCache 7

def sz := cacheSize' finalCache

def x := (if c1 then 1 else 0) + (if c2 then 1 else 0) + (if c3 then 1 else 0) +
         (if c4 then 1 else 0) + (if c5 then 1 else 0) + (if c6 then 1 else 0) +
         (if c7 then 1 else 0) + sz

-- Output results
#eval s!"Contains 1: {c1}"
#eval s!"Contains 2: {c2}"
#eval s!"Contains 3: {c3}"
#eval s!"Contains 4: {c4}"
#eval s!"Contains 5: {c5}"
#eval s!"Contains 6: {c6}"
#eval s!"Contains 7: {c7}"
#eval s!"Cache size: {sz}"
#eval s!"Total x: {x}"
