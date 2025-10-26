'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Info, Calendar, MessageCircle } from 'lucide-react'

interface NotificationCenterProps {
  userId: string
  userType: 'student' | 'coordinator' | 'teacher' | 'user'
}

interface Notification {
  id: string
  type: 'appointment' | 'message' | 'system' | 'reminder'
  priority: 'low' | 'medium' | 'high'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionRequired?: boolean
}

export default function NotificationCenter({ userId, userType }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState('all')

  // Simular notificações baseadas no tipo de usuário
  useEffect(() => {
    const mockNotifications: Notification[] = []

    if (userType === 'student') {
      mockNotifications.push(
        {
          id: '1',
          type: 'appointment',
          priority: 'medium',
          title: 'Atendimento Agendado',
          message: 'Você tem um atendimento agendado para amanhã às 14:00',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
          actionRequired: true
        },
        {
          id: '2',
          type: 'system',
          priority: 'low',
          title: 'Sistema Atualizado',
          message: 'O portal do estudante foi atualizado com novas funcionalidades',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          read: true
        }
      )
    } else if (userType === 'coordinator') {
      mockNotifications.push(
        {
          id: '3',
          type: 'message',
          priority: 'high',
          title: 'Nova Solicitação',
          message: 'João Silva solicita atendimento para declaração de IR',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          read: false,
          actionRequired: true
        },
        {
          id: '4',
          type: 'appointment',
          priority: 'medium',
          title: 'Atendimento Concluído',
          message: 'Maria Costa finalizou atendimento de orientação MEI',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          read: false
        }
      )
    } else {
      mockNotifications.push(
        {
          id: '5',
          type: 'system',
          priority: 'low',
          title: 'Bem-vindo ao NAF',
          message: 'Explore nossos serviços de assistência fiscal gratuita',
          timestamp: new Date(),
          read: false
        }
      )
    }

    setNotifications(mockNotifications)
  }, [userType])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'message':
        return <MessageCircle className="h-4 w-4 text-green-600" />
      case 'system':
        return <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'reminder':
        return <Bell className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900'
    }
  }

  const filterNotifications = (filter: string) => {
    if (filter === 'all') return notifications
    if (filter === 'unread') return notifications.filter(n => !n.read)
    if (filter === 'important') return notifications.filter(n => n.priority === 'high' || n.actionRequired)
    return notifications.filter(n => n.type === filter)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Central de Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} não lidas
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">Não Lidas</TabsTrigger>
            <TabsTrigger value="important">Importantes</TabsTrigger>
            <TabsTrigger value="appointment">Agendamentos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-2">
              {filterNotifications(activeTab).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              ) : (
                filterNotifications(activeTab).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 rounded-r-lg ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'border border-gray-200 dark:border-gray-800' : 'opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {notification.actionRequired && (
                              <Badge variant="outline" className="text-xs">
                                Ação necessária
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleString('pt-BR')}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs"
                            >
                              Marcar como lida
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}