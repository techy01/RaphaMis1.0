import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('communication_messages')
export class CommunicationMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'tenant_id', default: 'tenant_default' })
  tenantId: string;

  @Index()
  @Column({ name: 'patient_id', nullable: true })
  patientId: string;

  @Column({ name: 'patient_name', nullable: true })
  patientName: string;

  @Index()
  @Column({ name: 'recipient_phone' })
  recipientPhone: string;

  @Column({ default: 'sms' })
  channel: string; // 'sms' | 'whatsapp' | 'email'

  @Column({ name: 'fallback_channel', nullable: true })
  fallbackChannel: string;

  @Column({ default: 'NORMAL' })
  priority: string; // 'EMERGENCY_STAT' | 'HIGH' | 'NORMAL'

  @Index()
  @Column({ default: 'GENERAL_BROADCAST' })
  category: string;

  @Column({ name: 'template_key', nullable: true })
  templateKey: string;

  @Column({ name: 'message_body', type: 'text' })
  messageBody: string;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  mediaUrl: string;

  @Index()
  @Column({ default: 'QUEUED' })
  status: string; // 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'OPTED_OUT'

  @Column({ default: 'AfricasTalking' })
  provider: string; // 'AfricasTalking' | 'Twilio' | 'WhatsAppCloud' | 'LocalGsmGateway'

  @Column({ name: 'provider_message_id', nullable: true })
  providerMessageId: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ name: 'cost_estimate', type: 'decimal', precision: 10, scale: 4, default: 0.0 })
  costEstimate: number;

  @Column({ default: 'KES' })
  currency: string;

  @Column({ name: 'sms_segments', type: 'int', default: 1 })
  smsSegments: number;

  @Column({ name: 'patient_response', type: 'json', nullable: true })
  patientResponse: {
    receivedAt: string;
    replyText: string;
    actionTaken?: string;
  };

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
