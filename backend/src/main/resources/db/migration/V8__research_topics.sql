-- Admin-managed research topics (professors pick from this list only for project tags)

CREATE TABLE research_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_research_topics_name UNIQUE (name)
);

CREATE INDEX idx_research_topics_sort ON research_topics (sort_order, name);

-- Migrate existing project tags into the catalog so current projects stay valid
INSERT INTO research_topics (name, sort_order)
SELECT DISTINCT TRIM(pt.tag), 0
FROM project_tags pt
WHERE TRIM(pt.tag) <> ''
  AND NOT EXISTS (SELECT 1 FROM research_topics rt WHERE rt.name = TRIM(pt.tag));

-- Default catalog if database had no tags yet
INSERT INTO research_topics (name, sort_order)
SELECT v.name, v.ord
FROM (
    VALUES
        ('Machine Learning', 10),
        ('Climate', 20),
        ('NLP', 30),
        ('Policy', 40),
        ('Data Visualization', 50),
        ('Research Impact', 60),
        ('Biology', 70),
        ('Engineering', 80),
        ('Security', 90),
        ('HCI', 100),
        ('Economics', 110)
) AS v(name, ord)
WHERE NOT EXISTS (SELECT 1 FROM research_topics rt WHERE rt.name = v.name);
