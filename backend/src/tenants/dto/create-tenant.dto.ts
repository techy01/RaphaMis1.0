import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, IsIn } from 'class-validator';

export class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsPhoneNumber('KE') // Example validation for Kenyan phone numbers
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;
    
    @IsString()
    @IsNotEmpty()
    @IsIn(['Basic', 'Pro', 'Enterprise'])
    subscriptionPlan: string;
}
