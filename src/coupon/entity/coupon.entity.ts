import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { CouponWallet } from "./coupon-wallet.entity";

@Entity()
export class Coupon {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'int' })
  discount: number;

  @Column({ name : 'total_amount', type: 'int' })
  totalAmount: number;

  @Column({ name : 'max_amount_per_user', type: 'int' , default : 1})
  maxAmountPerUser: number;

  @Column({ name : 'left_amount', type: 'int' })
  leftAmount: number;

  @CreateDateColumn({name : 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name : 'updated_at'})
  datedAt: Date;

  @OneToMany(() => CouponWallet, (couponWallet: CouponWallet) => couponWallet.coupon, { cascade: true })
  couponWallets: CouponWallet[];

  constructor(code : string, discount: number, total_amount: number, left_amount: number){
      this.code = code;
      this.discount = discount;
      this.totalAmount = total_amount;
      this.leftAmount = left_amount;
  }

  decreaseLeftAmount() : void{
    if (this.leftAmount > 0) this.leftAmount -= 1;
  }
}
