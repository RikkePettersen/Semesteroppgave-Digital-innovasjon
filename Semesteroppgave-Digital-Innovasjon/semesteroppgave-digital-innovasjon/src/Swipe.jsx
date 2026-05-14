import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Login from "./Login";
import Profile from "./Profile";
import styled from "styled-components";

const Container = styled.div`
  padding: 40px;
  text-align: center;
`

const Button = styled.button`
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
`

function App() {
  const [user, setUser] = useState(null);
  const [harProfil, setHarProfil] = useState(false);
  const [laster, setLaster] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        setHarProfil(docSnap.exists());
      }
      setLaster(false);
    });
    return unsubscribe;
  }, []);

  if (laster) return <p>Laster...</p>;

  if (!user) return <Login onLogin={() => {}} />;

  if (!harProfil) return <Profile onSave={() => setHarProfil(true)} />;

  return (
    <Container>
      <h1>Velkommen til Venni! 👋</h1>
      <p>Logget inn som: {user.email}</p>
      <Button onClick={() => signOut(auth)}>Logg ut</Button>
    </Container>
  );
}

export default App;