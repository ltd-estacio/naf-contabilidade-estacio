-- Create student directly
INSERT INTO students (
  email,
  password_hash,
  name,
  phone,
  document,
  course,
  semester,
  registration_number,
  specializations,
  status
) VALUES (
  'ana.santos@estudante.edu.br',
  '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO',
  'Ana Carolina Santos',
  '(11) 99999-0001',
  '12345678901',
  'Ciências Contábeis',
  '6º Semestre',
  '2024001001',
  ARRAY['Imposto de Renda', 'MEI', 'Pessoa Física'],
  'ATIVO'
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  status = 'ATIVO';