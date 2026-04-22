import express from 'express';
import ViteExpress from 'vite-express';
import Database from 'better-sqlite3';
import expressSession from 'express-session';
import betterSqlite3Session from 'express-session-better-sqlite3';

const app = express();
const PORT = 3000;
const db = new Database("placestostay.db")

const sessDb = new Database("session.db");
const SqliteStore = betterSqlite3Session(expressSession,sessDb)

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(expressSession({
    store: SqliteStore(),
    secret: 'UnguessableSecret',
    resave: true,
    saveUninitialized: false,
    rolling: true,
    unset: 'destroy',
    proxy: true,
    cookie: {
        maxAge: 600000,
        httpOnly: false
    }
}));

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
 
    const { accID, thedate, userID, npeople } = req.body;
 
    if (accID === undefined || accID === null || accID === '') {
        res.status(400).json({ error: 'Accommodation ID is required.' });
        return;
    }
 
    if (npeople === undefined || npeople === null || npeople === '') {
        res.status(400).json({ error: 'Number of people is required.' });
        return;
    }
 
    if (thedate === undefined || thedate === null || thedate === '') {
        res.status(400).json({ error: 'Date is required.' });
        return;
    }
 
    const insertstmt = db.prepare('INSERT INTO acc_bookings(accID, thedate, userID, npeople) VALUES(?,?,?,?)');
    const updatestmt = db.prepare('UPDATE acc_dates SET availability = availability - ? WHERE accID = ? AND thedate = ?');
    
    updatestmt.run(npeople, accID, thedate);
 
    const info = insertstmt.run(accID, thedate, userID, npeople);
    res.json({id: info.lastInsertRowid})
});
 


ViteExpress.listen(app, PORT, () => {console.log(`Listening on port ${PORT}.`)});