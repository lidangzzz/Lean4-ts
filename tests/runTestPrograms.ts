
import { compile, run, Lean4Compiler } from '../dist/compiler';
import { formatValue } from '../dist/types';
import * as fs from 'fs';
import * as path from 'path';

const expectedOutputs = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'test_programs', 'expected_outputs.json'), 'utf-8')
);

const testDir = path.join(__dirname, '..', 'test_programs');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.lean'));

let passed = 0;
let failed = 0;
const failures: string[] = [];

for (const file of files) {
  const testName = file.replace('.lean', '');
  const source = fs.readFileSync(path.join(testDir, file), 'utf-8');
  const expected = expectedOutputs[testName];

  try {
    const result = compile(source);
    if (!result.success) {
      if (expected.startsWith('Error:')) {
        passed++;
      } else {
        failed++;
        failures.push(`${testName}: Compilation failed - ${result.errors.join(', ')}`);
      }
      continue;
    }

    // Get the value of 'x' or the last defined value
    let actual = '';
    const xValue = result.values.get('x');
    if (xValue) {
      actual = formatValue(xValue);
    } else {
      // Get the last defined value
      const lastEntry = Array.from(result.values.entries()).pop();
      if (lastEntry) {
        actual = formatValue(lastEntry[1]);
      }
    }

    if (actual === expected) {
      passed++;
    } else {
      failed++;
      failures.push(`${testName}: Expected '${expected}', got '${actual}'`);
    }
  } catch (error: any) {
    failed++;
    failures.push(`${testName}: Exception - ${error.message}`);
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failures.length > 0) {
  console.log('Failures:');
  failures.slice(0, 50).forEach(f => console.log(`  ${f}`));
  if (failures.length > 50) {
    console.log(`  ... and ${failures.length - 50} more`);
  }
  process.exit(1);
}
