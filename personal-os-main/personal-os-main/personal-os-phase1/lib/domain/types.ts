export type AnalysisLens = 'standard' | 'protective' | 'both';
export type Confidence = 'low' | 'medium' | 'high';
export type ComponentType = 'setting'|'rule'|'assumption'|'need'|'protective_strategy'|'strength'|'warning_sign'|'recovery_method'|'resource_requirement'|'operating_condition';
export type ComponentStatus = 'observed'|'candidate'|'testing'|'confirmed'|'adopted'|'deprecated'|'retired';
export type ExperimentStatus = 'draft'|'active'|'completed'|'abandoned';
export type RelationshipType = 'triggers'|'requires'|'supports'|'conflicts_with'|'protects_against'|'amplifies'|'reduces'|'compensates_for'|'replaced_by';
