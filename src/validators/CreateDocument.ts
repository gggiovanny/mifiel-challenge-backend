import { IsNotEmpty } from 'class-validator';

export class CreateDocument {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  callback_url: string;
}
