'use client'

import { useState, useEffect } from 'react'
import { ExternalLinkIcon, SearchIcon, FilterIcon, EyeIcon, ClockIcon } from 'lucide-react'

interface ExternalCourse {
  id: number
  title: string
  description: string
  course_url: string
  platform: string
  category: string
  difficulty_level: string
  duration: string
  thumbnail_url?: string
  views_count: number
}

export default function ExternalCoursesViewer() {
  const [courses, setCourses] = useState<ExternalCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<ExternalCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchTerm, selectedCategory, selectedLevel, courses])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/external-courses?active=true')
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = [...courses]

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    if (selectedLevel) {
      filtered = filtered.filter(course => course.difficulty_level === selectedLevel)
    }

    setFilteredCourses(filtered)
  }

  const handleCourseClick = async (course: ExternalCourse) => {
    // Incrementar contador de views
    try {
      await fetch(`/api/external-courses/${course.id}/view`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
    }

    // Abrir curso em nova aba
    window.open(course.course_url, '_blank', 'noopener,noreferrer')
  }

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))]
  const levels = ['Iniciante', 'Intermediário', 'Avançado']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cursos Externos</h2>
        <p className="text-sm text-gray-600 mt-1">
          Explore cursos e materiais recomendados para complementar seus estudos
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="md:col-span-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cursos por título ou descrição..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FilterIcon className="inline w-4 h-4 mr-1" />
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Nível */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FilterIcon className="inline w-4 h-4 mr-1" />
              Nível
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os níveis</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Botão Limpar */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setSelectedLevel('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Resultados */}
        {(searchTerm || selectedCategory || selectedLevel) && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredCourses.length} de {courses.length} cursos
          </div>
        )}
      </div>

      {/* Lista de Cursos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando cursos...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm || selectedCategory || selectedLevel
              ? 'Nenhum curso encontrado com os filtros selecionados'
              : 'Nenhum curso disponível no momento'}
          </p>
          {(searchTerm || selectedCategory || selectedLevel) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setSelectedLevel('')
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              onClick={() => handleCourseClick(course)}
            >
              {/* Thumbnail */}
              {course.thumbnail_url ? (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <ExternalLinkIcon className="w-16 h-16 text-white opacity-50" />
                </div>
              )}

              {/* Conteúdo */}
              <div className="p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {course.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {course.category}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.difficulty_level === 'Iniciante' ? 'bg-green-100 text-green-800' :
                    course.difficulty_level === 'Intermediário' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.difficulty_level}
                  </span>
                  {course.platform && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {course.platform}
                    </span>
                  )}
                </div>

                {/* Título */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>

                {/* Descrição */}
                {course.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {course.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {course.duration && (
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    {course.views_count} {course.views_count === 1 ? 'visualização' : 'visualizações'}
                  </div>
                </div>

                {/* Botão Acessar */}
                <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                  Acessar Curso
                  <ExternalLinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      {courses.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-gray-600 mt-1">Cursos Disponíveis</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Categorias</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {courses.reduce((sum, c) => sum + c.views_count, 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total de Acessos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600">
                {new Set(courses.map(c => c.platform)).size}
              </div>
              <div className="text-sm text-gray-600 mt-1">Plataformas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
