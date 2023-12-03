import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Reward } from './Reward';
@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column({ default: false })
  isRedeemed: boolean;

  @ManyToOne(() => Reward)
  Reward: Reward;
}
