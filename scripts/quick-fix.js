// Quick fix - create student using fetch API
const studentData = {
  email: 'ana.santos@estudante.edu.br',
  password: '123456',
  name: 'Ana Carolina Santos',
  phone: '(11) 99999-0001',
  document: '12345678901',
  course: 'Ciências Contábeis',
  semester: '6º Semestre',
  registrationNumber: '2024001001'
};

console.log('Creating student...');
fetch('http://localhost:4000/api/students/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(studentData)
})
.then(r => r.json())
.then(data => {
  console.log('Student creation:', data);

  if (data.message === 'Email já cadastrado' || data.student) {
    console.log('Testing login...');
    return fetch('http://localhost:4000/api/students/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ana.santos@estudante.edu.br',
        password: '123456'
      })
    });
  }
})
.then(r => r ? r.json() : null)
.then(loginData => {
  if (loginData) {
    console.log('Login result:', loginData);

    if (loginData.token) {
      console.log('Testing dashboard...');
      return fetch('http://localhost:4000/api/students/dashboard', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
    }
  }
})
.then(r => r ? r.json() : null)
.then(dashboardData => {
  if (dashboardData) {
    console.log('Dashboard result:', dashboardData);
  }
})
.catch(console.error);