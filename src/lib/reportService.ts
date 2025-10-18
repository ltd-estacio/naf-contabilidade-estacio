import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, HeadingLevel } from 'docx'
import Papa from 'papaparse'

export interface ReportData {
  student: {
    id: string
    name: string
    email: string
    course: string
    semester: string
    registrationNumber: string
    university: string
  }
  stats: {
    totalAttendances: number
    completedAttendances: number
    cancelledAttendances: number
    scheduledAttendances: number
    inProgressAttendances: number
    noShowAttendances: number
    successRate: number
    avgRating: number
    avgPerformanceScore: number
    completedTrainings: number
    totalTrainings: number
    totalFeedbacks: number
    avgFeedbackRating: number
  }
  attendances: Array<{
    id: string
    protocol: string
    client_name: string
    service_type: string
    status: string
    scheduled_date: string
    scheduled_time: string
    urgency: string
    is_online: boolean
    client_satisfaction_rating?: number
    feedback?: string
  }>
  fiscalAppointments?: Array<{
    id: string
    protocol?: string
    client_name?: string
    service_description?: string
    status: string
    appointment_date: string
    student_name?: string
    feedback?: {
      rating: number
      comment: string
      strengths: string[]
      improvements: string[]
    }
  }>
  trainings: Array<{
    id: string
    title: string
    difficulty: string
    duration_minutes: number
    is_completed: boolean
    score?: number
    completed_at?: string
  }>
  evaluations: Array<{
    evaluation_date: string
    technical_score: number
    communication_score: number
    punctuality_score: number
    professionalism_score: number
    overall_score: number
    feedback: string
  }>
}

export interface ReportTemplate {
  title: string
  subtitle: string
  includeSummary: boolean
  includeAttendances: boolean
  includeTrainings: boolean
  includeEvaluations: boolean
  includeCharts: boolean
}

