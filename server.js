const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// Create connection to DB
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected...");
});

// Route for inserting or modifying clans
app.post("/clans", (req, res) => {
  const { clanId, clanName, clanCreationDate } = req.body;
  if (clanId) {
    // Update existing clan
    const sql = "UPDATE clans SET name = ?, creation_date = ? WHERE id = ?";
    db.query(sql, [clanName, clanCreationDate, clanId], (err, result) => {
      if (err) throw err;
      res.send("Clan updated...");
    });
  } else {
    // Insert new clan
    const sql = "INSERT INTO clans (name, creation_date) VALUES (?, ?)";
    db.query(sql, [clanName, clanCreationDate], (err, result) => {
      if (err) throw err;
      res.send("Clan inserted...");
    });
  }
});

// Route for inserting or modifying users
app.post("/users", (req, res) => {
  const { userId, userNickname, userCreationDate, userClanId } = req.body;
  if (userId) {
    // Update existing user
    const sql =
      "UPDATE users SET nickname = ?, creation_date = ?, clan_id = ? WHERE id = ?";
    db.query(
      sql,
      [userNickname, userCreationDate, userClanId || null, userId],
      (err, result) => {
        if (err) throw err;
        res.send("User updated...");
      }
    );
  } else {
    // Insert new user
    const sql =
      "INSERT INTO users (nickname, creation_date, clan_id) VALUES (?, ?, ?)";
    db.query(
      sql,
      [userNickname, userCreationDate, userClanId || null],
      (err, result) => {
        if (err) throw err;
        res.send("User inserted...");
      }
    );
  }
});

// Route for inserting or modifying dictionaries
app.post("/dictionary", (req, res) => {
  const { dictionaryId, dictionaryName, dictionaryCreationDate } = req.body;
  if (dictionaryId) {
    // Update existing dictionary
    const sql =
      "UPDATE dictionary SET name = ?, creation_date = ? WHERE id = ?";
    db.query(
      sql,
      [dictionaryName, dictionaryCreationDate, dictionaryId],
      (err, result) => {
        if (err) throw err;
        res.send("Dictionary updated...");
      }
    );
  } else {
    // Insert new dictionary
    const sql = "INSERT INTO dictionary (name, creation_date) VALUES (?, ?)";
    db.query(sql, [dictionaryName, dictionaryCreationDate], (err, result) => {
      if (err) throw err;
      res.send("Dictionary inserted...");
    });
  }
});

// Route for inserting or modifying text
app.post("/text", (req, res) => {
  const { textId, textTitle, textContent, textCreationDate, textDictionaryId } =
    req.body;
  if (textId) {
    // Update existing text
    const sql =
      "UPDATE text SET title = ?, text = ?, creation_date = ?, dictionary_id = ? WHERE id = ?";
    db.query(
      sql,
      [textTitle, textContent, textCreationDate, textDictionaryId, textId],
      (err, result) => {
        if (err) throw err;
        res.send("Text updated...");
      }
    );
  } else {
    // Insert new text
    const sql =
      "INSERT INTO text (title, text, creation_date, dictionary_id) VALUES (?, ?, ?, ?)";
    db.query(
      sql,
      [textTitle, textContent, textCreationDate, textDictionaryId],
      (err, result) => {
        if (err) throw err;
        res.send("Text inserted...");
      }
    );
  }
});

// Route for inserting or modifying results
app.post("/results", (req, res) => {
  const {
    resultId,
    resultUserId,
    resultTextId,
    resultTime,
    resultCreationDate,
  } = req.body;
  if (resultId) {
    // Update existing result
    const sql =
      "UPDATE results SET user_id = ?, text_id = ?, time = ?, creation_date = ? WHERE id = ?";
    db.query(
      sql,
      [resultUserId, resultTextId, resultTime, resultCreationDate, resultId],
      (err, result) => {
        if (err) throw err;
        res.send("Result updated...");
      }
    );
  } else {
    // Insert new result
    const sql =
      "INSERT INTO results (user_id, text_id, time, creation_date) VALUES (?, ?, ?, ?)";
    db.query(
      sql,
      [resultUserId, resultTextId, resultTime, resultCreationDate],
      (err, result) => {
        if (err) throw err;
        res.send("Result inserted...");
      }
    );
  }
});

// Route to get all clans
app.get("/clans", (req, res) => {
  const sql = "SELECT * FROM clans";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route to get all users
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route to get all dictionaries
app.get("/dictionary", (req, res) => {
  const sql = "SELECT * FROM dictionary";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route to get all texts
app.get("/text", (req, res) => {
  const sql = "SELECT * FROM text";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route to get all results
app.get("/results", (req, res) => {
  const sql = "SELECT * FROM results";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get("/report1", (req, res) => {
  const sql = `
        SELECT 
            users.id AS user_id, 
            users.nickname AS user_nickname, 
            users.creation_date AS user_creation_date,
            clans.name AS clan_name, 
            clans.creation_date AS clan_creation_date,
            text.id AS text_id, 
            text.title AS text_title, 
            dictionary.name AS dictionary_name, 
            dictionary.creation_date AS dictionary_creation_date
        FROM users
        LEFT JOIN clans ON users.clan_id = clans.id
        LEFT JOIN results ON users.id = results.user_id
        LEFT JOIN text ON results.text_id = text.id
        LEFT JOIN dictionary ON text.dictionary_id = dictionary.id
        ORDER BY users.id, text.creation_date;
    `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route to get report 2: Texts with their dictionary and user submission details
app.get("/report2", (req, res) => {
  const sql = `
        SELECT 
            text.id AS text_id, 
            text.title AS text_title, 
            dictionary.name AS dictionary_name, 
            dictionary.creation_date AS dictionary_creation_date,
            users.id AS user_id, 
            users.nickname AS user_nickname, 
            users.creation_date AS user_creation_date,
            results.time AS submission_time, 
            results.creation_date AS result_creation_date
        FROM text
        LEFT JOIN dictionary ON text.dictionary_id = dictionary.id
        LEFT JOIN results ON text.id = results.text_id
        LEFT JOIN users ON results.user_id = users.id
        WHERE text.creation_date BETWEEN '2024-01-01' AND '2024-12-31'
        ORDER BY text.creation_date, users.id;
    `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Route to get report 3: Top 10 texts by dictionary
app.get("/report3", (req, res) => {
  const dictionaryId = req.query.dictionaryId || "1";
  const sql = `
      SELECT 
          text.id AS text_id, 
          text.title AS text_title, 
          text.text AS text_content, 
          text.creation_date AS text_creation_date,
          dictionary.name AS dictionary_name, 
          dictionary.creation_date AS dictionary_creation_date,
          COUNT(results.id) AS submission_count
      FROM text
      JOIN dictionary ON text.dictionary_id = dictionary.id
      LEFT JOIN results ON text.id = results.text_id
      WHERE dictionary.id = ?
      GROUP BY text.id
      ORDER BY submission_count DESC
      LIMIT 10;
  `;
  db.query(sql, [dictionaryId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
