import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn
} from "typeorm";
import { Coupon } from "./coupon.entity";

@Entity()
export class CouponWallet {

  @PrimaryGeneratedColumn({name: 'wallet_id'})
  walletId: number;

  @Column({name: 'user_id', type: 'varchar', length: 36})
  userId : string;

  @Column({name: 'is_used', type: 'boolean', default: false})
  isUsed : boolean;

  @Column({name: 'used_at', type: 'timestamp', default: null})
  usedAt: Timestamp;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;

  @Column({ name: 'expired_at', type: 'timestamp' })
  expiredAt: Date;

  @ManyToOne(() => Coupon, (coupon: Coupon) => coupon.couponWallets, { onDelete: 'CASCADE' })
  coupon: Coupon;

  @BeforeInsert()
  setExpiredDate(){
    const currentDate : Date = new Date();
    currentDate.setDate(currentDate.getDate() + 7);
    this.expiredAt = currentDate;
  }

  constructor(userId : string, coupon: Coupon){
    this.userId = userId,
    this.coupon = coupon
  }
}