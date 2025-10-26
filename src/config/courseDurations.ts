// Mapeamento de cursos da Estácio e suas durações em semestres
// Baseado na grade curricular oficial da Estácio

export interface CourseInfo {
  name: string
  duration: number // em semestres
  type: 'Bacharelado' | 'Licenciatura' | 'Tecnólogo'
}

export const ESTACIO_COURSES: Record<string, CourseInfo> = {
  // Bacharelados - Geralmente 8 semestres (4 anos)
  'Ciências Contábeis': { name: 'Ciências Contábeis', duration: 8, type: 'Bacharelado' },
  'Administração': { name: 'Administração', duration: 8, type: 'Bacharelado' },
  'Direito': { name: 'Direito', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Economia': { name: 'Economia', duration: 8, type: 'Bacharelado' },
  'Psicologia': { name: 'Psicologia', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Serviço Social': { name: 'Serviço Social', duration: 8, type: 'Bacharelado' },
  'Enfermagem': { name: 'Enfermagem', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Fisioterapia': { name: 'Fisioterapia', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Nutrição': { name: 'Nutrição', duration: 8, type: 'Bacharelado' },
  'Farmácia': { name: 'Farmácia', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Medicina Veterinária': { name: 'Medicina Veterinária', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Engenharia Civil': { name: 'Engenharia Civil', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Engenharia Elétrica': { name: 'Engenharia Elétrica', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Engenharia Mecânica': { name: 'Engenharia Mecânica', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Engenharia de Produção': { name: 'Engenharia de Produção', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Arquitetura e Urbanismo': { name: 'Arquitetura e Urbanismo', duration: 10, type: 'Bacharelado' }, // 5 anos
  'Jornalismo': { name: 'Jornalismo', duration: 8, type: 'Bacharelado' },
  'Publicidade e Propaganda': { name: 'Publicidade e Propaganda', duration: 8, type: 'Bacharelado' },
  'Relações Públicas': { name: 'Relações Públicas', duration: 8, type: 'Bacharelado' },

  // Licenciaturas - Geralmente 6-8 semestres
  'Pedagogia': { name: 'Pedagogia', duration: 8, type: 'Licenciatura' },
  'Letras': { name: 'Letras', duration: 8, type: 'Licenciatura' },
  'História': { name: 'História', duration: 8, type: 'Licenciatura' },
  'Geografia': { name: 'Geografia', duration: 8, type: 'Licenciatura' },
  'Matemática': { name: 'Matemática', duration: 8, type: 'Licenciatura' },
  'Física': { name: 'Física', duration: 8, type: 'Licenciatura' },
  'Química': { name: 'Química', duration: 8, type: 'Licenciatura' },
  'Biologia': { name: 'Biologia', duration: 8, type: 'Licenciatura' },

  // Tecnólogos - Geralmente 4-6 semestres (2-3 anos)
  'Gestão Financeira': { name: 'Gestão Financeira', duration: 4, type: 'Tecnólogo' },
  'Gestão de Recursos Humanos': { name: 'Gestão de Recursos Humanos', duration: 4, type: 'Tecnólogo' },
  'Marketing': { name: 'Marketing', duration: 4, type: 'Tecnólogo' },
  'Logística': { name: 'Logística', duration: 4, type: 'Tecnólogo' },
  'Gestão Pública': { name: 'Gestão Pública', duration: 4, type: 'Tecnólogo' },
  'Comércio Exterior': { name: 'Comércio Exterior', duration: 4, type: 'Tecnólogo' },
  'Processos Gerenciais': { name: 'Processos Gerenciais', duration: 4, type: 'Tecnólogo' },
  'Análise e Desenvolvimento de Sistemas': { name: 'Análise e Desenvolvimento de Sistemas', duration: 5, type: 'Tecnólogo' },
  'Gestão da Tecnologia da Informação': { name: 'Gestão da Tecnologia da Informação', duration: 4, type: 'Tecnólogo' },
  'Secretariado Executivo': { name: 'Secretariado Executivo', duration: 4, type: 'Tecnólogo' },
  'Turismo': { name: 'Turismo', duration: 4, type: 'Tecnólogo' },
  'Hotelaria': { name: 'Hotelaria', duration: 4, type: 'Tecnólogo' },
  'Gastronomia': { name: 'Gastronomia', duration: 4, type: 'Tecnólogo' },
  'Design Gráfico': { name: 'Design Gráfico', duration: 4, type: 'Tecnólogo' },

  // Outro (valor padrão)
  'Outro': { name: 'Outro', duration: 8, type: 'Bacharelado' }
}

/**
 * Retorna a duração de um curso em semestres
 */
export function getCourseDuration(courseName: string): number {
  return ESTACIO_COURSES[courseName]?.duration || 8
}

/**
 * Retorna informações completas do curso
 */
export function getCourseInfo(courseName: string): CourseInfo | null {
  return ESTACIO_COURSES[courseName] || null
}

/**
 * Gera lista de semestres disponíveis para um curso
 */
export function getSemestersForCourse(courseName: string): string[] {
  const duration = getCourseDuration(courseName)
  return Array.from({ length: duration }, (_, i) => `${i + 1}º Semestre`)
}

/**
 * Verifica se um estudante está no último semestre do curso
 */
export function isLastSemester(courseName: string, currentSemester: string): boolean {
  const duration = getCourseDuration(courseName)
  const semesterNumber = parseInt(currentSemester.replace(/\D/g, ''))
  return semesterNumber === duration
}

/**
 * Calcula se o estudante deve ser removido com base no ano de cadastro e semestre
 * Um estudante é removido se está no último semestre E já passou para o próximo período letivo
 */
export function shouldRemoveStudent(
  courseName: string,
  currentSemester: string,
  registrationYear: number,
  registrationSemester: number // 1 para primeiro semestre, 2 para segundo semestre
): boolean {
  const duration = getCourseDuration(courseName)
  const semesterNumber = parseInt(currentSemester.replace(/\D/g, ''))

  // Se não está no último semestre, não remove
  if (semesterNumber !== duration) {
    return false
  }

  // Calcular o ano e semestre atual
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // Semestre 1: Janeiro a Junho (meses 1-6)
  // Semestre 2: Julho a Dezembro (meses 7-12)
  const currentPeriodSemester = currentMonth <= 6 ? 1 : 2

  // Calcular quantos semestres se passaram desde o cadastro
  const yearsDiff = currentYear - registrationYear
  const semestersPassed = (yearsDiff * 2) + (currentPeriodSemester - registrationSemester)

  // Se passou mais semestres do que a duração do curso, o aluno deveria ter se formado
  return semestersPassed >= duration
}

/**
 * Lista todos os cursos disponíveis
 */
export function getAllCourses(): string[] {
  return Object.keys(ESTACIO_COURSES)
}
