import { useEffect, useState } from "react";

function App() {
  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const[editingId,setEditingId] = useState(null);

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const deleteStudent = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/students/${id}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      fetchStudents();
    }
  } catch (error) {
    console.error("Error deleting student:", error);
  }
};

  useEffect(() => {
    fetchStudents();
  }, []);

  const editStudent = (student) => {
  setEditingId(student.id);
  setName(student.name);
  setEmail(student.email);
  setPhone(student.phone);
  setCareerGoal(student.careerGoal);
};

const updateStudent = async (e) => {
  e.preventDefault();

  const updatedStudent = {
    name,
    email,
    phone,
    careerGoal,
  };

  try {
    const response = await fetch(
      `http://localhost:8080/api/students/${editingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStudent),
      }
    );

    if (response.ok) {
      setEditingId(null);
      setName("");
      setEmail("");
      setPhone("");
      setCareerGoal("");

      fetchStudents();
    }
  } catch (error) {
    console.error("Error updating student:", error);
  }
};

  const addStudent = async (e) => {
    e.preventDefault();

    const newStudent = {
      name,
      email,
      phone,
      careerGoal,
    };

    try {
      const response = await fetch("http://localhost:8080/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      });

      if (response.ok) {
        setName("");
        setEmail("");
        setPhone("");
        setCareerGoal("");

        fetchStudents();
      }
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  return (
    <div>
      <h1>SkillBridge</h1>
      <p>Student Career & Skill Management System</p>

      <h2>Add Student</h2>

      <form onSubmit={editingId ? updateStudent: addStudent}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Career Goal"
          value={careerGoal}
          onChange={(e) => setCareerGoal(e.target.value)}
        />

        <button type="submit">{editingId ? "Update Student" : "Add Student"}</button>
      </form>

      <h2>Students</h2>

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        students.map((student) => (
          <div key={student.id}>
            <h3>{student.name}</h3>
            <p>Email: {student.email}</p>
            <p>Phone: {student.phone}</p>
            <p>Career Goal: {student.careerGoal}</p>
            <button onClick={() => deleteStudent(student.id)}>Delete</button>
            <button onClick={() => editStudent(student)}> Edit</button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;