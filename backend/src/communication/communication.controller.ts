import { Controller, Post, Get, Body, Query, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { CommunicationService, SendMessageDto } from './communication.service';

@Controller('communication')
export class CommunicationController {
  constructor(private readonly commService: CommunicationService) {}

  @Post('send')
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.commService.sendMessage(dto);
  }

  @Get('messages')
  async getMessages(
    @Query('search') search?: string,
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('patientId') patientId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.commService.getMessages({ search, channel, status, category, patientId, limit, offset });
  }

  @Get('stats')
  async getStats() {
    return this.commService.getStats();
  }

  @Get('templates')
  async getTemplates() {
    return [
      {
        id: 'tpl_appt_24h',
        key: 'APPOINTMENT_REMINDER_24H',
        name: '24-Hour Consultation Reminder',
        channel: 'whatsapp',
        category: 'APPOINTMENT_REMINDER',
        content:
          'Hello {{patientName}}, this is a reminder of your medical consultation tomorrow at {{appointmentTime}} with {{doctorName}} at {{hospitalName}}. Please reply 1 to Confirm or 2 to Reschedule.',
        variables: ['patientName', 'appointmentTime', 'doctorName', 'hospitalName'],
        isActive: true,
        whatsappApproved: true,
        description: 'Interactive reminder with automated 1/2 response handling.',
      },
      {
        id: 'tpl_news2_stat',
        key: 'NEWS2_EMERGENCY_ESCALATION',
        name: 'Critical NEWS2 Triage Escalation',
        channel: 'sms',
        category: 'CRITICAL_NEWS2_ALERT',
        content:
          'CRITICAL STAT ALERT: Patient {{patientName}} (MRN: {{patientMrn}}) in {{wardBed}} has NEWS2 Score {{news2Score}} (High Risk). Immediate attending physician review required.',
        variables: ['patientName', 'patientMrn', 'wardBed', 'news2Score'],
        isActive: true,
        whatsappApproved: false,
        description: 'Dispatched to on-call physician and ward charge sister.',
      },
      {
        id: 'tpl_rx_ready',
        key: 'PRESCRIPTION_DISPENSED_PICKUP',
        name: 'Pharmacy Medication Ready for Pickup',
        channel: 'whatsapp',
        category: 'PRESCRIPTION_READY',
        content:
          'Dear {{patientName}}, your medications prescribed by {{doctorName}} are ready for pickup at {{hospitalName}} Outpatient Pharmacy. Please present Locker Token Code: #{{pickupCode}}.',
        variables: ['patientName', 'doctorName', 'hospitalName', 'pickupCode'],
        isActive: true,
        whatsappApproved: true,
        description: 'Includes secure dispensing token and locker number.',
      },
      {
        id: 'tpl_gatepass_code',
        key: 'DISCHARGE_GATEPASS_SMS',
        name: 'Discharge Gatepass & Settlement Code',
        channel: 'sms',
        category: 'DISCHARGE_GATEPASS',
        content:
          'RaphaMIS Security Clearance: Patient {{patientName}} has received clinical and financial discharge. Gatepass No: {{gatepassCode}}. Present this code at hospital security exit.',
        variables: ['patientName', 'gatepassCode'],
        isActive: true,
        whatsappApproved: false,
        description: 'Official digital exit pass code for security checkpoint.',
      },
      {
        id: 'tpl_panic_lab',
        key: 'LAB_PANIC_VALUE_DOCTOR',
        name: 'Panic Lab Value Urgent Notification',
        channel: 'sms',
        category: 'LAB_PANIC_VALUE',
        content:
          'PANIC VALUE WARNING: Patient {{patientName}} (MRN: {{patientMrn}}) has abnormal diagnostic test {{testName}}: {{panicResult}} (Ref: {{referenceRange}}). Action required immediately.',
        variables: ['patientName', 'patientMrn', 'testName', 'panicResult', 'referenceRange'],
        isActive: true,
        whatsappApproved: false,
        description: 'Emergency notification dispatched to requesting doctor.',
      },
      {
        id: 'tpl_telemed_link',
        key: 'TELEMEDICINE_SESSION_INVITE',
        name: 'Telemedicine Video Consultation Link',
        channel: 'whatsapp',
        category: 'TELEMEDICINE_INVITE',
        content:
          'Hello {{patientName}}, your encrypted video consultation with {{doctorName}} starts in 15 minutes. Join via your secure patient portal link: {{sessionUrl}}.',
        variables: ['patientName', 'doctorName', 'sessionUrl'],
        isActive: true,
        whatsappApproved: true,
        description: 'Secure WebRTC consultation room link.',
      },
    ];
  }

  @Post('webhook/status')
  @HttpCode(HttpStatus.OK)
  async handleDeliveryWebhook(@Body() body: any) {
    const providerMessageId = body.id || body.MessageSid || body.messageId;
    const rawStatus = (body.status || body.MessageStatus || '').toUpperCase();

    let status: 'DELIVERED' | 'READ' | 'FAILED' = 'DELIVERED';
    if (rawStatus === 'READ') status = 'READ';
    if (rawStatus === 'FAILED' || rawStatus === 'UNDELIVERED') status = 'FAILED';

    return this.commService.handleDeliveryStatusWebhook(providerMessageId, status, body.description || body.ErrorMessage);
  }

  @Post('webhook/inbound')
  @HttpCode(HttpStatus.OK)
  async handleInboundReply(@Body() body: any) {
    const fromPhone = body.from || body.From || body.sender;
    const text = body.text || body.Body || body.message || '';
    return this.commService.handleInboundReplyWebhook(fromPhone, text);
  }

  @Post('test-gateway')
  async testGatewayConnection(@Body() body: { provider: string; recipientPhone: string }) {
    const testPhone = body.recipientPhone || '+254700000000';
    const provider = body.provider || 'AfricasTalking';

    return this.commService.sendMessage({
      recipientPhone: testPhone,
      channel: provider === 'WhatsAppCloud' ? 'whatsapp' : 'sms',
      provider: provider as any,
      category: 'GENERAL_BROADCAST',
      messageBody: `[RaphaMIS Test Ping] Telephony Gateway (${provider}) verified successfully at ${new Date().toISOString()}.`,
    });
  }
}
