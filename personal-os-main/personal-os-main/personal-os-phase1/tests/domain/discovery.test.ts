import {describe,it,expect} from 'vitest';
import {discoverySchema} from '../../lib/validation/discovery';
const id='550e8400-e29b-41d4-a716-446655440000';
describe('discovery validation',()=>{
 it('accepts a candidate setting',()=>expect(discoverySchema.safeParse({debugSessionId:id,type:'setting',title:'Need for Clarity',confidence:'medium'}).success).toBe(true));
 it('rejects unknown component type',()=>expect(discoverySchema.safeParse({debugSessionId:id,type:'diagnosis',title:'Example',confidence:'high'}).success).toBe(false));
});
