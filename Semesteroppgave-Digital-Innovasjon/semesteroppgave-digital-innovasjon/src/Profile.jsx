import { useState } from "react";
import { db, auth } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const Card = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
`

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 24px;
`

const Input = styled.input`
  width: 100%;
  padding: 14px;
  margin-bottom: 16px;
  border: 2px solid #eee;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 14px;
  margin-bottom: 16px;
  border: 2px solid #eee;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 14px;
  margin-bottom: 16px;
  border: 2px solid #eee;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  height: 100px;
  resize: none;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const InteresserContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
`

const InteresseBadge = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.$valgt ? "#667eea" : "#eee"};
  background: ${props => props.$valgt ? "#667eea" : "white"};
  color: ${props => props.$valgt ? "white" : "#333"};
  cursor: pointer;
  font-size: 14px;
`

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`

const alleInteresser = [
  "🏃 Løping", "🎮 Gaming", "🎵 Musikk", "🍕 Mat",
  "📚 Lesing", "🎨 Kunst", "⚽ Fotball", "🏊 Svømming",
  "🧗 Klatring", "🎭 Teater", "🌍 Reising", "🐶 Dyr",
  "🏋️ Trening", "🎸 Konsert", "🍳 Matlaging", "🚴 Sykling"
];

const kommuner = [
  "Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø",
  "Drammen", "Fredrikstad", "Kristiansand", "Sandnes", "Ålesund",
  "Bodø", "Sandefjord", "Arendal", "Haugesund", "Tønsberg"
];

function Profile({ onSave }) {
  const [navn, setNavn] = useState("");
  const [alder, setAlder] = useState("");
  const [kjønn, setKjønn] = useState("");
  const [kommune, setKommune] = useState("");
  const [bio, setBio] = useState("");
  const [interesser, setInteresser] = useState([]);

  const toggleInteresse = (interesse) => {
    if (interesser.includes(interesse)) {
      setInteresser(interesser.filter(i => i !== interesse));
    } else {
      setInteresser([...interesser, interesse]);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    await setDoc(doc(db, "users", user.uid), {
      navn,
      alder,
      kjønn,
      kommune,
      bio,
      interesser,
      email: user.email
    });
    onSave();
  };

  return (
    <Container>
      <Card>
        <Title>Sett opp profilen din 🙋</Title>
        <Input
          placeholder="Navn"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Alder"
          value={alder}
          onChange={(e) => setAlder(e.target.value)}
        />
        <Select value={kjønn} onChange={(e) => setKjønn(e.target.value)}>
          <option value="">Velg kjønn</option>
          <option value="Mann">Mann</option>
          <option value="Kvinne">Kvinne</option>
          <option value="Annet">Annet</option>
        </Select>
        <Select value={kommune} onChange={(e) => setKommune(e.target.value)}>
          <option value="">Velg kommune</option>
          {kommuner.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </Select>
        <Textarea
          placeholder="Skriv en kort bio om deg selv..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p style={{marginBottom: "10px", color: "#333", fontWeight: "bold"}}>Velg interesser:</p>
        <InteresserContainer>
          {alleInteresser.map(interesse => (
            <InteresseBadge
              key={interesse}
              $valgt={interesser.includes(interesse)}
              onClick={() => toggleInteresse(interesse)}
            >
              {interesse}
            </InteresseBadge>
          ))}
        </InteresserContainer>
        <Button onClick={handleSave}>Lagre profil</Button>
      </Card>
    </Container>
  );
}

export default Profile;