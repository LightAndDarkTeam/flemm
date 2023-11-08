import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm"

import { Metadata } from './Metadata'

@Entity()
export class Report extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    idFromLFD: number
    
    @OneToOne(() => Metadata)
    @JoinColumn()
    metadata: Metadata

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    alternativePrice: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    alternativePriceDiff: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    standardPrice: number

    @Column()
    @CreateDateColumn()
    date_creation: Date    
    
    @Column()
    @UpdateDateColumn()
    date_update: Date
}
