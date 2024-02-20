import { useEffect, useState } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Container,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

function App() {
  const [rowsData, setRowsData] = useState([]);
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("all");
  const [roleList, setRoleList] = useState([]);

  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "firstname", headerName: "Firstname", width: 150 },
    { field: "lastname", headerName: "Lastname", width: 150 },
    { field: "role", headerName: "Role", width: 150 },
    { field: "rfid", headerName: "Rfid", width: 150 },
    { field: "door_mode", headerName: "Door Mode", width: 150 },
    { field: "result", headerName: "Result", width: 150 },
    { field: "created_by", headerName: "Created by", width: 150 },
  ];

  // เรียกใช้งานฟังชั่นผ่าน useEffect
  useEffect(() => {
    handleSearch();
    getRoleList();
  }, []);

  // ส่ง request ไปยัง API
  // ฟังก์ชัน setRoleList ใช้เพื่ออัปเดต state roleList ด้วยข้อมูล result
  const getRoleList = () => {
    axios.get("http://localhost:8081/role-list").then((res) => {
      setRoleList(res.data.result);
    });
  };

  // ส่ง request ไป API
  // อัปเดต state rowsData ด้วยข้อมูลใหม่
  // payload เก็บ fullname role จาก client
  // เมื่อได้รับ response จาก API ฟังชั่นจะดึง result จาก object res.data
  // ฟังก์ชัน setRowsData ใช้เพื่ออัปเดต state rowsData ด้วยข้อมูล result

  const handleSearch = () => {
    const payload = {
      fullname: fullname,
      role: "all",
    };
    axios.post("http://localhost:8081/search", payload).then((res) => {
      setRowsData(res.data.result);
    });
  };

  return (
    <>
      <Container style={{ marginTop: "60px" }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Fullname"
                variant="outlined"
                onChange={(e) => setFullname(e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Role</InputLabel>
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="all">ALL</MenuItem>
                {roleList.map((role) => (
                  <MenuItem key={role.role} value={role.role}>
                    {role.role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <FormControl fullWidth>
              <Button variant="contained" onClick={handleSearch}>
                Search
              </Button>
            </FormControl>
          </Grid>
        </Grid>
        <div style={{ height: 700, width: "100%", marginTop: "15px" }}>
          <DataGrid rows={rowsData} columns={columns} />
        </div>
      </Container>
    </>
  );
}

export default App;
