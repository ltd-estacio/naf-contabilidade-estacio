import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST - Exportar relatório de Business Intelligence em diferentes formatos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format, filters, data } = body

    if (!format || !data) {
      return NextResponse.json(
        { error: 'Formato e dados são obrigatórios' },
        { status: 400 }
      )
    }

    let content: string
    let mimeType: string
    let fileExtension: string

    switch (format) {
      case 'csv':
        content = generateCSV(data, filters)
        mimeType = 'text/csv;charset=utf-8'
        fileExtension = 'csv'
        break

      case 'json':
        content = JSON.stringify(
          {
            metadata: {
              generated_at: new Date().toISOString(),
              filters: filters,
              report_type: 'business_intelligence'
            },
            data
          },
          null,
          2
        )
        mimeType = 'application/json;charset=utf-8'
        fileExtension = 'json'
        break

      case 'pdf':
        // Para PDF, retornar um HTML que pode ser convertido
        content = generateHTMLReport(data, filters)
        mimeType = 'text/html;charset=utf-8'
        fileExtension = 'html'
        break

      default:
        return NextResponse.json(
          { error: 'Formato não suportado. Use: csv, json ou pdf' },
          { status: 400 }
        )
    }

    // Retornar como arquivo para download
    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="relatorio-bi-${new Date().toISOString().split('T')[0]}.${fileExtension}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    return NextResponse.json(
      {
        error: 'Erro ao exportar relatório',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Gerar relatório em formato CSV
 */
function generateCSV(data: any, filters: any): string {
  const lines: string[] = []

  // Header do relatório
  lines.push('RELATORIO DE BUSINESS INTELLIGENCE - NAF CONTABILIDADE')
  lines.push(`Data de Geracao: ${new Date().toLocaleString('pt-BR')}`)
  lines.push('')
  
  // Informações dos filtros
  if (filters) {
    lines.push('FILTROS APLICADOS:')
    if (filters.dateRange && filters.dateRange !== 'all') {
      lines.push(`Periodo: ${getDateRangeLabel(filters.dateRange)}`)
    }
    if (filters.startDate) lines.push(`Data Inicial: ${formatDate(filters.startDate)}`)
    if (filters.endDate) lines.push(`Data Final: ${formatDate(filters.endDate)}`)
    if (filters.status && filters.status.length > 0) {
      lines.push(`Status: ${filters.status.join(', ')}`)
    }
    if (filters.minRating) lines.push(`Avaliacao Minima: ${filters.minRating} estrelas`)
    if (filters.course) lines.push(`Curso: ${filters.course}`)
    if (filters.semester) lines.push(`Semestre: ${filters.semester}`)
    lines.push('')
  }

  // Seção: DADOS GERAIS
  if (data.general) {
    lines.push('===== DADOS GERAIS =====')
    lines.push('')
    const general = data.general
    if (general.totals) {
      lines.push('Metrica,Valor')
      lines.push(`Total de Atendimentos,${general.totals.total_attendances || 0}`)
      lines.push(`Atendimentos Concluidos,${general.totals.completed_attendances || 0}`)
      lines.push(`Atendimentos Pendentes,${general.totals.pending_attendances || 0}`)
      lines.push(`Atendimentos Cancelados,${general.totals.cancelled_attendances || 0}`)
      lines.push(`Total de Estudantes,${general.totals.total_students || 0}`)
      lines.push(`Total de Servicos,${general.totals.total_services || 0}`)
      lines.push('')
    }
  }

  // Seção: PERFORMANCE
  if (data.performance) {
    lines.push('===== PERFORMANCE =====')
    lines.push('')
    const perf = data.performance
    if (perf.performanceStats) {
      lines.push('Metrica,Valor')
      lines.push(`Taxa de Conclusao,%${perf.performanceStats.completion_rate?.toFixed(2) || 0}`)
      lines.push(`Taxa de Cancelamento,%${perf.performanceStats.cancellation_rate?.toFixed(2) || 0}`)
      lines.push(`Tempo Medio de Resposta,${perf.performanceStats.avg_response_time || 0} horas`)
      lines.push(`Duracao Media,${perf.performanceStats.avg_attendance_duration || 0} minutos`)
      lines.push('')
    }
  }

  // Seção: ESTUDANTES
  if (data.students && data.students.studentStats) {
    lines.push('===== TOP 10 ESTUDANTES =====')
    lines.push('')
    lines.push('Nome,Email,Curso,Semestre,Total Atendimentos,Concluidos,Taxa Conclusao %,Avaliacao Media,Horas Logadas')
    
    const students = data.students.studentStats
      .sort((a: any, b: any) => b.total_attendances - a.total_attendances)
      .slice(0, 10)

    students.forEach((student: any) => {
      lines.push(
        `"${student.student_name || 'N/A'}",` +
        `"${student.email || 'N/A'}",` +
        `"${student.course || 'N/A'}",` +
        `"${student.semester || 'N/A'}",` +
        `${student.total_attendances || 0},` +
        `${student.completed_attendances || 0},` +
        `${student.completion_rate?.toFixed(2) || 0},` +
        `${student.avg_rating?.toFixed(1) || 0},` +
        `${((student.hours_logged || 0) / 60).toFixed(1)}`
      )
    })
    lines.push('')
  }

  // Seção: SERVIÇOS MAIS SOLICITADOS
  if (data.services && data.services.serviceStats) {
    lines.push('===== SERVICOS MAIS SOLICITADOS =====')
    lines.push('')
    lines.push('Servico,Total Solicitacoes,Concluidos,Taxa Conclusao %,Tempo Medio (min)')
    
    const services = data.services.serviceStats
      .sort((a: any, b: any) => b.total_requests - a.total_requests)
      .slice(0, 10)

    services.forEach((service: any) => {
      lines.push(
        `"${service.service_type || 'N/A'}",` +
        `${service.total_requests || 0},` +
        `${service.completed || 0},` +
        `${service.completion_rate?.toFixed(2) || 0},` +
        `${service.avg_duration?.toFixed(0) || 0}`
      )
    })
    lines.push('')
  }

  // Seção: SATISFAÇÃO
  if (data.satisfaction) {
    lines.push('===== SATISFACAO DO CLIENTE =====')
    lines.push('')
    if (data.satisfaction.satisfactionDistribution) {
      const dist = data.satisfaction.satisfactionDistribution
      lines.push('Metrica,Valor')
      lines.push(`Avaliacao Media,${dist.avg_rating?.toFixed(2) || 0}`)
      lines.push(`Total de Avaliacoes,${dist.total_ratings || 0}`)
      lines.push('')
      lines.push('Estrelas,Quantidade,Percentual')
      if (dist.distribution) {
        dist.distribution.forEach((item: any) => {
          lines.push(
            `${item.rating} estrelas,` +
            `${item.count || 0},` +
            `${item.percentage?.toFixed(2) || 0}%`
          )
        })
      }
      lines.push('')
    }
  }

  // Seção: CRESCIMENTO
  if (data.growth) {
    lines.push('===== CRESCIMENTO =====')
    lines.push('')
    lines.push('Metrica,Valor')
    lines.push(`Taxa de Crescimento,%${data.growth.growth_rate?.toFixed(2) || 0}`)
    lines.push(`Novos Atendimentos (30 dias),${data.growth.new_attendances || 0}`)
    lines.push(`Novos Estudantes (30 dias),${data.growth.new_students || 0}`)
    lines.push('')
  }

  lines.push('===== FIM DO RELATORIO =====')

  return lines.join('\n')
}

/**
 * Gerar relatório em formato HTML (para impressão/PDF)
 */
function generateHTMLReport(data: any, filters: any): string {
  const now = new Date().toLocaleString('pt-BR')
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Business Intelligence - NAF</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      color: #1e40af;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 12px 20px;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      border-radius: 8px;
    }
    .filters {
      background: #eff6ff;
      border: 2px solid #bfdbfe;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .filters h3 {
      color: #1e40af;
      margin-bottom: 10px;
    }
    .filter-item {
      display: inline-block;
      background: white;
      padding: 6px 12px;
      margin: 4px;
      border-radius: 6px;
      font-size: 13px;
      border: 1px solid #bfdbfe;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #bae6fd;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #0369a1;
      margin: 10px 0;
    }
    .stat-label {
      color: #075985;
      font-size: 14px;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background: #1e40af;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    tr:hover {
      background: #f3f4f6;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório Business Intelligence</h1>
      <p>NAF - Núcleo de Apoio Contábil e Fiscal</p>
      <p>Gerado em: ${now}</p>
    </div>

    ${filters && Object.keys(filters).length > 0 ? `
    <div class="filters">
      <h3>🔍 Filtros Aplicados</h3>
      ${filters.dateRange && filters.dateRange !== 'all' ? `<span class="filter-item">📅 ${getDateRangeLabel(filters.dateRange)}</span>` : ''}
      ${filters.startDate ? `<span class="filter-item">📆 Início: ${formatDate(filters.startDate)}</span>` : ''}
      ${filters.endDate ? `<span class="filter-item">📆 Fim: ${formatDate(filters.endDate)}</span>` : ''}
      ${filters.status && filters.status.length > 0 ? `<span class="filter-item">✓ Status: ${filters.status.join(', ')}</span>` : ''}
      ${filters.minRating ? `<span class="filter-item">⭐ Mínimo ${filters.minRating} estrelas</span>` : ''}
      ${filters.course ? `<span class="filter-item">🎓 ${filters.course}</span>` : ''}
      ${filters.semester ? `<span class="filter-item">📚 Semestre ${filters.semester}</span>` : ''}
    </div>
    ` : ''}

    ${data.general && data.general.totals ? `
    <div class="section">
      <div class="section-title">📈 Visão Geral</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total de Atendimentos</div>
          <div class="stat-value">${data.general.totals.total_attendances || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Concluídos</div>
          <div class="stat-value">${data.general.totals.completed_attendances || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Estudantes</div>
          <div class="stat-value">${data.general.totals.total_students || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Serviços</div>
          <div class="stat-value">${data.general.totals.total_services || 0}</div>
        </div>
      </div>
    </div>
    ` : ''}

    ${data.students && data.students.studentStats ? `
    <div class="section">
      <div class="section-title">👨‍🎓 Top 10 Estudantes</div>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Curso</th>
            <th>Atendimentos</th>
            <th>Concluídos</th>
            <th>Taxa</th>
            <th>Avaliação</th>
            <th>Horas</th>
          </tr>
        </thead>
        <tbody>
          ${data.students.studentStats
            .sort((a: any, b: any) => b.total_attendances - a.total_attendances)
            .slice(0, 10)
            .map((student: any) => `
              <tr>
                <td>${student.student_name || 'N/A'}</td>
                <td>${student.course || 'N/A'}</td>
                <td>${student.total_attendances || 0}</td>
                <td>${student.completed_attendances || 0}</td>
                <td>${student.completion_rate?.toFixed(1) || 0}%</td>
                <td>⭐ ${student.avg_rating?.toFixed(1) || 0}</td>
                <td>${((student.hours_logged || 0) / 60).toFixed(1)}h</td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${data.services && data.services.serviceStats ? `
    <div class="section">
      <div class="section-title">⚙️ Serviços Mais Solicitados</div>
      <table>
        <thead>
          <tr>
            <th>Serviço</th>
            <th>Solicitações</th>
            <th>Concluídos</th>
            <th>Taxa de Conclusão</th>
            <th>Tempo Médio</th>
          </tr>
        </thead>
        <tbody>
          ${data.services.serviceStats
            .sort((a: any, b: any) => b.total_requests - a.total_requests)
            .slice(0, 10)
            .map((service: any) => `
              <tr>
                <td>${service.service_type || 'N/A'}</td>
                <td>${service.total_requests || 0}</td>
                <td>${service.completed || 0}</td>
                <td>${service.completion_rate?.toFixed(1) || 0}%</td>
                <td>${service.avg_duration?.toFixed(0) || 0} min</td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${data.satisfaction && data.satisfaction.satisfactionDistribution ? `
    <div class="section">
      <div class="section-title">⭐ Satisfação do Cliente</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Avaliação Média</div>
          <div class="stat-value">${data.satisfaction.satisfactionDistribution.avg_rating?.toFixed(1) || 0} ⭐</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total de Avaliações</div>
          <div class="stat-value">${data.satisfaction.satisfactionDistribution.total_ratings || 0}</div>
        </div>
      </div>
      ${data.satisfaction.satisfactionDistribution.distribution ? `
      <table>
        <thead>
          <tr>
            <th>Avaliação</th>
            <th>Quantidade</th>
            <th>Percentual</th>
          </tr>
        </thead>
        <tbody>
          ${data.satisfaction.satisfactionDistribution.distribution.map((item: any) => `
            <tr>
              <td>${'⭐'.repeat(item.rating)}</td>
              <td>${item.count || 0}</td>
              <td>${item.percentage?.toFixed(1) || 0}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}
    </div>
    ` : ''}

    <div class="footer">
      <p>Este relatório foi gerado automaticamente pelo sistema NAF</p>
      <p>Para mais informações, entre em contato com a coordenação</p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Funções auxiliares
 */
function getDateRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    week: 'Última Semana',
    month: 'Último Mês',
    quarter: 'Último Trimestre',
    year: 'Último Ano',
    custom: 'Período Personalizado',
    all: 'Todos os Dados'
  }
  return labels[range] || range
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return dateString
  }
}
