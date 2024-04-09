import jwt from 'jsonwebtoken';

import User from '../models/authentication.model.js'

const register = async (req, res) => {
    try{
        const user = await User.create(req.body);
        res.status(201).json({message:'user successfully registered', data: user});
    }catch(err){
        res.status(400).json({message: err.message});
    }
}
const login=async (req, res) => {
    try{
        const user = await User.findOne({username: req.body.username});
        if(user){
            const isMatch = await User.findOne({password: req.body.password});
            if(isMatch){
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.status(200).json({message:'user successfully logged in', token});
            }else{
                res.status(400).json({message: 'invalid password'});
            }
        }else{
            res.status(400).json({message: 'invalid email'});
        }
    }catch(err){
        res.status(400).json({message: err.message});
    }
}
 const userControllers=
 {
    register,
    login
}
export default userControllers