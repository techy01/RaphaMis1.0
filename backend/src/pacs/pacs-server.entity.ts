import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pacs_servers')
export class PacsServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'type', default: 'ORTHANC' })
  type: 'ORTHANC' | 'DICOMWEB' | 'DCM4CHEE' | 'GENERIC_DIMSE' | 'LOCAL_ARCHIVE';

  @Column({ name: 'ae_title', default: 'RAPHA_PACS' })
  aeTitle: string;

  @Column({ name: 'host', default: '127.0.0.1' })
  host: string;

  @Column({ name: 'port', default: 4242 })
  port: number;

  @Column({ name: 'dicomweb_url', nullable: true })
  dicomwebUrl: string;

  @Column({ name: 'username', nullable: true })
  username: string;

  @Column({ name: 'password', nullable: true })
  password: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'status', default: 'ONLINE' })
  status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';

  @Column({ name: 'last_echo_time', nullable: true })
  lastEchoTime: string;

  @Column({ name: 'last_latency_ms', nullable: true })
  lastLatencyMs: number;

  @Column({ name: 'tenant_id', default: 'tenant_001' })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
