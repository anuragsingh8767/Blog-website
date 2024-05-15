import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 4000;

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Blog',
  password: 'Gosolo@2004',
  port: 5432,
});
db.connect();

let posts = [];

let lastId = 3;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/posts", async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM posts ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM posts WHERE id=$1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/posts", async (req, res) => {
  const { title, content, author } = req.body;
  try {
    const result = await db.query('INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING *', [title, content, author]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.patch("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, author } = req.body;
  try {
    const result = await db.query("UPDATE posts SET title=$1, content=$2, author=$3 WHERE id=$4 RETURNING *", [title, content, author, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM posts WHERE id=$1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted", post: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
