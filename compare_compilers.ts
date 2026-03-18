#!/usr/bin/env npx ts-node
/**
 * Compare the TypeScript Lean4 implementation with the official Lean4 compiler
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { compile } from './src/compiler';
import { formatValue } from './src/types/types';

const testDir = path.join(__dirname, 'test_programs');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.lean'));

// All test files to compare (dynamically generated from directory)
const sampleFiles = fs.readdirSync(testDir)
  .filter(f => f.endsWith('.lean'))
  .sort((a, b) => {
    const numA = parseInt(a.split('_')[0]);
    const numB = parseInt(b.split('_')[0]);
    return numA - numB;
  });

interface ComparisonResult {
  file: string;
  tsOutput: string;
  leanOutput: string;
  match: boolean;
  tsError?: string;
  leanError?: string;
}

function getTsOutput(source: string): { output: string; error?: string } {
  try {
    const result = compile(source);
    if (!result.success) {
      return { output: '', error: result.errors.join(', ') };
    }
    const xValue = result.values.get('x');
    if (xValue) {
      return { output: formatValue(xValue) };
    }
    const lastEntry = Array.from(result.values.entries()).pop();
    if (lastEntry) {
      return { output: formatValue(lastEntry[1]) };
    }
    return { output: '' };
  } catch (e: any) {
    return { output: '', error: e.message };
  }
}

function getLeanOutput(filePath: string): { output: string; error?: string } {
  try {
    // Create a wrapper that prints the result
    const source = fs.readFileSync(filePath, 'utf-8');
    const tmpFile = path.join('/tmp', 'lean_test.lean');

    // Modify the source to print the value of x
    let modifiedSource = source;
    if (source.includes('def x :=')) {
      modifiedSource += '\n#eval x';
    } else {
      // Find the last definition and evaluate it
      const lines = source.split('\n');
      let lastDef = '';
      for (const line of lines) {
        if (line.startsWith('def ') && line.includes(':=')) {
          const match = line.match(/def\s+(\w+)/);
          if (match) {
            lastDef = match[1];
          }
        }
      }
      if (lastDef) {
        modifiedSource += `\n#eval ${lastDef}`;
      }
    }

    fs.writeFileSync(tmpFile, modifiedSource);

    const rawOutput = execSync(`lean ${tmpFile} 2>&1`, {
      timeout: 10000,
      encoding: 'utf-8'
    }).trim();

    // Extract just the last line (the actual result), ignoring warnings
    const lines = rawOutput.split('\n');
    let output = lines[lines.length - 1] || '';

    // If the last line is a note about linter, get the line before the empty line before it
    if (output.startsWith('Note:') || output === '') {
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line && !line.startsWith('Note:') && !line.startsWith('/tmp') && !line.includes('warning:')) {
          output = line;
          break;
        }
      }
    }

    fs.unlinkSync(tmpFile);
    return { output };
  } catch (e: any) {
    return { output: '', error: e.stderr || e.message };
  }
}

console.log('Comparing TypeScript implementation with official Lean4 compiler\n');
console.log('=' .repeat(80));

const results: ComparisonResult[] = [];
let matched = 0;
let mismatched = 0;
let errors = 0;

for (const file of sampleFiles) {
  const filePath = path.join(testDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} (not found)`);
    continue;
  }

  const source = fs.readFileSync(filePath, 'utf-8');
  const tsResult = getTsOutput(source);
  const leanResult = getLeanOutput(filePath);

  const result: ComparisonResult = {
    file,
    tsOutput: tsResult.output,
    leanOutput: leanResult.output,
    match: tsResult.output === leanResult.output,
    tsError: tsResult.error,
    leanError: leanResult.error
  };

  results.push(result);

  if (result.match) {
    matched++;
  } else if (tsResult.error || leanResult.error) {
    errors++;
  } else {
    mismatched++;
  }
}

console.log('\nRESULTS:\n');
console.log(`{'File':<30} | {'TS Output':<20} | {'Lean Output':<20} | {'Match':<6}`);
console.log('-'.repeat(80));

for (const r of results) {
  const status = r.match ? '✅' : (r.tsError || r.leanError ? '⚠️' : '❌');
  const tsOut = r.tsError ? `ERR: ${r.tsError.substring(0, 15)}...` : r.tsOutput.substring(0, 20);
  const leanOut = r.leanError ? `ERR: ${r.leanError.substring(0, 15)}...` : r.leanOutput.substring(0, 20);
  console.log(`${r.file.padEnd(30)} | ${tsOut.padEnd(20)} | ${leanOut.padEnd(20)} | ${status}`);
}

console.log('\n' + '='.repeat(80));
console.log(`\nSUMMARY:`);
console.log(`  Matched:     ${matched}/${results.length}`);
console.log(`  Mismatched:  ${mismatched}`);
console.log(`  Errors:      ${errors}`);
console.log(`  Total:       ${results.length}`);

if (mismatched === 0 && errors === 0) {
  console.log('\n✅ All outputs match the official Lean4 compiler!');
} else {
  console.log('\n⚠️ Some outputs differ from the official Lean4 compiler.');
}
