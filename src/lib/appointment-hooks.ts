// Example integration hooks for appointment management with notifications

import { NotificationService, NotificationTriggers } from './notifications'

// Example of how to integrate notification triggers with appointment workflow

export class AppointmentHooks {
  // Called when a new appointment is created
  static async onAppointmentCreated(appointmentData: unknown) {
    console.log('🔔 Triggering notifications for new appointment:', appointmentData.protocol)

    try {
      // Trigger notification workflows
      await NotificationTriggers.onAppointmentCreated(appointmentData)

      // Log the notification event
      console.log('✅ Appointment creation notifications sent successfully')
    } catch (error) {
      console.error('❌ Error sending appointment creation notifications:', error)
    }
  }

  // Called when appointment status changes
  static async onAppointmentStatusUpdate(appointmentId: string, oldStatus: string, newStatus: string, appointmentData: unknown) {
    console.log('🔄 Appointment status changed:', `${oldStatus} → ${newStatus}`)

    try {
      // Trigger status change notifications
      await NotificationTriggers.onAppointmentStatusChanged(appointmentData, oldStatus, newStatus)

      // Specific actions based on status
      switch (newStatus) {
        case 'CONFIRMADO':
          console.log('✅ Appointment confirmed - notifications sent')
          break
        case 'CONCLUIDO':
          console.log('🏁 Appointment completed - notifications sent')
          // Could trigger performance tracking here
          break
        case 'CANCELADO':
          console.log('❌ Appointment cancelled')
          // Could trigger cancellation notifications
          break
      }
    } catch (error) {
      console.error('❌ Error sending status change notifications:', error)
    }
  }

  // Called when a document is required for an appointment
  static async onDocumentRequired(appointmentData: unknown, requiredDocuments: string[]) {
    console.log('📄 Documents required for appointment:', appointmentData.protocol)

    try {
      // Notify assigned student about required documents
      if (appointmentData.assigned_student_id) {
        await NotificationService.notifyDocumentRequired(
          {
            client_name: appointmentData.client_name,
            service_type: appointmentData.service_type,
            appointment_id: appointmentData.id,
            required_documents: requiredDocuments.join(', ')
          },
          appointmentData.assigned_student_id,
          'student'
        )
      }

      console.log('✅ Document requirement notifications sent')
    } catch (error) {
      console.error('❌ Error sending document requirement notifications:', error)
    }
  }

  // Called when an appointment is assigned to a student
  static async onAppointmentAssigned(appointmentData: unknown, studentId: string) {
    console.log('👤 Appointment assigned to student:', studentId)

    try {
      // Send assignment notification
      await NotificationService.notifyAppointmentScheduled(
        appointmentData,
        studentId,
        'student'
      )

      console.log('✅ Assignment notification sent to student')
    } catch (error) {
      console.error('❌ Error sending assignment notification:', error)
    }
  }
}

// Example training workflow hooks
export class TrainingHooks {
  // Called when a training is assigned to a student
  static async onTrainingAssigned(trainingData: unknown, studentId: string) {
    console.log('📚 Training assigned to student:', trainingData.title)

    try {
      await NotificationTriggers.onTrainingAssigned(trainingData, studentId)
      console.log('✅ Training assignment notification sent')
    } catch (error) {
      console.error('❌ Error sending training assignment notification:', error)
    }
  }

  // Called when a student completes a training
  static async onTrainingCompleted(trainingData: unknown, studentId: string, score?: number) {
    console.log('🎓 Training completed by student:', trainingData.title, 'Score:', score)

    try {
      await NotificationTriggers.onTrainingCompleted(trainingData, studentId, score)

      // If high score, could trigger achievement notification
      if (score && score >= 90) {
        await NotificationService.notifyAchievementEarned(
          {
            id: 'high-score-achievement',
            title: 'Excelência Acadêmica',
            description: `Conquistou nota ${score}% no treinamento "${trainingData.title}"`,
            points: 100
          },
          studentId,
          'student'
        )
      }

      console.log('✅ Training completion notifications sent')
    } catch (error) {
      console.error('❌ Error sending training completion notifications:', error)
    }
  }
}

// Example system event hooks
export class SystemHooks {
  // Daily scheduled tasks
  static async onDailyTasks() {
    console.log('⏰ Running daily notification tasks...')

    try {
      // Send appointment reminders
      await NotificationTriggers.onDailyAppointmentReminders()

      console.log('✅ Daily notification tasks completed')
    } catch (error) {
      console.error('❌ Error running daily tasks:', error)
    }
  }

  // Weekly scheduled tasks
  static async onWeeklyTasks() {
    console.log('📊 Running weekly notification tasks...')

    try {
      // Generate performance reports
      await NotificationTriggers.onWeeklyPerformanceReports()

      console.log('✅ Weekly notification tasks completed')
    } catch (error) {
      console.error('❌ Error running weekly tasks:', error)
    }
  }

  // System maintenance notifications
  static async onSystemMaintenance(maintenanceInfo: unknown) {
    console.log('🔧 System maintenance scheduled:', maintenanceInfo.scheduled_date)

    try {
      await NotificationTriggers.onSystemMaintenance(maintenanceInfo)
      console.log('✅ Maintenance notifications sent to all users')
    } catch (error) {
      console.error('❌ Error sending maintenance notifications:', error)
    }
  }
}

// Example usage in API routes or service functions:

/*
// In appointment creation API:
export async function createAppointment(appointmentData: any) {
  // ... create appointment in database

  // Trigger notifications
  await AppointmentHooks.onAppointmentCreated(appointmentData)

  return appointmentData
}

// In appointment status update API:
export async function updateAppointmentStatus(appointmentId: string, newStatus: string) {
  const oldStatus = // ... fetch old status from database
  // ... update status in database
  const appointmentData = // ... fetch updated appointment data

  // Trigger notifications
  await AppointmentHooks.onAppointmentStatusUpdate(appointmentId, oldStatus, newStatus, appointmentData)

  return appointmentData
}

// In training assignment:
export async function assignTraining(trainingId: string, studentId: string) {
  // ... assign training in database
  const trainingData = // ... fetch training details

  // Trigger notifications
  await TrainingHooks.onTrainingAssigned(trainingData, studentId)
}

// In cron job or scheduled task:
export async function dailyNotificationTasks() {
  await SystemHooks.onDailyTasks()
}
*/

// Utility function to test notifications
export async function testNotifications() {
  console.log('🧪 Testing notification system...')

  // Test appointment notification
  const testAppointment = {
    id: 'test-appt-1',
    protocol: 'TEST-001',
    client_name: 'João da Silva',
    service_type: 'Declaração de IR',
    scheduled_date: '2025-01-15',
    scheduled_time: '14:00',
    assigned_student_id: 'student-1'
  }

  await AppointmentHooks.onAppointmentCreated(testAppointment)

  // Test training notification
  const testTraining = {
    id: 'test-training-1',
    title: 'Fundamentos de Contabilidade',
    difficulty: 'BÁSICO',
    duration_minutes: 60
  }

  await TrainingHooks.onTrainingAssigned(testTraining, 'student-1')

  console.log('✅ Notification tests completed')
}