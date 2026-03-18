# Lean4 Compiler (TypeScript Implementation)

A TypeScript implementation of a Lean4 language compiler and interpreter. This project provides lexing, parsing, and evaluation capabilities for a substantial subset of the Lean4 programming language, including support for dependent types, pattern matching, higher-order functions, and more.

## Features

### Core Language Features

- **Lexical Analysis**: Full tokenizer for Lean4 syntax
- **Parsing**: Complete parser producing an Abstract Syntax Tree (AST)
- **Evaluation**: Interpreter for executing Lean4 programs

### Supported Constructs

- **Definitions**: `def`, `theorem`, `axiom`, `constant`
- **Types**: `Type`, `Sort`, `Prop`, dependent types (Pi types, Sigma types)
- **Functions**: Lambda expressions, higher-order functions, currying
- **Pattern Matching**: Comprehensive pattern matching with:
  - Wildcard patterns
  - Literal patterns
  - Constructor patterns
  - Tuple patterns
  - Array patterns
  - N+K patterns (e.g., `n + 1`)
  - Nested patterns
- **Control Flow**: `if`/`then`/`else`, `match`/`with`
- **Data Structures**:
  - Inductive types
  - Structures
  - Tuples
  - Arrays and Lists
- **Type Classes**: Class declarations and instances
- **Namespaces**: Namespace declarations and `open` statements
- **Commands**: `#eval`, `#print`, `#check`, `#reduce`

### Built-in Operations

- **Arithmetic**: `+`, `-`, `*`, `/`, `%`, `^`
- **Comparison**: `=`, `≠`, `<`, `≤`, `>`, `≥`
- **Boolean**: `&&`, `||`, `!`
- **List Operations**: `map`, `filter`, `foldl`, `length`, `sum`, `range`, `append`, `zip`, `head?`, `tail?`
- **Array Operations**: `get`, `set`, `push`, `size`
- **String Operations**: `append`, `length`, `toList`, `intercalate`, `splitOn`, `contains`, `replace`
- **Natural Number Operations**: `Nat.add`, `Nat.sub`, `Nat.mul`, `Nat.div`, `Nat.mod`

## Project Structure

```
browser_test/
├── src/
│   ├── index.ts           # Main entry point and CLI
│   ├── lexer/
│   │   ├── lexer.ts       # Tokenizer implementation
│   │   └── tokens.ts      # Token type definitions
│   ├── parser/
│   │   ├── ast.ts         # Abstract Syntax Tree definitions
│   │   └── parser.ts      # Parser implementation
│   ├── types/
│   │   └── types.ts       # Type system and value representations
│   ├── evaluator/
│   │   └── evaluator.ts   # Interpreter/evaluator
│   ├── elaborator/
│   │   └── elaborator.ts  # Type elaboration
│   └── compiler/
│       └── compiler.ts    # Main compiler orchestrator
├── tests/
│   └── compiler.test.ts   # Unit tests
├── test_programs/         # 100+ Lean4 test programs
├── comprehensive_tests/   # Comprehensive test suite
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd browser_test

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Command Line Interface

```bash
# Compile a Lean4 file
npm run compile examples/my_program.lean

# Or using the built CLI
node dist/index.js examples/my_program.lean

# Evaluate an expression directly
node dist/index.js -e "2 + 3 * 4"
```

### Programmatic API

```typescript
import { compile, Lean4Compiler } from 'lean4-compiler';

// Simple compilation
const result = compile(`
  def add (a : Nat) (b : Nat) := a + b
  #eval add 2 3
`);

console.log(result.output);  // "5"
console.log(result.success); // true

// Using the compiler class
const compiler = new Lean4Compiler({ verbose: true });
const result = compiler.compile(source);

// Access evaluated values
for (const [name, value] of result.values) {
  console.log(`${name} = ${formatValue(value)}`);
}
```

### Example Programs

#### Factorial

```lean
def fac (n : Nat) : Nat :=
  if n <= 1 then 1 else n * fac (n - 1)

