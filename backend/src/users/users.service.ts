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
   * Automatically ensure the single production Superadmin account exists with desired credentials
   */
  async seedSuperAdmin() {
    try {
      const superAdminEmail = 'mbarutech@gmail.com';
      const rawPassword = 'welcome@2026';
      const existing = await this.usersRepository.findOne({ 
        where: { email: superAdminEmail },
        select: ['id', 'email', 'name', 'role', 'password'],
      });

      if (!existing) {
        const hashedPassword = await bcrypt.hash(rawPassword, 12);
        const superAdmin = this.usersRepository.create({
          name: 'RaphaMIS Master Superadmin',
          email: superAdminEmail,
          password: hashedPassword,
          role: UserRoleEnum.Superadmin,
        });

        await this.usersRepository.save(superAdmin);
        this.logger.log(`✓ Superadmin successfully created and seeded: ${superAdminEmail}`);
      } else {
        // Ensure role is Superadmin and password matches requested seed
        const isPasswordMatch = await bcrypt.compare(rawPassword, existing.password);
        if (!isPasswordMatch || existing.role !== UserRoleEnum.Superadmin) {
          const newHashed = await bcrypt.hash(rawPassword, 12);
          existing.password = newHashed;
          existing.role = UserRoleEnum.Superadmin;
          await this.usersRepository.save(existing);
          this.logger.log(`✓ Superadmin credentials/role verified and refreshed: ${superAdminEmail}`);
        } else {
          this.logger.log(`✓ Superadmin account verified and ready: ${superAdminEmail}`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Superadmin database seeding check deferred: ${err?.message || err}`);
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

