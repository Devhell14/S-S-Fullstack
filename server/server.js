const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const mysql = require("mysql2");
const fs = require("fs");

const port = 8081;

// JSON DATA
const rawData = fs.readFileSync("./data/door.log_devices.json");
const jsonData = JSON.parse(rawData);

// MySQL connection configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "doorlogs",
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

/** HTTP GET Request */
app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

// Fetch-json ดึงข้อมูล jsonData เรียกใช้งาน API /fetch-json เพื่อ Insert ข้อมูลไปยัง mysql2 doorlogs Table doorlog
app.get("/fetch-json", (req, res) => {
  jsonData.forEach((data) => {
    const {
      _id,
      firstname,
      lastname,
      role,
      rfid,
      door_mode,
      result,
      created_by,
    } = data;
    const query = `INSERT INTO doorlog (id, firstname, lastname, role, rfid, door_mode, result, created_by) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      _id,
      firstname,
      lastname,
      role,
      rfid,
      door_mode,
      result,
      created_by,
    ];

    db.query(query, values, (err, result) => {
      if (err) throw err;
      console.log(`Inserted data with ID ${_id}`);
    });
  });

  res.status(200).send("insert successfully");
});

// Search ดึงข้อมูล fullname role ดึงชื่อเต็มจาก req.body ถูกส่งจาก Client
//  ตัวแปร strRole เก็บเงื่อนไข ถ้า role == all strRole จะเป็นค่าว่าง
// ตรวจสอบค่า role ถ้า role ไม่ใช่ all จะเข้าเงื่อนไข AND role = '${role}' ผลลัพธ์จะแสดงข้อมูล role ที่ส่งมา
// SELECT * FROM doorlog ตรวจสอบว่า fullname เป็นค่าว่าง ถ้า fullname เป็นค่าว่าง SQL จะไม่มีการเปลี่ยนแปลง และ queryStr จะไม่ถูกปรับเปลี่ยน
// else ถ้า fullname ไม่เป็นค่าว่าง ค้นหา firstname lastname fullname  โดยใช้ like ${strRole} เก็บค่า String กรองผลลัพธ์ใน SQLโดยใช้ role

app.post("/search", (req, res) => {
  const { fullname, role } = req.body;
  let strRole = "";
  if (role == "all") {
    strRole = "";
  } else {
    strRole = `AND role = '${role}'`;
  }

  let queryStr = `SELECT * FROM doorlog`;
  if (fullname == "" || fullname == undefined) {
    queryStr = queryStr;
  } else {
    queryStr = `SELECT * FROM doorlog WHERE firstname like '%${fullname}%' OR lastname like '%${fullname}%' ${strRole}`;
  }
  db.query(queryStr, (err, result) => {
    if (err) throw err;
    res.status(200).json({
      message: "select data successfully",
      result: result,
      statusCode: 200,
    });
  });
});

// Role-list
// ดึงค่า fullname และ role จาก req.body
// ตัวแปร queryStr กำหนดค่าเป็น SQL query string ที่เลือก role ที่ไม่ซ้ำกัน จากตาราง doorlog
// DISTINCT ใช้เลือกเฉพาะ ค่าที่ไม่ซ้ำกัน จากคอลัมน์ที่ระบุ

app.get("/role-list", (req, res) => {
  const { fullname, role } = req.body;
  const queryStr = `SELECT DISTINCT role FROM doorlog`;
  db.query(queryStr, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.status(200).json({
      message: "Role list",
      result: result,
      statusCode: 200,
    });
  });
});

app.listen(port, () => {
  console.log(`Server Running on ${port}`);
});
