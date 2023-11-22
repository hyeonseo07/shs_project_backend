const express = require('express');
const mariadb = require('mariadb');

const app = express();
const port = 3000;

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'shs'
});

app.get('/', (req, res) => {
    res.send(`
        <form method="get" action="/check">
            <input type="text" name="userInput" />
            <button type="submit">Check</button>
        </form>
    `);
});

app.get('/check', async (req, res) => {
    let conn;   
    try {
        conn = await pool.getConnection();
        const userInput = req.query.userInput;

        const rows = await conn.query("SELECT UserCode FROM User WHERE UserCode = ?", [userInput]);

        if (rows.length === 0) {
            // 등록되지 않은 사용자일 경우
            res.status(404).send("등록되지 않은 사람입니다.");
        } else {
            // 등록된 사용자일 경우
            res.send("등록된 사람입니다.");
        }
    } catch (err) {
        // 에러 핸들링
        console.error(err);

        // 오류 유형에 따라 오류 메시지를 사용자 정의합니다.
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).send("중복된 데이터가 있습니다.");
        } else {
            res.status(500).send(`서버 오류: ${err.message}`);
        }
    } finally {
        if (conn) conn.end();
    }
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
