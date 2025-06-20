import { Router } from "express"
import { Register, Login } from "../Controllers/auth.controller"


const authRouter = Router()

authRouter.post("/register", Register)

authRouter.post("/login", Login)

export default authRouter