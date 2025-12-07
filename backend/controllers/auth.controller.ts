import type { Request, Response } from "express"
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name, avatar } = req.body;
    try {
        //check if user exists in database
        let user = await User.findOne({email});
        if(user) {
            res.status(400).json({success: false, message:"User already exists"});
            return;
        }

        //create new user and save to db
        user = new User({
            email,
            password,
            name,
            avatar: avatar || "",
        });

        //hash the password
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(password, salt);

        //save user to db
        await user.save();

        //generate token for user
        const token = generateToken(user);

        // send response
        res.status(201).json({
            success: true, 
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.log("error: ",error);
        res.status(500).json({success: false, message:"Internal Server Error"});
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        //find user by email
        const user = await User.findOne({email});
        if(!user) {
            res.status(401).json({success: false, message:"Invalid credentials"});
            return;
        }
        //compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(401).json({success: false, message:"Invalid credentials"});
            return;
        }

        //generate token for user
        const token = generateToken(user);

        //send response
        res.status(200).json({
            success: true, 
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.log("error: ",error);
        res.status(500).json({success: false, message:"Internal Server Error"});
    }
}