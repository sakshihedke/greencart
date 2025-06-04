import express from 'express';
import { authUser } from "../middlewares/authUser.js";  
import { addAddress, getAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, addAddress);  // Protected route to add address
addressRouter.get('/get', authUser, getAddress);   // Protected route to get address

export default addressRouter;
