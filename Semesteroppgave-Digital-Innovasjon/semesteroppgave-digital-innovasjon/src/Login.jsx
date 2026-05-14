import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`

const Card = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
`

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 8px;
  font-size: 32px;
`

const Subtitle = styled.p`
  text-align: center;
  color: #888;
  margin-bottom: 30px;
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
  margin-bottom: 12px;
`

const ToggleText = styled.p`
  text-align: center;
  color: #888;
  cursor: pointer;
  span {
    color: #667eea;
    font-weight: bold;
  }
`

const ErrorText = styled.p`
  color: red;
  text-align: center;
  margin-bottom: 12px;
`

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError("Noe gikk galt. Sjekk e-post og passord.");
    }
  };

  return (
    <Container>
      <Card>
        <Title>Venni 👋</Title>
        <Subtitle>{isRegistering ? "Opprett konto" : "Logg inn og finn nye venner"}</Subtitle>
        <Input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <ErrorText>{error}</ErrorText>}
        <Button onClick={handleSubmit}>
          {isRegistering ? "Registrer deg" : "Logg inn"}
        </Button>
        <ToggleText onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Har du allerede konto? " : "Har du ikke konto? "}
          <span>{isRegistering ? "Logg inn" : "Registrer deg"}</span>
        </ToggleText>
      </Card>
    </Container>
  );
}

export default Login;