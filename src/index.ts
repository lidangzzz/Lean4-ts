// Lean4 Compiler - Main Entry Point

export * from './lexer';
export * from './parser';
export * from './types';
export * from './evaluator';
export * from './compiler';

import { Lean4Compiler, compile, run, CompileResult, CompileOptions } from './compiler';

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Lean4 Compiler (TypeScript Implementation)');
    console.log('Usage: lean4-compiler <file.lean>');
    console.log('       lean4-compiler -e <expression>');
    process.exit(0);
  }

  const compiler = new Lean4Compiler({ verbose: false });

  if (args[0] === '-e') {
    // Evaluate expression
    const expr = args.slice(1).join(' ');
    const source = `#eval ${expr}`;
    const result = compiler.compile(source);
    console.log(result.output);
  } else {
    // Compile file
    const fs = require('fs');
    const filename = args[0];

    try {
      const source = fs.readFileSync(filename, 'utf-8');
      const result = compiler.compile(source);

      if (result.success) {
        console.log(result.output);
      } else {
        console.error('Compilation failed:');
        result.errors.forEach((e) => console.error(`  ${e}`));
        process.exit(1);
      }
    } catch (error: any) {
      console.error(`Error reading file: ${error.message}`);
      process.exit(1);
    }
  }
}
