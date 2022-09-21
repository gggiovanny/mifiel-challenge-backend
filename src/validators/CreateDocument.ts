import { IsNotEmpty } from 'class-validator';

export class CreateDocument {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}
