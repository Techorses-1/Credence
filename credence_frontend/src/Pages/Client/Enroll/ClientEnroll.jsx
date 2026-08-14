import { useState } from "react";
import axios from "axios";
import "./ClientEnroll.scss";

const ClientEnroll = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [done, setDone] = useState(false);

  const submit = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/client-enrollment/enroll`,
      form
    );
    setDone(true);
  };

  return (
    <div className="client-enroll">
      <div className="client-enroll__card">
        <h2>Client Enrollment</h2>

        {done ? (
          <p>Enrollment submitted. Admin approval pending.</p>
        ) : (
          <>
            <input
              placeholder="Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <input
              placeholder="Email"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
            <input
              placeholder="Phone"
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
            <button onClick={submit}>Submit</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientEnroll;
