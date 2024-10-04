"use client";
import { UploadFile as FileIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Button, Grid2, TextField, Typography } from "@mui/material";
import React, { type FC, useEffect, useRef, useState } from "react";

import { CircularProgress } from "@mui/material";
import { NadaValue, NadaValues, NamedValue, PartyName, ProgramBindings } from "@nillion/client-core";
import { createSignerFromKey } from "@nillion/client-payments";
import { useNilCompute, useNilComputeOutput, useNillion, useNillionAuth, useNilStoreProgram, UserCredentials } from "@nillion/client-react-hooks";
import { getAlphabetPositions } from "../lib";
import { GameResults } from "./GameResults"; // Add this import
import LetterGuess from "./letter-helpers";

export const StoreProgram: FC = () => {
  const nilStoreProgram = useNilStoreProgram();
  const nilCompute = useNilCompute();
  const { client } = useNillion();
  const name = "cows_and_bulls";

  console.log("result from nil compute:", nilCompute?.data);

  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [word, setWord] = useState<string>("");

  const [computeOutput, setComputeOutput] = useState<string | null>(null);
  const nilComputeOutput = useNilComputeOutput();

  const { login, authenticated } = useNillionAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  useEffect(() => {
    const autoLogin = async () => {
      if (!authenticated) {
        try {
          setIsLoggingIn(true);
          const credentials: UserCredentials = {
            userSeed: "example-secret-seed",
          };
          credentials.signer = () => createSignerFromKey("9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5");

          await login(credentials);
          console.log("Auto-login successful");
        } catch (err) {
          console.error("Auto-login failed:", err);
        } finally {
          setIsLoggingIn(false);
        }
      } else {
        setIsLoggingIn(false);
      }
    };

    void autoLogin();
  }, []);

  console.log("authenticated in store-program:", authenticated);


  const handleSave = (program: Uint8Array): void => {
    if (!name)
      throw new Error("store-program: Name and program data required");
    nilStoreProgram.execute({ name, program });
  };

  const handleOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content) {
          handleSave(new Uint8Array(content as ArrayBuffer));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleWordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Submitted word:", word);

    // Add the new guess to the list
    setGuesses(prevGuesses => [...prevGuesses, { word, result: null }]);

    const alphabetPositions = getAlphabetPositions(word);

    if (!nilStoreProgram.isSuccess) throw new Error("store-program: program id required");

    const bindings = ProgramBindings.create(nilStoreProgram.data)
      .addInputParty(PartyName.parse("party_scorer"), client.partyId)
      .addOutputParty(PartyName.parse("party_scorer"), client.partyId);

    const values = NadaValues.create()
      .insert(NamedValue.parse("guess_1"), NadaValue.createSecretInteger(alphabetPositions[0]))
      .insert(NamedValue.parse("guess_2"), NadaValue.createSecretInteger(alphabetPositions[1]))
      .insert(NamedValue.parse("guess_3"), NadaValue.createSecretInteger(alphabetPositions[2]))
      .insert(NamedValue.parse("guess_4"), NadaValue.createSecretInteger(alphabetPositions[3]));

    nilCompute.execute({ bindings, values });
  };

  useEffect(() => {
    if (nilCompute.isSuccess && nilCompute.data) {

      // Fetch the compute output
      nilComputeOutput.execute({ id: nilCompute.data });
    }
  }, [nilCompute.isSuccess, nilCompute.data]);

  useEffect(() => {
    if (nilComputeOutput.isSuccess && nilComputeOutput.data) {
      const outputString = JSON.stringify(nilComputeOutput.data, (key, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      });
      setComputeOutput(outputString);

      // Update the last guess with the result
      const result = parseComputeOutput(outputString);
      if (result) {
        setGuesses(prevGuesses => {
          if (prevGuesses.length === 0) {
            return [{ word, result }];
          }
          const newGuesses = [...prevGuesses];
          newGuesses[newGuesses.length - 1] = {
            ...newGuesses[newGuesses.length - 1],
            result
          };
          return newGuesses;
        });
      }
    }
  }, [nilComputeOutput.isSuccess, nilComputeOutput.data]);

  // Add this new function to parse the compute output
  const parseComputeOutput = (output: string) => {
    try {
      const { cows_output, bulls_output } = JSON.parse(output);
      return { cows: parseInt(cows_output), bulls: parseInt(bulls_output) };
    } catch (error) {
      console.error("Error parsing compute output:", error);
      return null;
    }
  };

  // Add this new state to keep track of all guesses
  const [guesses, setGuesses] = useState<Array<{ word: string, result: { cows: number, bulls: number } | null }>>([]);

  if (isLoggingIn) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Logging in...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.400",
        borderRadius: 2,
        p: 2,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h5">Store Game logic</Typography>
      <Box sx={{ mb: 4 }} />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <LoadingButton
        variant="outlined"
        sx={{ width: "150px", mt: 4 }}
        startIcon={<FileIcon />}
        loading={nilStoreProgram.isLoading}
        onClick={handleOpen}
        disabled={nilStoreProgram.isLoading}
      >
        Open File
      </LoadingButton>

      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: {nilStoreProgram.status}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            File name: {fileName ? fileName : "unset"}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Program id:{" "}
            {nilStoreProgram.isSuccess ? nilStoreProgram.data : "idle"}
          </Typography>
        </li>
      </ul>

      {nilStoreProgram.status === "success" && (
        <>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Enter a 4-letter word</Typography>
            <form onSubmit={handleWordSubmit}>
              <TextField
                value={word}
                onChange={(e) => setWord(e.target.value)}
                inputProps={{
                  maxLength: 4,
                  pattern: "[A-Za-z]{4}",
                }}
                error={word.length > 0 && word.length !== 4}
                helperText={
                  word.length > 0 && word.length !== 4
                    ? "Please enter exactly 4 letters"
                    : ""
                }
                sx={{ mt: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ ml: 2, mt: 2 }}
                disabled={word.length !== 4}
              >
                Submit
              </Button>
            </form>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 6, md: 6, lg: 6 }}>
                {guesses.length > 0 && <GameResults guesses={guesses} />}
              </Grid2>
              <Grid2 size={{ xs: 3, md: 3, lg: 3 }}>
                <LetterGuess />
              </Grid2>
            </Grid2>
          </Box>
        </>
      )}

    </Box>
  );
};
