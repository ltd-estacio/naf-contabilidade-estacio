// Simple script to create student
const data = {
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
}

// Using fetch to create student directly via API
fetch('http://localhost:4000/api/students/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(r => r.json()).then(console.log).catch(console.error)

async function createStudents() {
  console.log('Creating students...')

  const password = '123456'
  const hashedPassword = await bcrypt.hash(password, 12)

  const students = [
    {
      email: 'ana.santos@estudante.edu.br',
      password_hash: hashedPassword,
      name: 'Ana Carolina Santos',
      phone: '(11) 99999-0001',
      document: '12345678901',
      course: 'Ciências Contábeis',
      semester: '6º Semestre',
      registration_number: '2024001001',
      specializations: ['Imposto de Renda', 'MEI', 'Pessoa Física'],
      status: 'ATIVO'
    },
    {
      email: 'joao.silva@estudante.edu.br',
      password_hash: hashedPassword,
      name: 'João Silva',
      phone: '(11) 99999-0002',
      document: '98765432102',
      course: 'Administração',
      semester: '4º Semestre',
      registration_number: '2024001002',
      specializations: ['MEI', 'Consultoria Empresarial'],
      status: 'ATIVO'
    }
  ]

  for (const student of students) {
    const { data, error } = await supabase
      .from('students')
      .upsert(student, { onConflict: 'email' })

    if (error) {
      console.error('Error creating student:', student.email, error)
    } else {
      console.log('Student created:', student.email)
    }
  }

  console.log('Students creation completed!')
}

createStudents().catch(console.error)