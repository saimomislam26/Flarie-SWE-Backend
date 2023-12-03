import { Controller, Post, Body, HttpCode, HttpStatus, ParseIntPipe, Res, NotFoundException, ConflictException } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Response } from 'express';


@Controller()
export class CouponController {
  constructor(private readonly couponService: CouponService) { }

  @Post('create-data')
  @HttpCode(HttpStatus.CREATED)
  async createSampleData(
    @Body('playerName') playerName: string,
    @Body('rewardName') rewardName: string,
    @Body('couponValues') couponValues: string[],
    @Res() res: Response
  ) {
    try {
      // Create a player
      const player = await this.couponService.createPlayer(playerName);

      // Create a reward
      const currentDate = new Date();
      const nextWeekDate = new Date(currentDate);
      nextWeekDate.setDate(currentDate.getDate() + 7);
      const reward = await this.couponService.createReward(rewardName, new Date(), new Date(nextWeekDate), 3, 21);

      // Create coupons associated with the reward
      const coupons = await this.couponService.createCoupons(reward.id, couponValues);

      return res.status(200).json({
        player,
        reward,
        coupons,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else if (error instanceof ConflictException) {
        return res.status(HttpStatus.CONFLICT).json({ error: error.message });
      } else {
        console.error('create error', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
      }
    }
  }

  @Post('/coupon-redeem')
  async redeemCoupon(
    @Body('playerId', ParseIntPipe) playerId: number,
    @Body('rewardId', ParseIntPipe) rewardId: number,
    @Res() res: Response
  ) {
    try {
      const redeemedCoupon = await this.couponService.redeemCoupon(playerId, rewardId);
      return res.status(200).json({ id: redeemedCoupon.id, value: redeemedCoupon.value });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: error.message });
      } else if (error instanceof ConflictException) {
        return res.status(HttpStatus.CONFLICT).json({ error: error.message });
      } else {
        console.error('reedem error', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
      }
    }
  }
}