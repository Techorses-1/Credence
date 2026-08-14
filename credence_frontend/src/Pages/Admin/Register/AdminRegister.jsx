import { useState } from "react";
import axios from "axios";
import "./AdminRegister.scss";

const AdminRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/register`,
        form
      );

      alert("Admin registered successfully");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register">
      <div className="admin-register__card">
        <h2>Admin Register</h2>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button onClick={submit} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
};

export default AdminRegister;
