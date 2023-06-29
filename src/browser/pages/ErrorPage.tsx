import { Box, Button, Container, Typography } from "@mui/material";
import React from "react";
import { FallbackProps } from "react-error-boundary";
import { Copyright } from "../../components/common/Copyright";
import { logger } from "../../components/logging";

export function ErrorPage({ error, resetErrorBoundary }: FallbackProps) {
  logger.error("Error while rendering component", error);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Typography variant="h2" component="h1" gutterBottom>
          Ups, this is embarrassing!
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Apologies, an unexpected error occurred while rendering the page
        </Typography>
        <Button variant="contained" onClick={resetErrorBoundary}>
          Try Again
        </Button>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) => theme.palette.primary.main,
        }}
      >
        <Container maxWidth="sm">
          <Copyright />
        </Container>
      </Box>
    </Box>
  );
}
