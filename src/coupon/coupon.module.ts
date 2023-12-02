import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from '../entities/Coupon';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { Player } from 'src/entities/Player';
import { PlayerCoupon } from 'src/entities/PlayerCoupon';
import { Reward } from 'src/entities/Reward';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon,Player,PlayerCoupon,Reward])],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}