import assert from 'node:assert/strict';
import test from 'node:test';
import Candidate from '../models/Candidate.js';
import { formatCandidateName } from '../shared/candidate-name.js';

test('formats each name word with an initial capital and remaining lowercase letters', () => {
  assert.equal(formatCandidateName('  aNITA   sHARMA  '), 'Anita Sharma');
  assert.equal(formatCandidateName('ÉLODIE MARTÍNEZ'), 'Élodie Martínez');
  assert.equal(formatCandidateName(''), '');
});

test('applies candidate name formatting through the model setter', () => {
  const candidate = new Candidate({ id: 'CAN-2026-0001', name: 'rAHUL kUMAR' });
  assert.equal(candidate.name, 'Rahul Kumar');
});
