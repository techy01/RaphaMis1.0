import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
    ) {}
    
    async log(user: string, details: string): Promise<AuditLog> {
        const logEntry = this.auditLogRepository.create({ user, details });
        return this.auditLogRepository.save(logEntry);
    }

    async findRecent(limit: number = 5): Promise<AuditLog[]> {
        return this.auditLogRepository.find({
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }
}
