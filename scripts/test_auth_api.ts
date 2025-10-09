// Teste da API NextAuth
async function testAuthAPI() {
  console.log('🧪 TESTE DA API DE AUTENTICAÇÃO')
  console.log('=' .repeat(50))

  const baseUrl = 'http://localhost:3000'
  
  try {
    // Teste 1: Verificar se a API está respondendo
    console.log('🔍 Testando endpoint NextAuth...')
    const authResponse = await fetch(`${baseUrl}/api/auth/session`)
    console.log(`✅ Status da API auth: ${authResponse.status}`)
    
    // Teste 2: Tentar fazer login via API
    console.log('\n🔐 Testando login via API...')
    
    const loginData = {
      email: 'coordenador@naf.teste',
      password: '123456'
    }

    // Simular requisição de login
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: loginData.email,
        password: loginData.password,
        csrfToken: 'test', // Em produção, isso vem do NextAuth
      }),
    })

    console.log(`🔐 Status do login: ${loginResponse.status}`)
    
    if (loginResponse.status === 200) {
      console.log('✅ API de login respondeu com sucesso')
    } else {
      console.log('❌ Problema na API de login')
      const text = await loginResponse.text()
      console.log('Resposta:', text.substring(0, 200))
    }

  } catch (error) {
    console.error('❌ Erro no teste da API:', error)
  }

  console.log('\n' + '=' .repeat(50))
  console.log('🏁 TESTE DA API CONCLUÍDO')
}

testAuthAPI()
