import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(user: User, createWishDto: CreateWishDto) {
    await this.wishRepository.save({
      ...createWishDto,
      owner: user,
    });

    return {};
  }

  async getLastNumberWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
    });
  }

  async getTopNumberWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
    });
  }

  async findOne(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.wishes',
        'offers.user.offers',
        'offers.user.wishlists',
      ],
    });

    if (!wish) {
      throw new NotFoundException('Таких подарков нет (((');
    }

    return wish;
  }

  async find(arg: any) {
    return await this.wishRepository.find(arg);
  }

  async updateOne(wishId: number, UpdatedWish: UpdateWishDto, userId: number) {
    const wish = await this.findOne(wishId);

    if (!wish) {
      throw new NotFoundException('Таких подарков нет (((');
    }

    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Чужие подарки не редактируем');
    }

    await this.wishRepository.update(wishId, UpdatedWish);

    return {};
  }

  async UpdateRaised(wish: Wish, amount: number) {
    return this.wishRepository.update(
      { id: wish.id },
      { raised: wish.raised + amount },
    );
  }

  async removeOne(wishId: number, userId: number) {
    const wish = await this.findOne(wishId);

    if (!wish) {
      throw new NotFoundException('Таких подарков нет (((');
    }

    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Чужие подарки не редактируем');
    }

    await this.wishRepository.delete(wishId);

    return wish;
  }

  async copyWish(wishId: number, user: User) {
    const wish = await this.findOne(wishId);
    if (!wish) {
      throw new NotFoundException('Таких подарков нет (((');
    }

    if (user.id === wish.owner.id) {
      throw new ForbiddenException('Свои подарки не копируем');
    }

    await this.wishRepository.update(wishId, {
      copied: (wish.copied = wish.copied + 1),
    });

    const wishClone = {
      ...wish,
      raised: 0,
      owner: user.id,
      offers: [],
      copied: 0,
    };

    delete wishClone.id;
    delete wishClone.createdAt;

    await this.create(user, wishClone);

    return {};
  }
}
