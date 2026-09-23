import prisma from "@repo/db/prismaClient"
import express from "express"

const app = express();
app.use(express.json());

// Enable CORS for frontend requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.get("/", (req, res) => {
    res.send("Hi there");
})

app.get("/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users from database" });
    }
})

app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    try {
        const user = await prisma.user.create({
            data: {
                username: username,
                password: password
            }
        })
        res.json({
            message: "Signup successful",
            id: user.id
        });
    } catch (error: any) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error?.message || "Failed to create user" });
    }
})

app.listen(3002);