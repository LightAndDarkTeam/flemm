import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm"

import { Metadata } from './Metadata'

@Entity()
export class Report extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ nullable: true })
    foil: boolean

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    standardPrice: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    standardXMultiplierPrice: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    altCPrice: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    altCProfit: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    altBPrice: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    altBProfit: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    altAPrice: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    altAProfit: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    altSPrice: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    altSProfit: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    averageProfit: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    averageProfitPerTrisel: number

    @Column({ nullable: true })
    rarity: string

    @Column({ nullable: true })
    trait: string

    @Column()
    @CreateDateColumn()
    date_creation: Date    
    
    @Column()
    @UpdateDateColumn()
    date_update: Date
}
