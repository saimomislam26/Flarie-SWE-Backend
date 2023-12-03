// src/coupon/coupon.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOneOptions } from 'typeorm';
import { Coupon } from '../entities/Coupon';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { Reward } from '../entities/Reward';
import { Player } from '../entities/Player';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(PlayerCoupon)
    private playerCouponRepository: Repository<PlayerCoupon>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) { }

  async createPlayer(name: string): Promise<Player> {
    const player = this.playerRepository.create({ name });
    return this.playerRepository.save(player);
  }

  async createReward(name: string, startDate: Date, endDate: Date, perDayLimit: number, totalLimit: number): Promise<Reward> {
    const reward = this.rewardRepository.create({ name, startDate, endDate, perDayLimit, totalLimit });
    return this.rewardRepository.save(reward);
  }

  async createCoupons(rewardId: number, values: string[]): Promise<Coupon[]> {
    const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    const coupons = values.map(value => {
      const coupon = this.couponRepository.create({ value, Reward: reward });
      return coupon;
    });

    return this.couponRepository.save(coupons);

  }


  async redeemCoupon(playerId: number, rewardId: number): Promise<Coupon> {
    // Check if the reward exists and is within the valid date range
    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });

    if (!player || !reward) {
      throw new NotFoundException('Reward not found or player not found');
    }
    // console.log({ reward });

    //  // Check if the reward is valid within startDate and endDate
    const currentDate = new Date();
    if (currentDate < reward.startDate || currentDate > reward.endDate) {
      throw new Error('Reward not available at the moment');
    }

    // Check if the player has reached the per-day limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyRedemptions = await this.playerCouponRepository.count({
      where: {
        player: { id: playerId }, // Use 'player' instead of 'id'
        redeemedAt: Between(today, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
      },
    });


    if (dailyRedemptions >= reward.perDayLimit) {
      throw new ConflictException('Player has reached the per-day redemption limit');
    }

    // Check if the player has reached the total limit
    const totalRedemptions = await this.playerCouponRepository.count({ where: { player: { id: playerId } } });
    // console.log("Total Count", totalRedemptions);
    if (totalRedemptions >= reward.totalLimit) {
      throw new ConflictException('Player has reached the total redemption limit');
    }

    // Check if the coupon for the given reward is available
    const coupon = await this.couponRepository.findOne({
      where: {
        Reward: { id: rewardId },
        isRedeemed: false
      }
    })

    // console.log("coupon", coupon);

    if (!coupon) {
      throw new NotFoundException('No available coupons for the specified reward');
    }

    // Mark the coupon as redeemed
    coupon.isRedeemed = true;
    await this.couponRepository.save(coupon);

    // Record the redemption
    const playerCoupon = this.playerCouponRepository.create({ player: { id: playerId }, coupon });
    await this.playerCouponRepository.save(playerCoupon);

    return coupon;
  }
}