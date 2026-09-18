import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pacs_studies')
export class PacsStudyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'study_instance_uid', unique: true })
  studyInstanceUid: string;

  @Column({ name: 'accession_number', nullable: true })
  accessionNumber: string;

  @Column({ name: 'patient_id', nullable: true })
  patientId: string;

  @Column({ name: 'patient_mrn' })
  patientMRN: string;

  @Column({ name: 'patient_name' })
  patientName: string;

  @Column({ name: 'patient_birth_date', nullable: true })
  patientBirthDate: string;

  @Column({ name: 'patient_sex', nullable: true })
  patientSex: string;

  @Column({ name: 'study_date' })
  studyDate: string;

  @Column({ name: 'study_time', nullable: true })
  studyTime: string;

  @Column({ name: 'study_description' })
  studyDescription: string;

  @Column({ name: 'modality' })
  modality: string;

  @Column({ name: 'modalities_in_study', type: 'simple-json', nullable: true })
  modalitiesInStudy: string[];

  @Column({ name: 'series_count', default: 1 })
  seriesCount: number;

  @Column({ name: 'instance_count', default: 1 })
  instanceCount: number;

  @Column({ name: 'institution_name', nullable: true })
  institutionName: string;

  @Column({ name: 'pacs_server_id', nullable: true })
  pacsServerId: string;

  @Column({ name: 'pacs_server_name', nullable: true })
  pacsServerName: string;

  @Column({ name: 'preview_thumbnail_url', type: 'text', nullable: true })
  previewThumbnailUrl: string;

  @Column({ name: 'storage_path', type: 'text', nullable: true })
  storagePath: string;

  @Column({ name: 'status', default: 'ONLINE' })
  status: 'ONLINE' | 'ARCHIVED' | 'NEARLINE' | 'LOCAL';

  @Column({ name: 'series_json', type: 'simple-json', nullable: true })
  seriesJson: any;

  @Column({ name: 'tenant_id', default: 'tenant_001' })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
