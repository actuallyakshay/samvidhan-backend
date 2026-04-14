import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePracticeAreaInput {
  @ApiProperty({ description: 'Name of the practice area' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
