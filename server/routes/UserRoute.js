import express from 'express';
import { isAuth, login, logout, register } from '../controllers/UserController.js';
const userRouter = express.Router();
import { authUser } from '../middlewares/authUser.js';


userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.get('/is-auth', authUser, isAuth)
userRouter.get('/logout',authUser, logout)


export default userRouter;