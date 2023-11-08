import { DataSource } from 'typeorm'

import {Metadata} from '../entity/Metadata'
import {Report} from '../entity/Report'

export const myDataSource = new DataSource({
    type: 'sqlite',
    database: 'sqlite.db',
    // logging: true,
    synchronize: true,
    // entities: ['src/entity/*.{js, ts}'],
    entities: [Metadata, Report],
    // entities: ['build/src/entity/*.js'],
    migrations: [
        'src/migration/**/*.ts'
    ],
    subscribers: [
        'src/subscriber/**/*.ts'
    ],
})