export class ReportService {
  static async generatePDF(data: ReportData, template: ReportTemplate): Promise<Blob> {
    const doc = new jsPDF()
    let yPosition = 20

    // Função para adicionar texto com quebra automática
    const addText = (text: string, x: number, y: number, maxWidth: number = 170) => {
      const splitText = doc.splitTextToSize(text, maxWidth)
      doc.text(splitText, x, y)
      return y + (splitText.length * 7)
    }

    // Cabeçalho
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    yPosition = addText(template.title, 20, yPosition)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    yPosition = addText(template.subtitle, 20, yPosition + 5)

    doc.setFontSize(10)
    yPosition = addText(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition + 5)

    // Informações do Estudante
    yPosition += 15
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    yPosition = addText('INFORMAÇÕES DO ESTUDANTE', 20, yPosition)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPosition = addText(`Nome: ${data.student.name}`, 20, yPosition + 5)
    yPosition = addText(`Email: ${data.student.email}`, 20, yPosition + 3)
    yPosition = addText(`Curso: ${data.student.course}`, 20, yPosition + 3)
    yPosition = addText(`Semestre: ${data.student.semester}`, 20, yPosition + 3)
    yPosition = addText(`Matrícula: ${data.student.registrationNumber}`, 20, yPosition + 3)
    yPosition = addText(`Universidade: ${data.student.university}`, 20, yPosition + 3)

    // Resumo Estatístico
    if (template.includeSummary) {
      yPosition += 15
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('RESUMO ESTATÍSTICO', 20, yPosition)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      yPosition = addText(`Total de Atendimentos: ${data.stats.totalAttendances}`, 20, yPosition + 5)
      yPosition = addText(`  • Concluídos: ${data.stats.completedAttendances}`, 25, yPosition + 3)
      yPosition = addText(`  • Agendados: ${data.stats.scheduledAttendances}`, 25, yPosition + 3)
      yPosition = addText(`  • Em Andamento: ${data.stats.inProgressAttendances}`, 25, yPosition + 3)
      yPosition = addText(`  • Cancelados: ${data.stats.cancelledAttendances}`, 25, yPosition + 3)
      yPosition = addText(`  • Não Compareceu: ${data.stats.noShowAttendances}`, 25, yPosition + 3)
      yPosition = addText(`Taxa de Sucesso: ${data.stats.successRate}%`, 20, yPosition + 5)
      yPosition = addText(`Avaliação Média dos Clientes: ${data.stats.avgRating.toFixed(1)}/5`, 20, yPosition + 3)
      yPosition = addText(`Performance Geral: ${data.stats.avgPerformanceScore.toFixed(1)}/5`, 20, yPosition + 3)
      yPosition = addText(`Treinamentos Concluídos: ${data.stats.completedTrainings}/${data.stats.totalTrainings}`, 20, yPosition + 3)
      if (data.stats.totalFeedbacks > 0) {
        yPosition = addText(`Total de Feedbacks Recebidos: ${data.stats.totalFeedbacks}`, 20, yPosition + 3)
        yPosition = addText(`Avaliação Média nos Feedbacks: ${data.stats.avgFeedbackRating.toFixed(1)}/5`, 20, yPosition + 3)
      }
    }

    // Verificar se precisa de nova página
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    // Tabela de Atendimentos
    if (template.includeAttendances && data.attendances.length > 0) {
      yPosition += 15
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('ATENDIMENTOS REALIZADOS', 20, yPosition)

      const attendanceData = data.attendances.map(att => [
        att.protocol,
        att.client_name,
        att.service_type,
        att.status,
        new Date(att.scheduled_date).toLocaleDateString('pt-BR'),
        att.urgency,
        att.is_online ? 'Online' : 'Presencial',
        att.client_satisfaction_rating ? att.client_satisfaction_rating.toString() : 'N/A'
      ])

      ;(doc as unknown).autoTable({
        head: [['Protocolo', 'Cliente', 'Serviço', 'Status', 'Data', 'Urgência', 'Tipo', 'Avaliação']],
        body: attendanceData,
        startY: yPosition + 5,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 15 },
          6: { cellWidth: 20 },
          7: { cellWidth: 15 }
        }
      })

