import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class Signatory {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  tax_id: string;
}
