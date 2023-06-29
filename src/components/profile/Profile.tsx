import React, { MouseEvent } from "react";
import { Title } from "../common/Title";
import { Link, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ProfileParams {
  username: string;
  creditBalance: number;
  onSignOut: () => Promise<void>;
}

export function Profile({ username, creditBalance, onSignOut }: ProfileParams) {
  const navigate = useNavigate();
  const handleSignOut = async (e: MouseEvent) => {
    e.preventDefault();
    await onSignOut();
    navigate("/login");
  };

  return (
    <React.Fragment>
      <Title>Profile</Title>
      <Typography color="primary" variant="h5" sx={{ flex: 1 }} data-testid="username">
        {username}
      </Typography>
      <Typography component="p" variant="h5" data-testid="credit-balance">
        {creditBalance}
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        Credits
      </Typography>
      <div style={{ textAlign: "right" }}>
        <Link color="primary" href="#" onClick={(e) => handleSignOut(e)} data-testid="sign-out-btn">
          Sign out
        </Link>
      </div>
    </React.Fragment>
  );
}
