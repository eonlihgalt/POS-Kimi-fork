import type { ComponentStatus } from './types';
const transitions: Record<ComponentStatus, readonly ComponentStatus[]> = {
  observed:['candidate','retired'], candidate:['testing','retired'], testing:['confirmed','adopted','candidate','retired'],
  confirmed:['testing','deprecated'], adopted:['deprecated'], deprecated:['adopted','retired'], retired:['candidate']
};
export function canTransition(from: ComponentStatus, to: ComponentStatus) { return transitions[from].includes(to); }
