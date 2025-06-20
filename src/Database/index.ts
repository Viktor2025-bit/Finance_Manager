import dotenv from "dotenv"

dotenv.config()
import { Sequelize } from "sequelize"

const DATABASE_URI = process.env.DATABASE_URI

const sequelize = new Sequelize(DATABASE_URI!, {
    logging : console.log
})

export default sequelize