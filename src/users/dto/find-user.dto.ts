import { MinLength } from 'class-validator';

export class FindUserDto {
  @MinLength(2)
  query: string;
}
