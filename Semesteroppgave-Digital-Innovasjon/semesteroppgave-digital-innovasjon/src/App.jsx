import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Login from "./Login";
import Profile from "./Profile";
import Swipe from "./Swipe";
import styled from "styled-components";

const NavBar = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 100;
`

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  opacity: ${props => props.$aktiv ? "1" : "0.4"};
`

function App() {
  const [user, setUser] = useState(null);
  const [harProfil, setHarProfil] = useState(false);
  const [laster, setLaster] = useState(true);
  const [side, setSide] = useState("profil");

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
    <div style={{paddingBottom: "70px"}}>
      {side === "swipe" && <Swipe />}
      {side === "profil" && (
        <div style={{padding: "40px", textAlign: "center"}}>
          <h2>Min profil</h2>
          <p>Logget inn som: {user.email}</p>
          <button onClick={() => signOut(auth)} style={{
            padding: "10px 20px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            marginTop: "20px"
          }}>Logg ut</button>
        </div>
      )}
      <NavBar>
        <NavButton $aktiv={side === "swipe"} onClick={() => setSide("swipe")}>🔥</NavButton>
        <NavButton $aktiv={side === "profil"} onClick={() => setSide("profil")}>👤</NavButton>
      </NavBar>
    </div>
  );
}

export default App;
