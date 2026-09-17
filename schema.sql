-- Schema para Supabase
-- Tabela terapeutas
CREATE TABLE IF NOT EXISTS terapeutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  whatsapp TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela leads
CREATE TABLE IF NOT EXISTS leads (
  origemId TEXT PRIMARY KEY,
  terapeuta_slug TEXT REFERENCES terapeutas(slug),
  data TIMESTAMPTZ DEFAULT NOW(),
  nome TEXT,
  email TEXT,
  whatsapp TEXT,
  idade TEXT,
  profissao TEXT,
  problemas TEXT,
  terapia_anterior TEXT,
  renda TEXT,
  resultadosTravas JSONB,
  respostasdetalhadas JSONB,
  status TEXT DEFAULT 'novo',
  abordado BOOLEAN DEFAULT FALSE,
  agendouSessao BOOLEAN DEFAULT FALSE,
  fechouProtocolo BOOLEAN DEFAULT FALSE,
  arquivado BOOLEAN DEFAULT FALSE,
  prontuario TEXT,
  produtoValor NUMERIC,
  parcelas JSONB,
  agenda JSONB,
  versaoTeste TEXT,
  ultimaSessao TIMESTAMPTZ,
  infancia TEXT,
  adolescencia TEXT,
  vida_adulta TEXT,
  indicacao TEXT,
  prioridade TEXT,
  investir TEXT
);

-- Políticas RLS (simplificadas para MVP)
ALTER TABLE terapeutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for MVP" ON terapeutas FOR ALL USING (true);
CREATE POLICY "Public access for MVP" ON leads FOR ALL USING (true);
