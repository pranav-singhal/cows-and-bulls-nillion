"use client";

import { Box } from "@mui/material";
import { useState, type FC } from "react";

import {
  StoreProgram
} from "@/app/components";

const LoginLayout: FC = () => {

  const [authenticated, setAuthenticated] = useState(false);

  console.log({ authenticated });
  return (
    <Box sx={{ m: 4, display: "flex", flexDirection: "column", gap: 4 }}>

      <StoreProgram />



    </Box >
  );
};

export default LoginLayout;
