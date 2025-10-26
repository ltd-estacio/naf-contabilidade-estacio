'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ExternalLinkIcon, EyeIcon } from 'lucide-react'

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
  is_active: boolean
  views_count: number
  created_at: string
}

export default function ExternalCoursesManager() {
  const [courses, setCourses] = useState<ExternalCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<ExternalCourse | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_url: '',
    platform: '',
    category: '',
    difficulty_level: 'Iniciante',
    duration: '',
    thumbnail_url: '',
    is_active: true
  })

  const categories = ['Contabilidade', 'Fiscal', 'Tributário', 'Trabalhista', 'Empresarial', 'Outros']
  const platforms = ['YouTube', 'Coursera', 'Udemy', 'edX', 'LinkedIn Learning', 'Outro']
  const difficulties = ['Iniciante', 'Intermediário', 'Avançado']

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/external-courses?active=false')
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
      alert('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.course_url) {
      alert('Título e URL são obrigatórios')
      return
    }

    try {
      const url = editingCourse 
        ? '/api/external-courses'
        : '/api/external-courses'
      
      const body = editingCourse
        ? { ...formData, id: editingCourse.id }
        : formData

      const response = await fetch(url, {
        method: editingCourse ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar curso')
      }

      alert(editingCourse ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!')
      setShowForm(false)
      setEditingCourse(null)
      resetForm()
      loadCourses()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar curso')
    }
  }

  const handleEdit = (course: ExternalCourse) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      course_url: course.course_url,
      platform: course.platform || '',
      category: course.category || '',
      difficulty_level: course.difficulty_level || 'Iniciante',
      duration: course.duration || '',
      thumbnail_url: course.thumbnail_url || '',
      is_active: course.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return

    try {
      const response = await fetch(`/api/external-courses?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir curso')
      }

      alert('Curso excluído com sucesso!')
      loadCourses()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir curso')
    }
  }

  const toggleActive = async (course: ExternalCourse) => {
    try {
      const response = await fetch('/api/external-courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: course.id,
          is_active: !course.is_active
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      loadCourses()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar status do curso')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      course_url: '',
      platform: '',
      category: '',
      difficulty_level: 'Iniciante',
      duration: '',
      thumbnail_url: '',
      is_active: true
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cursos Externos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie links de cursos e materiais para os estudantes
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingCourse(null)
            resetForm()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Novo Curso
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCourse ? 'Editar Curso' : 'Novo Curso'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Curso *
                </label>
                <input
                  type="url"
                  value={formData.course_url}
                  onChange={(e) => setFormData({ ...formData, course_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plataforma
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {platforms.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Dificuldade
                </label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {difficulties.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 4 horas, 2 semanas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem (opcional)
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  Curso ativo e visível para estudantes
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Descreva o conteúdo e objetivos do curso..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCourse(null)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCourse ? 'Atualizar' : 'Criar'} Curso
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Cursos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando cursos...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhum curso cadastrado ainda</p>
          <p className="text-sm text-gray-400 mt-2">Clique em "Novo Curso" para adicionar o primeiro</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plataforma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visualizações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {course.thumbnail_url && (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          {course.duration && (
                            <div className="text-xs text-gray-500">{course.duration}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {course.platform || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {course.category || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.difficulty_level === 'Iniciante' ? 'bg-green-100 text-green-800' :
                        course.difficulty_level === 'Intermediário' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.difficulty_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4 text-gray-400" />
                        {course.views_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(course)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          course.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {course.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={course.course_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="Abrir curso"
                        >
                          <ExternalLinkIcon className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Total de Cursos</div>
            <div className="text-3xl font-bold mt-2">{courses.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Cursos Ativos</div>
            <div className="text-3xl font-bold mt-2">
              {courses.filter(c => c.is_active).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Total de Views</div>
            <div className="text-3xl font-bold mt-2">
              {courses.reduce((sum, c) => sum + c.views_count, 0)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Categorias</div>
            <div className="text-3xl font-bold mt-2">
              {new Set(courses.map(c => c.category)).size}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
