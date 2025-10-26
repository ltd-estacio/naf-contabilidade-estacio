const fs = require('fs')
const path = require('path')

// Lista de guias para gerar PDFs
const guides = [
  { id: 'cadastro-cpf', title: 'Cadastro de CPF - Guia Completo' },
  { id: 'mei-formalizacao', title: 'MEI - Formalização e Gestão' },
  { id: 'declaracao-ir-pf', title: 'Declaração de Imposto de Renda PF' },
  { id: 'itr-territorial-rural', title: 'ITR - Imposto Territorial Rural' },
  { id: 'abertura-cnpj', title: 'Abertura de CNPJ' },
  { id: 'esocial-domestico', title: 'e-Social Doméstico' },
  { id: 'alvara-funcionamento', title: 'Alvará de Funcionamento Municipal' },
  { id: 'iss-servicos', title: 'ISS - Imposto sobre Serviços' },
  { id: 'icms-mercadorias', title: 'ICMS - Imposto sobre Circulação de Mercadorias' }
]

// Criar PDFs básicos simulados
const pdfDir = path.join(__dirname, 'src', 'guia-fiscal')

// Garantir que o diretório existe
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true })
}

guides.forEach(guide => {
  const pdfPath = path.join(pdfDir, `${guide.id}.pdf`)

  // Conteúdo básico de um PDF simulado (apenas para demonstração)
  const pdfContent = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj

4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

5 0 obj
<< /Length 100 >>
stream
BT
/F1 12 Tf
50 750 Td
(${guide.title}) Tj
0 -20 Td
(NAF - Núcleo de Apoio Fiscal) Tj
0 -20 Td
(Estácio Florianópolis) Tj
0 -40 Td
(Este é um guia fiscal completo sobre o tema.) Tj
0 -20 Td
(Para mais informações, procure o NAF.) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f
0000000015 00000 n
0000000068 00000 n
0000000125 00000 n
0000000251 00000 n
0000000320 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
575
%%EOF`)

  fs.writeFileSync(pdfPath, pdfContent)
  console.log(`✅ Criado: ${guide.id}.pdf`)
})

console.log(`\n🎉 Todos os ${guides.length} PDFs foram criados com sucesso!`)
console.log('📂 Localização: src/guia-fiscal/')