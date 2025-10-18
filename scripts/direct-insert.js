// Direct insert using service role key
async function createStudent() {
  const SUPABASE_URL = 'https://gaevnrnthqxiwrdypour.supabase.co';
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZXZucm50aHF4aXdyZHlwb3VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzcxMTE3MywiZXhwIjoyMDczMjg3MTczfQ.1aKzZEOl_tEn3wKv2Z6Rw4X-sGqnOTfOxI4TnXpTGao';

  const studentData = {
    email: 'ana.santos@estudante.edu.br',
    password_hash: '$2b$12$EhaL9TvIyFPSHXfN4eHF8OfRs7yXDjVpAZoFIwuRS1dEoJsSchCxO',
    name: 'Ana Carolina Santos',
    phone: '(11) 99999-0001',
    document: '12345678901',
    course: 'Ciências Contábeis',
    semester: '6º Semestre',
    registration_number: '2024001001',
    specializations: ['Imposto de Renda', 'MEI', 'Pessoa Física'],
    status: 'ATIVO'
  };

  try {
    console.log('Inserting student...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(studentData)
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      console.log('Student created successfully!');
      console.log('Testing login...');

      const loginResponse = await fetch('http://localhost:4000/api/students/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ana.santos@estudante.edu.br',
          password: '123456'
        })
      });

      const loginResult = await loginResponse.json();
      console.log('Login result:', loginResult);

      if (loginResult.token) {
        console.log('Testing dashboard...');
        const dashboardResponse = await fetch('http://localhost:4000/api/students/dashboard', {
          headers: { 'Authorization': `Bearer ${loginResult.token}` }
        });

        const dashboardResult = await dashboardResponse.json();
        console.log('Dashboard result:', dashboardResult);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

createStudent();