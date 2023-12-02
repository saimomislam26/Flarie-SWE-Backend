import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CouponService } from './coupon.service';


console.log(CouponService);

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) { }

  @Post('create-data')
  async createSampleData(
    @Body('playerName') playerName: string,
    @Body('rewardName') rewardName: string,
    @Body('couponValues') couponValues: string[],
  ) {
    try {
      console.log("Hitted");
      
      // Create a player
      const player = await this.couponService.createPlayer(playerName);

      // Create a reward
      const reward = await this.couponService.createReward(rewardName, new Date(), new Date(), 3, 21);

      // Create coupons associated with the reward
       const coupons = await this.couponService.createCoupons(reward.id, couponValues);

      // Redeem a coupon for the player
      //  const redeemedCoupon = await this.couponService.redeemCoupon(player.id, reward.id);

      return {
        player,
        reward,
        coupons,
        //  redeemedCoupon,
      };
    } catch (error) {
      console.log("Error");
      return { error: error.message };
    }
  }

  @Post('redeem')
  async redeemCoupon(
    @Body('playerId', ParseIntPipe) playerId: number,
    @Body('rewardId', ParseIntPipe) rewardId: number,
  ) {
    try {
      const redeemedCoupon = await this.couponService.redeemCoupon(playerId, rewardId);
      return { coupon: redeemedCoupon };
    } catch (error) {
      return { error: error.message };
    }
  }
}