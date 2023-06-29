import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { CircularProgress } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copyright } from "../common/Copyright";

export interface SignInParams {
  errorMsg: string;
  onSubmit: (username: string, password: string) => Promise<boolean>;
}

export function SignIn({ onSubmit, errorMsg }: SignInParams) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  const handleEmailChanged = (value: string) => {
    setEmail(value);
    setIsFormValid(value !== "" && password !== "");
  };

  const handlePasswordChanged = (value: string) => {
    setPassword(value);
    setIsFormValid(value !== "" && email !== "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email && password) {
      setLoading(true);
      const result = await onSubmit(email, password);
      setLoading(false);
      if (result) {
        navigate("/");
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            aria-label="email"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => handleEmailChanged(e.target.value)}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => handlePasswordChanged(e.target.value)}
          />
          {/* <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" /> */}
          {errorMsg && (
            <Typography color="red" align="center">
              {errorMsg}
            </Typography>
          )}
          <Box component="div" sx={{ position: "relative" }}>
            <Button
              type="submit"
              data-testid="sign-in"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={!isFormValid || loading}
            >
              Sign In
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  color: "primary",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-8px",
                  marginLeft: "-10px",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Copyright color="text.secondary" sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
