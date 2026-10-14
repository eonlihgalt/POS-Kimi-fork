import { describe, expect, it } from 'vitest'; import { canTransition } from '../../lib/domain/lifecycle';
describe('component lifecycle',()=>{ it('permits candidate -> testing',()=>expect(canTransition('candidate','testing')).toBe(true)); it('blocks candidate -> deprecated',()=>expect(canTransition('candidate','deprecated')).toBe(false)); });
