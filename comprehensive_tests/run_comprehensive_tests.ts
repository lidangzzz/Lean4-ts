#!/usr/bin/env npx ts-node
// Run comprehensive Lean4 compiler tests

import { compile, Lean4Compiler } from '../src/compiler';
import { formatValue } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

const testDir = path.join(__dirname, 'programs');
const expectedOutputsPath = path.join(__dirname, 'expected_outputs.json');

// Load expected outputs
const expectedOutputs: Record<string, string> = JSON.parse(
  fs.readFileSync(expectedOutputsPath, 'utf-8')
);

// Get all test files
const files = fs.readdirSync(testDir)
  .filter(f => f.endsWith('.lean'))
  .sort();

const results: TestResult[] = [];
let passed = 0;
let failed = 0;

console.log(`Running ${files.length} comprehensive tests...\n`);

for (const file of files) {
  const testName = file.replace('.lean', '');
  const source = fs.readFileSync(path.join(testDir, file), 'utf-8');
  const expected = expectedOutputs[testName];

  try {
    const result = compile(source);

    if (!result.success) {
      const actual = `Error: ${result.errors.join(', ')}`;
      if (expected.startsWith('Error:')) {
        results.push({ name: testName, passed: true, expected, actual });
        passed++;
      } else {
        results.push({ name: testName, passed: false, expected, actual, error: result.errors.join(', ') });
        failed++;
        console.log(`FAIL ${testName}: Compilation failed - ${result.errors.join(', ')}`);
      }
      continue;
    }

    // Get the value of 'result' or the last defined value
    let actual = '';
    const resultValue = result.values.get('result');
    if (resultValue) {
      actual = formatValue(resultValue);
    } else {
      // Get the last defined value
      const lastEntry = Array.from(result.values.entries()).pop();
      if (lastEntry) {
        actual = formatValue(lastEntry[1]);
      }
    }

    if (actual === expected) {
      results.push({ name: testName, passed: true, expected, actual });
      passed++;
      process.stdout.write('.');
    } else {
      results.push({ name: testName, passed: false, expected, actual });
      failed++;
      console.log(`\nFAIL ${testName}: Expected '${expected}', got '${actual}'`);
    }
  } catch (error: any) {
    const actual = `Exception: ${error.message}`;
    results.push({ name: testName, passed: false, expected, actual, error: error.message });
    failed++;
    console.log(`\nFAIL ${testName}: Exception - ${error.message}`);
  }
}

console.log(`\n\n${'='.repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${files.length} tests`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log('\nFailed tests:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  ${r.name}: Expected '${r.expected}', got '${r.actual}'`);
    if (r.error) {
      console.log(`    Error: ${r.error}`);
    }
  });
  process.exit(1);
} else {
  console.log('\nAll tests passed!');
  process.exit(0);
}
