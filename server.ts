import express from 'express';
import ViteExpress from 'vite-express';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;
const db = new Database("placestostay.db")

app.get('/accommodation/location/:location', (req, res) => {
	const stmt = db.prepare("SELECT * FROM accommodation WHERE location=? COLLATE NOCASE");
	const results = stmt.all(req.params.location);
	res.json(results);
});


ViteExpress.listen(app, PORT, () => {console.log(`Listening on port ${PORT}.`)});