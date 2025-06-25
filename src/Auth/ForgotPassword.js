import React, { useState } from 'react';
import RainbowSDK from 'rainbow-web-sdk';

RainbowSDK.load();

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [switchToEmailCode, setSwitchToEmailCode] = useState(false);

  const sendResetEmail = async () => {
    if (!isValidEmail(email)) return alert("Enter a valid email");

    // You will likely need to implement your own reset password email logic using your backend
    alert("Password reset instructions sent to " + email);
    setSwitchToEmailCode(true);
  };

  const resetPassword = () => {
    if (!isValidCode(verificationCode)) return alert("Invalid code");
    if (!newPassword) return alert("Enter a new password");

    // No direct Rainbow Web SDK method for this – typically done through backend
    alert("Password reset simulated. You can now login.");
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidCode = (code) => code.length >= 6;

  return (
    <div style={styles.container}>
      <img src="logo.png" alt="App Icon" style={styles.logo} />

      {switchToEmailCode ? (
        <>
          <h2>Enter Verification Code</h2>
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />
          <button onClick={resetPassword} style={styles.button}>Continue</button>
        </>
      ) : (
        <>
          <h2>Forgot Password</h2>
          <p>Enter your email and we’ll send reset instructions.</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <button onClick={sendResetEmail} style={styles.button}>Send Email</button>
        </>
      )}

      <div style={styles.footer}>
        <span>Already have an account?</span>
        <button onClick={() => alert("Redirect to Login")} style={styles.link}>Login</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%', maxWidth: 400, margin: 'auto', padding: 20, textAlign: 'center'
  },
  logo: {
    width: 100, height: 100, marginBottom: 20
  },
  input: {
    width: '100%', padding: 10, margin: '10px 0', fontSize: 16
  },
  button: {
    width: '100%', padding: 10, backgroundColor: '#0086CF', color: 'white', fontSize: 16, border: 'none'
  },
  footer: {
    marginTop: 20
  },
  link: {
    marginLeft: 5, color: '#0086CF', background: 'none', border: 'none', cursor: 'pointer'
  }
};
