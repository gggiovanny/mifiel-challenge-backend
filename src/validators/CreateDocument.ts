import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

import { Signatory } from './Signatory';

export class CreateDocument {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  callback_url: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Signatory)
  @ValidateNested({ each: true })
  signatories?: Signatory[];
}
