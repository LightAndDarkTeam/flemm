import { myDataSource }  from "./config/ormconfig"

import { Request, Response } from "express"
const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

require('dotenv').config()

import 'reflect-metadata'
import routes from './routes'

const PORT = process.env.PORT || 5050

// create and setup express app
const app = express()

app.use(cors())
app.options('*', cors())

// Log requests to the console.
app.use(logger('dev'))
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

try {
    myDataSource.initialize()    
    console.log('initialize detaSource')
} catch (error) {   
    console.error(error)
} finally {
    app.use("/api", routes)

    app.listen(PORT);
    console.log("Server on port", PORT)
}