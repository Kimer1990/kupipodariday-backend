import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly WishesService: WishesService,
  ) {}
  async create(user: User, createOfferDto: CreateOfferDto) {
    const wish = await this.WishesService.findOne(createOfferDto.itemId);

    if (!wish) {
      throw new NotFoundException('Таких подарков нет');
    }

    if (user.id === wish.owner.id) {
      throw new ForbiddenException(
        'Вы не можете создавать предложения для своих подарков.',
      );
    }

    const offerSum = Number(wish.raised) + Number(createOfferDto.amount);
    if (+offerSum > wish.price) {
      throw new ForbiddenException(
        'Сумма собранных средств не может превышать стоимость подарка.',
      );
    }

    await this.WishesService.UpdateRaised(wish, createOfferDto.amount);

    await this.offerRepository.save({ ...createOfferDto, user, item: wish });

    return {};
  }

  async findAll() {
    const offers = await this.offerRepository.find({
      relations: ['item', 'user'],
    });
    if (offers.length === 0) {
      throw new NotFoundException('Пока еще никто не делал предложений');
    }

    return offers;
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.find({
      where: { id },
      relations: ['item', 'user'],
    });
    if (offer.length === 0) {
      throw new NotFoundException('Таких предложений');
    }

    return offer;
  }
}
