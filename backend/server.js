require(`dotenv`).config();
const express = require(`express`);
const connectDB = require(`./config/db`);
const authRouter = require(`./routes/auth`);
const userRouter = require(`./routes/user`);
const modelRouter = require(`./routes/model`);
const cors = require('cors');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://pcosmart.vercel.app",
    "https://pcosmart-mlservices.onrender.com"
  ],

  credentials: true,
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Define Routes
app.use(`/api/auth`, authRouter);
app.use(`/api/user`, userRouter);
app.use(`/api/model`, modelRouter);

// Root Route
app.get(`/`, (req, res) => {
    return res.status(200).json({ message: 'Server is running!!' });
});


// Start Server
app.listen(PORT, () => console.log(`server is running on Port - ${PORT}`));