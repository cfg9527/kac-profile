ALTER TABLE entries ADD COLUMN IF NOT EXISTS ontology jsonb;
GRANT SELECT (ontology) ON entries TO site_reader, site_app;
