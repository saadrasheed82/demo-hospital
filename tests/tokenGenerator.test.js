import { test, expect } from 'vitest'
import { generateNextToken, parseTokenNumber, reorderNoShow } from '../src/shared/utils/tokenGenerator'

test('generates sequential 3-digit tokens', () => {
  expect(generateNextToken('101')).toBe('102')
  expect(generateNextToken('109')).toBe('110')
  expect(generateNextToken(null)).toBe('101')
})

test('parses token number correctly', () => {
  expect(parseTokenNumber('105')).toBe(105)
  expect(parseTokenNumber('099')).toBe(99)
})

test('moves no-show to end of queue with last token', () => {
  const queue = [
    { id: 't1', token: '101', patientId: 'p1', status: 'pending' },
    { id: 't2', token: '102', patientId: 'p2', status: 'pending' },
    { id: 't3', token: '103', patientId: 'p3', status: 'current' },
  ]
  const result = reorderNoShow(queue, 't1')
  expect(result[0].status).toBe('pending')  // first non-no-show stays pending
  expect(result[2].id).toBe('t1')
  expect(result[2].token).toBe('104')
  expect(result[2].status).toBe('end_of_queue')
  expect(result[2].originalToken).toBe('101')
})

test('handles empty queue', () => {
  expect(generateNextToken(null)).toBe('101')
})
