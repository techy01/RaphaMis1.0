import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRoleEnum } from './user.entity';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  /**
   * Automatically ensure production Superadmin accounts exist with desired credentials
   */
  async seedSuperAdmin() {
    try {
      const configuredEmail = process.env.SUPERADMIN_EMAIL?.trim();
      const rawPassword = process.env.SUPERADMIN_PASSWORD || 'welcome2026';
      
      const targetEmails = new Set<string>(['mbarutech@gmail.com']);
      if (configuredEmail) {
        targetEmails.add(configuredEmail);
      }
      // Also add common domain administrator email if user requested raphamis.saaslink.tech
      if (configuredEmail?.includes('saaslink.tech') && !configuredEmail.includes('@')) {
        targetEmails.add(`admin@${configuredEmail}`);
      }

      for (const email of targetEmails) {
        const existing = await this.usersRepository.findOne({ 
          where: { email },
          select: ['id', 'email', 'name', 'role', 'password'],
        });

        if (!existing) {
          const hashedPassword = await bcrypt.hash(rawPassword, 12);
          const superAdmin = this.usersRepository.create({
            name: 'RaphaMIS Master Superadmin',
            email,
            password: hashedPassword,
            role: UserRoleEnum.Superadmin,
          });

          await this.usersRepository.save(superAdmin);
          this.logger.log(`✓ Superadmin successfully created and seeded: ${email} (Password: ${rawPassword})`);
        } else {
          // Ensure role is Superadmin and update password
          const newHashed = await bcrypt.hash(rawPassword, 12);
          existing.password = newHashed;
          existing.role = UserRoleEnum.Superadmin;
          await this.usersRepository.save(existing);
          this.logger.log(`✓ Superadmin credentials verified and synchronized: ${email}`);
        }
      }
    } catch (err: any) {
      this.logger.error(`⚠️ Database connection or seeding notice: ${err?.message || err}`);
      this.logger.warn(`Ensure your MySQL database credentials in .env are correct and the database exists.`);
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    // Explicitly add the password to the selection since it's excluded by default
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'name', 'role', 'password'],
    });
  }

  async create(registerUserDto: RegisterUserDto): Promise<Omit<User, 'password'>> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

    const user = this.usersRepository.create({
      ...registerUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    return result;
  }
}

