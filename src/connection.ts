import sequelize from "./Database/index";

 const testConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log("Database Connection successful")

    } catch (error) {
        console.error("Unable to connect to the database:", error)
    }
}

testConnection()