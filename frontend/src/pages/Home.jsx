import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h3>React đang kết nối Backend thành công</h3>
      <ul>
        {users.map(u => (
          <li key={u._id}>{u.username}</li>
        ))}
      </ul>
    </div>
  );
}
