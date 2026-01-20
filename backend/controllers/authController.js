const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUser = async (req, res) => {
    const { name, email, password, age } = req.body;
    try {
        if (!name || !email || !password || !age) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age
        })
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully" });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server error' });
    }
}



const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { user: { _id: user._id.toString() } },
            process.env.JWT_SECRET,
            { expiresIn: "7h" }
        );

        return res.status(200).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, age: user.age },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

module.exports = {
    registerUser,
    loginUser
};