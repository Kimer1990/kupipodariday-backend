import { Length, IsUrl, IsEmail } from 'class-validator';

export class CreateUserDto {
  @Length(2, 30)
  username: string;

  @Length(2, 200)
  about: string;

  @IsUrl()
  avatar: string;

  @IsEmail()
  email: string;

  @Length(3, 10)
  password: string;
}
