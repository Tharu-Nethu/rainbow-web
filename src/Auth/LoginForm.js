import React, { useState } from 'react';
import RainbowSDK from 'rainbow-web-sdk';

RainbowSDK.load();

export default function LoginFormWeb({ onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const doLogin = async () => {
    if (!isValidEmail() || !password) {
      alert("Please enter a valid email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await RainbowSDK.start({
        rainbowsdk: {
          host: "sandbox.openrainbow.com", // change to production if needed
          credentials: {
            appID: "YOUR_APP_ID",
            appSecret: "YOUR_SECRET",
          }
        }
      });

      const user = await RainbowSDK.connection.signin(email, password);
      console.log("Signed in as", user.displayName);
      alert("Login success!");

    } catch (err) {
      console.error("Login failed:", err);
      setAuthError("Invalid credentials or connection issue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <img
        src="logo.png"
        alt="App Icon"
        style={styles.logo}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      {authError && <p style={styles.errorText}>{authError}</p>}

      <p style={styles.linkText} onClick={onForgotPassword}>Forgot Password?</p>

      <button onClick={doLogin} disabled={isLoading} style={styles.button}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: '100%', maxWidth: 400, margin: 'auto', padding: 30, textAlign: 'center'
  },
  logo: {
    width: 100, height: 100, borderRadius: 15, marginBottom: 20
  },
  input: {
    width: '100%', padding: 10, margin: '10px 0', fontSize: 16
  },
  button: {
    width: '100%', padding: 10, backgroundColor: '#0086CF', color: 'white', fontSize: 16, border: 'none'
  },
  errorText: {
    color: '#FF4D4F', fontSize: 14
  },
  linkText: {
    color: '#0086CF', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 15
  }
};
