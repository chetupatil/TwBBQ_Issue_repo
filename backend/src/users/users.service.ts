import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findEmailById(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return user.email;
  }
}
