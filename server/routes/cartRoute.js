import express from 'express'
import { authUser } from "../middlewares/authUser.js";  // named import, note the {}

import { updateCart, getCart  } from "../controllers/cartController.js";

const cartRouter = express.Router();

// cartRouter.get('/', authUser, getCart);
cartRouter.post('/update', authUser, updateCart)

export default cartRouter;

