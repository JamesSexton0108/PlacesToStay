import express from 'express';
import ViteExpress from 'vite-express';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;
const db = new Database("placestostay.db")

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/accommodation/location/:location', (req, res) => {
	const stmt = db.prepare("SELECT * FROM accommodation WHERE location=? COLLATE NOCASE");
	const results = stmt.all(req.params.location);
	res.json(results);
});

app.get('/accommodation/type/:type/location/:location', (req, res) => {
	const stmt = db.prepare(
		"SELECT * FROM accommodation WHERE type = ? COLLATE NOCASE AND location = ? COLLATE NOCASE"
	);
	const results = stmt.all(req.params.type, req.params.location);
	res.json(results);
});

app.post('/booking', (req, res) => {
    console.log('/booking')
    console.log(req.body)
    const insertstmt = db.prepare('INSERT INTO acc_bookings(accID, thedate, userID, npeople) VALUES(?,?,?,?)');
    const updatestmt = db.prepare('UPDATE acc_dates SET availability = availability - ? WHERE accID = ? AND thedate = ?');
    
    updatestmt.run(req.body.npeople, req.body.accID, req.body.thedate);

    const info = insertstmt.run(req.body.accID, req.body.thedate, req.body.userID, req.body.npeople);
    res.json({id: info.lastInsertRowid})

});



ViteExpress.listen(app, PORT, () => {console.log(`Listening on port ${PORT}.`)});