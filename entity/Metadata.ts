import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm"

@Entity()
export class Metadata extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    idFromLFD: number

    @Column({ nullable: true})
    collectionId: number

    @Column({ nullable: true})
    ian: string

    @Column()
    name: string

    @Column({ nullable: true })
    foil: boolean

    @Column({ nullable: true })
    animationLevel: number

    @Column({ nullable: true })
    power: number

    // Exclusive, commom, UR, AC etc..
    @Column({ nullable: true })
    rarity: string

    // 1, 2, 3, 4 ou 5
    @Column({ nullable: true })
    rank: number

    // 0, 25, 50, 75, 100
    @Column("decimal", { precision: 20, scale: 2, default: 0,  })
    potential: number

    // C, B, A ou S
    @Column({ nullable: true })
    grade: string

    // standard, alternative, alternative_combo
    @Column({ default: null })
    advancement: string

    // Arkhante, etc..
    @Column({ nullable: true })
    set: string

    // Arkhante, etc..
    @Column({ nullable: true })
    season: string

    // Arkhante, etc..
    @Column({ nullable: true })
    faction: string
    
    // Light, Fire, etc..
    @Column({ nullable: true })
    element: string

    // Light, Fire, etc..
    @Column({ nullable: true })
    trait: string

    // Fighter, field, etc..
    @Column({ nullable: true })
    cardType: string

    // CARD, MINT_PASS, etc..
    @Column({ nullable: true })
    tokenType: string
    
    // Is metadata price already synced
    @Column({ default: false })
    sync: boolean

    // Is metadata image already synced
    @Column({ nullable: true, default: false })
    imageSync: boolean

    @Column({ nullable: true })
    imagePath: string

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    lastRecentlySoldPrice: number

    @Column("decimal", { precision: 20, scale: 2, nullable: true })
    lastMinActivePrice: number

    @Column()
    @CreateDateColumn()
    date_creation: Date    
    
    @Column()
    @UpdateDateColumn()
    date_update: Date
}
