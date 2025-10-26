// Script de teste para registro de estudante
// Execute com: node test-student-register.js

const testStudentRegistration = async () => {
  console.log('🧪 Testando registro de estudante...\n')

  const testData = {
    email: `teste${Date.now()}@estudante.com`,
    password: '123456',
    name: 'Estudante Teste',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
    course: 'Ciências Contábeis',
    semester: '7º Semestre',
    registrationNumber: `2024${Math.floor(Math.random() * 100000)}`,
    birthDate: '2000-01-15',
    registrationYear: new Date().getFullYear(),
    registrationSemester: new Date().getMonth() < 6 ? 1 : 2,
    address: {
      street: 'Rua Teste',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipcode: '01234-567'
    },
    emergencyContact: {
      name: 'Contato de Emergência',
      phone: '(11) 97654-3210',
      relationship: 'Mãe'
    }
  }

  console.log('📋 Dados do teste:')
  console.log(JSON.stringify({ ...testData, password: '[HIDDEN]' }, null, 2))
  console.log('\n')

  try {
    console.log('📡 Enviando requisição...')
    const response = await fetch('http://localhost:4000/api/students/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    console.log(`📊 Status da resposta: ${response.status} ${response.statusText}\n`)

    const data = await response.json()

    if (response.ok) {
      console.log('✅ SUCESSO! Estudante criado:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.log('❌ ERRO! Resposta:')
      console.log(JSON.stringify(data, null, 2))
    }

  } catch (error) {
    console.error('💥 ERRO NA REQUISIÇÃO:')
    console.error(error.message)
    console.error('\n')
    console.error('Certifique-se de que o servidor está rodando em http://localhost:4000')
  }
}

// Executar o teste
testStudentRegistration()
