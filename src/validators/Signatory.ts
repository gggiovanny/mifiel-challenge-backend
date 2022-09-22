import { IsEmail, IsNotEmpty } from 'class-validator';

export class Signatory {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  tax_id: string;
}