      yPosition = (doc as unknown).lastAutoTable.finalY + 10
    }

    // Nova página se necessário
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    // Tabela de Treinamentos
    if (template.includeTrainings && data.trainings.length > 0) {
      yPosition += 15
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('TREINAMENTOS', 20, yPosition)

      const trainingData = data.trainings.map(training => [
        training.title,
        training.difficulty,
        `${training.duration_minutes} min`,
        training.is_completed ? 'Concluído' : 'Pendente',
        training.score ? training.score.toString() : 'N/A',
        training.completed_at ? new Date(training.completed_at).toLocaleDateString('pt-BR') : 'N/A'
      ])

      ;(doc as unknown).autoTable({
        head: [['Título', 'Dificuldade', 'Duração', 'Status', 'Nota', 'Data Conclusão']],
        body: trainingData,
        startY: yPosition + 5,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [46, 204, 113] },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 15 },
          5: { cellWidth: 25 }
        }
      })

      yPosition = (doc as unknown).lastAutoTable.finalY + 10
    }

    // Nova página se necessário
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    // Feedbacks dos Atendimentos Fiscais
    if (data.fiscalAppointments && data.fiscalAppointments.length > 0) {
      const appointmentsWithFeedback = data.fiscalAppointments.filter(f => f.feedback)

      if (appointmentsWithFeedback.length > 0) {
        yPosition += 15
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        yPosition = addText('FEEDBACKS DOS ATENDIMENTOS', 20, yPosition)

        appointmentsWithFeedback.forEach(appointment => {
          if (yPosition > 240) {
            doc.addPage()
            yPosition = 20
          }

          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          yPosition = addText(`Atendimento: ${appointment.protocol || appointment.id}`, 20, yPosition + 8)

          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          yPosition = addText(`Cliente: ${appointment.client_name || 'N/A'}`, 20, yPosition + 4)
          yPosition = addText(`Data: ${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}`, 20, yPosition + 3)
          yPosition = addText(`Status: ${appointment.status}`, 20, yPosition + 3)

          if (appointment.feedback) {
            yPosition = addText(`Avaliação: ${appointment.feedback.rating}/5`, 20, yPosition + 3)
            yPosition = addText(`Comentário: ${appointment.feedback.comment}`, 20, yPosition + 3)

            if (appointment.feedback.strengths && appointment.feedback.strengths.length > 0) {
              yPosition = addText(`Pontos Fortes:`, 20, yPosition + 3)
              appointment.feedback.strengths.forEach(strength => {
                yPosition = addText(`  • ${strength}`, 25, yPosition + 3)
              })
            }

            if (appointment.feedback.improvements && appointment.feedback.improvements.length > 0) {
              yPosition = addText(`Pontos a Melhorar:`, 20, yPosition + 3)
              appointment.feedback.improvements.forEach(improvement => {
                yPosition = addText(`  • ${improvement}`, 25, yPosition + 3)
              })
            }
          }

          yPosition += 3
        })

        // Verificar se precisa de nova página
        if (yPosition > 220) {
          doc.addPage()
          yPosition = 20
        }
      }
    }

    // Tabela de Avaliações
    if (template.includeEvaluations && data.evaluations.length > 0) {
      yPosition += 15
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('AVALIAÇÕES DE DESEMPENHO', 20, yPosition)

      const evaluationData = data.evaluations.map(evaluation => [
        new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR'),
        evaluation.technical_score.toString(),
        evaluation.communication_score.toString(),
        evaluation.punctuality_score.toString(),
        evaluation.professionalism_score.toString(),
        evaluation.overall_score.toFixed(1),
        evaluation.feedback.substring(0, 50) + (evaluation.feedback.length > 50 ? '...' : '')
      ])

      ;(doc as unknown).autoTable({
        head: [['Data', 'Técnico', 'Comunicação', 'Pontualidade', 'Profissionalismo', 'Geral', 'Feedback']],
        body: evaluationData,
        startY: yPosition + 5,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [155, 89, 182] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 15 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 15 },
          6: { cellWidth: 55 }
        }
      })
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Relatório gerado pelo Sistema NAF - Página ${i} de ${pageCount}`,
        20,
        280
      )
    }

    return new Blob([doc.output('blob')], { type: 'application/pdf' })
  }

  static async generateDOCX(data: ReportData, template: ReportTemplate): Promise<Blob> {
    const children: unknown[] = []

    // Título
    children.push(
      new Paragraph({
        children: [new TextRun({ text: template.title, bold: true, size: 24 })],
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.TITLE
      })
    )

    children.push(
      new Paragraph({
        children: [new TextRun({ text: template.subtitle, size: 16 })],
        alignment: AlignmentType.CENTER
      })
    )

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, size: 12 })],
        alignment: AlignmentType.RIGHT
      })
    )

    children.push(new Paragraph({ text: "" })) // Linha em branco

    // Informações do Estudante
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "INFORMAÇÕES DO ESTUDANTE", bold: true, size: 16 })],
        heading: HeadingLevel.HEADING_1
      })
    )

    children.push(new Paragraph({ children: [new TextRun({ text: `Nome: ${data.student.name}` })] }))
    children.push(new Paragraph({ children: [new TextRun({ text: `Email: ${data.student.email}` })] }))
    children.push(new Paragraph({ children: [new TextRun({ text: `Curso: ${data.student.course}` })] }))
    children.push(new Paragraph({ children: [new TextRun({ text: `Semestre: ${data.student.semester}` })] }))
    children.push(new Paragraph({ children: [new TextRun({ text: `Matrícula: ${data.student.registrationNumber}` })] }))
    children.push(new Paragraph({ children: [new TextRun({ text: `Universidade: ${data.student.university}` })] }))

    children.push(new Paragraph({ text: "" })) // Linha em branco

    // Resumo Estatístico
    if (template.includeSummary) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "RESUMO ESTATÍSTICO", bold: true, size: 16 })],
          heading: HeadingLevel.HEADING_1
        })
      )

      children.push(new Paragraph({ children: [new TextRun({ text: `Total de Atendimentos: ${data.stats.totalAttendances}` })] }))
      children.push(new Paragraph({ children: [new TextRun({ text: `Atendimentos Concluídos: ${data.stats.completedAttendances}` })] }))
      children.push(new Paragraph({ children: [new TextRun({ text: `Taxa de Sucesso: ${data.stats.successRate}%` })] }))
      children.push(new Paragraph({ children: [new TextRun({ text: `Avaliação Média dos Clientes: ${data.stats.avgRating.toFixed(1)}/5` })] }))
      children.push(new Paragraph({ children: [new TextRun({ text: `Performance Geral: ${data.stats.avgPerformanceScore.toFixed(1)}/5` })] }))
      children.push(new Paragraph({ children: [new TextRun({ text: `Treinamentos Concluídos: ${data.stats.completedTrainings}/${data.stats.totalTrainings}` })] }))

      children.push(new Paragraph({ text: "" })) // Linha em branco
    }

    // Tabela de Atendimentos
    if (template.includeAttendances && data.attendances.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "ATENDIMENTOS REALIZADOS", bold: true, size: 16 })],
          heading: HeadingLevel.HEADING_1
        })
      )

      const attendanceRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Protocolo", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Cliente", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Serviço", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Data", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Urgência", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tipo", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Avaliação", bold: true })] })] })
          ]
        })
      ]

      data.attendances.forEach(att => {
        attendanceRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: att.protocol })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: att.client_name })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: att.service_type })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: att.status })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: new Date(att.scheduled_date).toLocaleDateString('pt-BR') })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: att.urgency })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: att.is_online ? 'Online' : 'Presencial' })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: att.client_satisfaction_rating?.toString() || 'N/A' })] })] })
            ]
          })
        )
      })

      children.push(new Table({ rows: attendanceRows }))
      children.push(new Paragraph({ text: "" })) // Linha em branco
    }

    // Tabela de Treinamentos
    if (template.includeTrainings && data.trainings.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "TREINAMENTOS", bold: true, size: 16 })],
          heading: HeadingLevel.HEADING_1
        })
      )

      const trainingRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Título", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Dificuldade", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Duração", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nota", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Data Conclusão", bold: true })] })] })
          ]
        })
      ]

      data.trainings.forEach(training => {
        trainingRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: training.title })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: training.difficulty })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${training.duration_minutes} min` })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: training.is_completed ? 'Concluído' : 'Pendente' })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: training.score?.toString() || 'N/A' })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: training.completed_at ? new Date(training.completed_at).toLocaleDateString('pt-BR') : 'N/A' })] })] })
            ]
          })
        )
      })

      children.push(new Table({ rows: trainingRows }))
      children.push(new Paragraph({ text: "" })) // Linha em branco
    }

    // Tabela de Avaliações
    if (template.includeEvaluations && data.evaluations.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "AVALIAÇÕES DE DESEMPENHO", bold: true, size: 16 })],
          heading: HeadingLevel.HEADING_1
        })
      )

      const evaluationRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Data", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Técnico", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Comunicação", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Pontualidade", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Profissionalismo", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Geral", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Feedback", bold: true })] })] })
          ]
        })
      ]

      data.evaluations.forEach(evaluation => {
        evaluationRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR') })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: evaluation.technical_score.toString() })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: evaluation.communication_score.toString() })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: evaluation.punctuality_score.toString() })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: evaluation.professionalism_score.toString() })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: evaluation.overall_score.toFixed(1) })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: evaluation.feedback })] })] })
            ]
          })
        )
      })

      children.push(new Table({ rows: evaluationRows }))
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    })

    const buffer = await Packer.toBuffer(doc)
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  }

  static async generateCSV(data: ReportData): Promise<Blob> {
    const csvData: unknown[] = []

    // Cabeçalho
    csvData.push(['RELATÓRIO DO ESTUDANTE'])
    csvData.push(['Data de Geração', new Date().toLocaleDateString('pt-BR')])
    csvData.push([])

    // Informações do Estudante
    csvData.push(['INFORMAÇÕES DO ESTUDANTE'])
    csvData.push(['Nome', data.student.name])
    csvData.push(['Email', data.student.email])
    csvData.push(['Curso', data.student.course])
    csvData.push(['Semestre', data.student.semester])
    csvData.push(['Matrícula', data.student.registrationNumber])
    csvData.push(['Universidade', data.student.university])
    csvData.push([])

    // Estatísticas
    csvData.push(['RESUMO ESTATÍSTICO'])
    csvData.push(['Total de Atendimentos', data.stats.totalAttendances])
    csvData.push(['Atendimentos Concluídos', data.stats.completedAttendances])
    csvData.push(['Taxa de Sucesso (%)', data.stats.successRate])
    csvData.push(['Avaliação Média dos Clientes', data.stats.avgRating.toFixed(1)])
    csvData.push(['Performance Geral', data.stats.avgPerformanceScore.toFixed(1)])
    csvData.push(['Treinamentos Concluídos', `${data.stats.completedTrainings}/${data.stats.totalTrainings}`])
    csvData.push([])

    // Atendimentos
    if (data.attendances.length > 0) {
      csvData.push(['ATENDIMENTOS REALIZADOS'])
      csvData.push(['Protocolo', 'Cliente', 'Serviço', 'Status', 'Data', 'Urgência', 'Tipo', 'Avaliação'])

      data.attendances.forEach(att => {
        csvData.push([
          att.protocol,
          att.client_name,
          att.service_type,
          att.status,
          new Date(att.scheduled_date).toLocaleDateString('pt-BR'),
          att.urgency,
          att.is_online ? 'Online' : 'Presencial',
          att.client_satisfaction_rating || 'N/A'
        ])
      })
      csvData.push([])
    }

    // Treinamentos
    if (data.trainings.length > 0) {
      csvData.push(['TREINAMENTOS'])
      csvData.push(['Título', 'Dificuldade', 'Duração (min)', 'Status', 'Nota', 'Data Conclusão'])

      data.trainings.forEach(training => {
        csvData.push([
          training.title,
          training.difficulty,
          training.duration_minutes,
          training.is_completed ? 'Concluído' : 'Pendente',
          training.score || 'N/A',
          training.completed_at ? new Date(training.completed_at).toLocaleDateString('pt-BR') : 'N/A'
        ])
      })
      csvData.push([])
    }

    // Avaliações
    if (data.evaluations.length > 0) {
      csvData.push(['AVALIAÇÕES DE DESEMPENHO'])
      csvData.push(['Data', 'Técnico', 'Comunicação', 'Pontualidade', 'Profissionalismo', 'Geral', 'Feedback'])

      data.evaluations.forEach(evaluation => {
        csvData.push([
          new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR'),
          evaluation.technical_score,
          evaluation.communication_score,
          evaluation.punctuality_score,
          evaluation.professionalism_score,
          evaluation.overall_score.toFixed(1),
          evaluation.feedback
        ])
      })
    }

    const csv = Papa.unparse(csvData)
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }

  static async generateExcel(data: ReportData): Promise<Blob> {
    const workbook = XLSX.utils.book_new()

    // Aba: Resumo
    const summaryData = [
      ['RELATÓRIO DO ESTUDANTE'],
      ['Data de Geração', new Date().toLocaleDateString('pt-BR')],
      [],
      ['INFORMAÇÕES DO ESTUDANTE'],
      ['Nome', data.student.name],
      ['Email', data.student.email],
      ['Curso', data.student.course],
      ['Semestre', data.student.semester],
      ['Matrícula', data.student.registrationNumber],
      ['Universidade', data.student.university],
      [],
      ['RESUMO ESTATÍSTICO'],
      ['Total de Atendimentos', data.stats.totalAttendances],
      ['Atendimentos Concluídos', data.stats.completedAttendances],
      ['Taxa de Sucesso (%)', data.stats.successRate],
      ['Avaliação Média dos Clientes', data.stats.avgRating.toFixed(1)],
      ['Performance Geral', data.stats.avgPerformanceScore.toFixed(1)],
      ['Treinamentos Concluídos', `${data.stats.completedTrainings}/${data.stats.totalTrainings}`]
    ]

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo')

    // Aba: Atendimentos
    if (data.attendances.length > 0) {
      const attendanceData = [
        ['Protocolo', 'Cliente', 'Serviço', 'Status', 'Data', 'Horário', 'Urgência', 'Tipo', 'Avaliação'],
        ...data.attendances.map(att => [
          att.protocol,
          att.client_name,
          att.service_type,
          att.status,
          new Date(att.scheduled_date).toLocaleDateString('pt-BR'),
          att.scheduled_time,
          att.urgency,
          att.is_online ? 'Online' : 'Presencial',
          att.client_satisfaction_rating || 'N/A'
        ])
      ]

      const attendanceWorksheet = XLSX.utils.aoa_to_sheet(attendanceData)
      XLSX.utils.book_append_sheet(workbook, attendanceWorksheet, 'Atendimentos')
    }

    // Aba: Treinamentos
    if (data.trainings.length > 0) {
      const trainingData = [
        ['Título', 'Dificuldade', 'Duração (min)', 'Status', 'Nota', 'Data Conclusão'],
        ...data.trainings.map(training => [
          training.title,
          training.difficulty,
          training.duration_minutes,
          training.is_completed ? 'Concluído' : 'Pendente',
          training.score || 'N/A',
          training.completed_at ? new Date(training.completed_at).toLocaleDateString('pt-BR') : 'N/A'
        ])
      ]

      const trainingWorksheet = XLSX.utils.aoa_to_sheet(trainingData)
      XLSX.utils.book_append_sheet(workbook, trainingWorksheet, 'Treinamentos')
    }

    // Aba: Avaliações
    if (data.evaluations.length > 0) {
      const evaluationData = [
        ['Data', 'Técnico', 'Comunicação', 'Pontualidade', 'Profissionalismo', 'Geral', 'Feedback'],
        ...data.evaluations.map(evaluation => [
          new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR'),
          evaluation.technical_score,
          evaluation.communication_score,
          evaluation.punctuality_score,
          evaluation.professionalism_score,
          evaluation.overall_score.toFixed(1),
          evaluation.feedback
        ])
      ]

      const evaluationWorksheet = XLSX.utils.aoa_to_sheet(evaluationData)
      XLSX.utils.book_append_sheet(workbook, evaluationWorksheet, 'Avaliações')
    }

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  static async generateTXT(data: ReportData, template: ReportTemplate): Promise<Blob> {
    let content = ''

    // Cabeçalho
    content += `${template.title}\n`
    content += `${template.subtitle}\n`
    content += `Data de geração: ${new Date().toLocaleDateString('pt-BR')}\n`
    content += `${'='.repeat(60)}\n\n`

    // Informações do Estudante
    content += `INFORMAÇÕES DO ESTUDANTE\n`
    content += `${'-'.repeat(30)}\n`
    content += `Nome: ${data.student.name}\n`
    content += `Email: ${data.student.email}\n`
    content += `Curso: ${data.student.course}\n`
    content += `Semestre: ${data.student.semester}\n`
    content += `Matrícula: ${data.student.registrationNumber}\n`
    content += `Universidade: ${data.student.university}\n\n`

    // Resumo Estatístico
    if (template.includeSummary) {
      content += `RESUMO ESTATÍSTICO\n`
      content += `${'-'.repeat(30)}\n`
      content += `Total de Atendimentos: ${data.stats.totalAttendances}\n`
      content += `Atendimentos Concluídos: ${data.stats.completedAttendances}\n`
      content += `Taxa de Sucesso: ${data.stats.successRate}%\n`
      content += `Avaliação Média dos Clientes: ${data.stats.avgRating.toFixed(1)}/5\n`
      content += `Performance Geral: ${data.stats.avgPerformanceScore.toFixed(1)}/5\n`
      content += `Treinamentos Concluídos: ${data.stats.completedTrainings}/${data.stats.totalTrainings}\n\n`
    }

    // Atendimentos
    if (template.includeAttendances && data.attendances.length > 0) {
      content += `ATENDIMENTOS REALIZADOS\n`
      content += `${'-'.repeat(30)}\n`

      data.attendances.forEach((att, index) => {
        content += `${index + 1}. ${att.client_name}\n`
        content += `   Protocolo: ${att.protocol}\n`
        content += `   Serviço: ${att.service_type}\n`
        content += `   Status: ${att.status}\n`
        content += `   Data: ${new Date(att.scheduled_date).toLocaleDateString('pt-BR')} às ${att.scheduled_time}\n`
        content += `   Urgência: ${att.urgency}\n`
        content += `   Tipo: ${att.is_online ? 'Online' : 'Presencial'}\n`
        content += `   Avaliação: ${att.client_satisfaction_rating || 'N/A'}\n\n`
      })
    }

    // Treinamentos
    if (template.includeTrainings && data.trainings.length > 0) {
      content += `TREINAMENTOS\n`
      content += `${'-'.repeat(30)}\n`

      data.trainings.forEach((training, index) => {
        content += `${index + 1}. ${training.title}\n`
        content += `   Dificuldade: ${training.difficulty}\n`
        content += `   Duração: ${training.duration_minutes} minutos\n`
        content += `   Status: ${training.is_completed ? 'Concluído' : 'Pendente'}\n`
        content += `   Nota: ${training.score || 'N/A'}\n`
        content += `   Data Conclusão: ${training.completed_at ? new Date(training.completed_at).toLocaleDateString('pt-BR') : 'N/A'}\n\n`
      })
    }

    // Avaliações
    if (template.includeEvaluations && data.evaluations.length > 0) {
      content += `AVALIAÇÕES DE DESEMPENHO\n`
      content += `${'-'.repeat(30)}\n`

      data.evaluations.forEach((evaluation, index) => {
        content += `${index + 1}. Avaliação de ${new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR')}\n`
        content += `   Técnico: ${evaluation.technical_score}/5\n`
        content += `   Comunicação: ${evaluation.communication_score}/5\n`
        content += `   Pontualidade: ${evaluation.punctuality_score}/5\n`
        content += `   Profissionalismo: ${evaluation.professionalism_score}/5\n`
        content += `   Geral: ${evaluation.overall_score.toFixed(1)}/5\n`
        content += `   Feedback: ${evaluation.feedback}\n\n`
      })
    }

    content += `${'='.repeat(60)}\n`
    content += `Relatório gerado pelo Sistema NAF - ${new Date().toLocaleString('pt-BR')}\n`

    return new Blob([content], { type: 'text/plain;charset=utf-8' })
  }

  static getDefaultTemplate(): ReportTemplate {
    return {
      title: 'Relatório de Desempenho do Estudante',
      subtitle: 'Sistema NAF - Núcleo de Apoio Contábil e Fiscal',
      includeSummary: true,
      includeAttendances: true,
      includeTrainings: true,
      includeEvaluations: true,
      includeCharts: false
    }
  }
}