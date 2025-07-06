import { User } from "../../Model";

declare global {
    namespace Express {
        interface Request {
            user? : User
        }
    }
}