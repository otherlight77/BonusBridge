-- BonusBridge global data architecture (database-agnostic PostgreSQL draft)
CREATE TABLE countries (id CHAR(2) PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL);
CREATE TABLE administrative_areas (id UUID PRIMARY KEY, country_id CHAR(2) REFERENCES countries(id), area_type TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL, UNIQUE(country_id, code));
CREATE TABLE insurance_groups (id UUID PRIMARY KEY, name TEXT NOT NULL, website TEXT);
CREATE TABLE insurers (id UUID PRIMARY KEY, group_id UUID REFERENCES insurance_groups(id), country_id CHAR(2) REFERENCES countries(id), name TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE brands (id UUID PRIMARY KEY, insurer_id UUID REFERENCES insurers(id), name TEXT NOT NULL);
CREATE TABLE languages (code TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE currencies (code CHAR(3) PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE sources (id UUID PRIMARY KEY, source_type TEXT NOT NULL, publisher TEXT NOT NULL, url TEXT NOT NULL, published_at DATE, checked_at TIMESTAMPTZ NOT NULL, confidence SMALLINT CHECK(confidence BETWEEN 0 AND 100));
CREATE TABLE recognition_rules (id UUID PRIMARY KEY, origin_country_id CHAR(2) REFERENCES countries(id), destination_country_id CHAR(2) REFERENCES countries(id), area_id UUID REFERENCES administrative_areas(id), insurer_id UUID REFERENCES insurers(id), status TEXT NOT NULL, rule_json JSONB NOT NULL, source_id UUID REFERENCES sources(id), valid_from DATE, valid_until DATE, version INTEGER NOT NULL);
CREATE TABLE document_types (id UUID PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, validity_days INTEGER);
CREATE TABLE rule_documents (rule_id UUID REFERENCES recognition_rules(id), document_type_id UUID REFERENCES document_types(id), required BOOLEAN NOT NULL, translation_required BOOLEAN, PRIMARY KEY(rule_id, document_type_id));
CREATE TABLE translations (id UUID PRIMARY KEY, entity_type TEXT NOT NULL, entity_id UUID NOT NULL, language_code TEXT REFERENCES languages(code), content JSONB NOT NULL, reviewed_at TIMESTAMPTZ);
CREATE TABLE passports (id UUID PRIMARY KEY, holder_id UUID NOT NULL, origin_country_id CHAR(2) REFERENCES countries(id), destination_country_id CHAR(2) REFERENCES countries(id), payload JSONB NOT NULL, confidence SMALLINT, signature TEXT, generated_at TIMESTAMPTZ NOT NULL);
CREATE TABLE change_logs (id BIGSERIAL PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, action TEXT NOT NULL, before_data JSONB, after_data JSONB, reviewer_id UUID, created_at TIMESTAMPTZ NOT NULL);
CREATE INDEX recognition_route_idx ON recognition_rules(origin_country_id, destination_country_id, area_id, insurer_id);
CREATE INDEX source_freshness_idx ON sources(checked_at DESC, confidence DESC);
