import { YoutubeTranscript } from 'youtube-transcript';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
});

const app = express();
app.use(express.json()); 
app.use(cors());

const port = process.env.PORT;

app.post('/transcript', async (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
    }

    try {
        const data = await YoutubeTranscript.fetchTranscript(videoId);
        res.status(200).json({ message: "Success", data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sever Error" });
    }
})

app.post('/flashcard', async (req, res) => {
    const { words } = req.body;
    if (!words) {
        return res.status(400).json({ error: "Words list is required" });
    }

    for (let i = 0; i < words.length; i++) {
        try {
            const heads = words[i].split("(")[0];
            const tails = words[i].split("(")[1].split(")")[0];
            const result = await pool.query(
                `INSERT INTO flash_card (heads, tails) VALUES ($1, $2)`,
                [heads, tails]
            );
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Sever Error" });
        }
    }

    res.status(200).json({ message: "Success", data: words});
})

app.post('/flashcard/flip', async (req, res) => {
    const { cardId } = req.body;
    if (!cardId) {
        return res.status(400).json({ error: "Card ID is required" });
    }

    try {
        const result = await pool.query(
            `UPDATE  
                flash_card 
            SET 
                is_ok = TRUE
            WHERE 
                id = $1 
            RETURNING 
                *;
            `,
            [cardId]
        );
        res.status(200).json({ message: "Success", data: result.rows});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sever Error" });
    }
})

app.get('/flashcard', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM flash_card WHERE is_ok = false`
        );
        
        res.status(200).json({ message: "Success", data: result.rows});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sever Error" });
    }
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})