import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

export enum PatientStatusEnum {
  Inpatient = 'Inpatient',
  Outpatient = 'Outpatient',
  Emergency = 'Emergency',
  Discharged = 'Discharged',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mrn', unique: true })
  mrn: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: string;

  @Column({ default: 'Other' })
  gender: string;

  @Column({ name: 'blood_type', default: 'O+' })
  bloodType: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: PatientStatusEnum,
    default: PatientStatusEnum.Outpatient,
  })
  status: PatientStatusEnum;

  @Column({ name: 'primary_physician', nullable: true })
  primaryPhysician: string;

  @Column({ name: 'assigned_department', default: 'General Medicine' })
  assignedDepartment: string;

  @Column({ name: 'room_number', nullable: true })
  roomNumber: string;

  @Column({ name: 'insurance_provider', nullable: true })
  insuranceProvider: string;

  @Column({ name: 'insurance_policy_number', nullable: true })
  insurancePolicyNumber: string;

  @Column({ name: 'admission_date', nullable: true })
  admissionDate: string;

  @Column({ name: 'discharge_date', nullable: true })
  dischargeDate: string;

  @Column({ type: 'json', nullable: true })
  vitals: any;

  @Column({ type: 'json', nullable: true })
  allergies: string[];

  @Column({ type: 'json', nullable: true })
  chronicConditions: string[];

  @Column({ type: 'json', nullable: true })
  emergencyContact: any;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