#eval fac 5  -- Output: 120
```

#### Fibonacci

```lean
def fib (n : Nat) : Nat :=
  if n <= 1 then n else fib (n - 1) + fib (n - 2)

#eval fib 10  -- Output: 55
```

#### Pattern Matching

```lean
def isZero (n : Nat) : Bool :=
  match n with
  | 0 => true
  | _ => false

#eval isZero 0  -- Output: true
#eval isZero 5  -- Output: false
```

#### Higher-Order Functions

```lean
def double (x : Nat) := x * 2

def mylist := [1, 2, 3, 4, 5]
#eval mylist.map double  -- Output: [2, 4, 6, 8, 10]
```

#### Ackermann Function

```lean
def ackermann : Nat → Nat → Nat
  | 0, n => n + 1
  | m + 1, 0 => ackermann m 1
  | m + 1, n + 1 => ackermann m (ackermann (m + 1) n)

#eval ackermann 3 3  -- Output: 61
```

#### Inductive Types

```lean
inductive Nat where
  | zero : Nat
  | succ : Nat → Nat

inductive List (α : Type) where
  | nil : List α
  | cons : α → List α → List α
```

## Test Programs

The `test_programs/` directory contains 100+ test programs covering:

1. **Classic Algorithms**: Ackermann, McCarthy 91, Collatz, Fibonacci variants
2. **Number Theory**: Prime sieve, GCD/LCM
3. **Data Structures**: Binary trees, BST operations, Heaps
4. **Sorting Algorithms**: Quicksort, Mergesort, Heapsort
5. **Graph Algorithms**: DFS, BFS, Dijkstra
6. **Functional Programming**: Compose, curry/uncurry, fold variations, scan variations
7. **Pattern Matching**: Nested patterns, complex guards, polymorphic functions
8. **Advanced Concepts**: Church encoding, state machines, recursion schemes
9. **Data Structures**: Bloom filter, binary search tree

Run all tests:

```bash
npm test
```

## Development

### Scripts

```bash
npm run build      # Compile TypeScript to JavaScript
npm run test       # Run Jest tests
npm run test:watch # Run tests in watch mode
npm run start      # Run the compiler directly with ts-node
npm run clean      # Remove build artifacts
```

### Architecture

The compiler follows a traditional multi-phase architecture:

1. **Lexer** (`src/lexer/`): Converts source code into tokens
2. **Parser** (`src/parser/`): Transforms tokens into an AST
3. **Elaborator** (`src/elaborator/`): Resolves types and implicit arguments
4. **Evaluator** (`src/evaluator/`): Interprets the AST and produces values

### Type System

The implementation includes a rich type system supporting:

- **Type Variables**: Generic type parameters
- **Type Constants**: Named types (Nat, Bool, String, etc.)
- **Type Application**: Parameterized types
- **Pi Types**: Dependent function types
- **Sigma Types**: Dependent pair types
- **Universe Types**: Type universes (Type, Type 1, etc.)
- **Sort Types**: Prop and Sort levels
- **Meta Variables**: Unification variables for type inference

### Value Representation

Values are represented as:

- **Literals**: Numbers, strings, characters, booleans
- **Closures**: Lambda expressions with captured environments
- **Lambdas**: Native JavaScript functions for built-ins
- **Constructors**: Algebraic data type constructors
- **Neutral Terms**: Variables and applications that cannot reduce further
- **Arrays**: List/array literals
- **Structs**: Structure instances with named fields

## Limitations

This is an educational/experimental implementation. Current limitations include:

- No full type checking (type inference is partial)
- No code generation (interpretation only)
- Limited support for tactics and proofs
- No module system beyond namespaces
- Some advanced Lean4 features not implemented

## Requirements

- Node.js >= 16.0.0
- npm >= 7.0.0

## Dependencies

- **TypeScript**: Type-safe JavaScript development
- **Jest**: Testing framework
- **ts-node**: TypeScript execution engine

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Acknowledgments

This project is inspired by the [Lean 4](https://leanprover.github.io/) theorem prover and programming language developed by the Lean FRO.
