import { Box, Grid, Typography } from "@mui/material";
import React, { useState } from 'react';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const LetterGuess: React.FC = () => {
    const [strikedLetters, setStrikedLetters] = useState<Set<string>>(new Set());

    const toggleLetter = (letter: string) => {
        setStrikedLetters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(letter)) {
                newSet.delete(letter);
            } else {
                newSet.add(letter);
            }
            return newSet;
        });
    };

    return (
        <Box sx={{ mt: 2, p: 1, border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}>
            <Grid container spacing={0} columns={16}>
                {alphabet.map((letter, index) => (
                    <Grid item xs={4} key={letter} sx={{ p: '1px' }}>
                        <Box
                            onClick={() => toggleLetter(letter)}
                            sx={{
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                border: '1px solid',
                                borderColor: 'primary.main',
                                borderRadius: 1,
                                cursor: 'pointer',
                                backgroundColor: strikedLetters.has(letter) ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
                                '&:hover': {
                                    backgroundColor: strikedLetters.has(letter) ? 'rgba(255, 0, 0, 0.2)' : 'primary.light',
                                },
                                position: 'relative', // Added for positioning the strikethrough
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    position: 'relative', // Added for positioning the strikethrough
                                    '&::after': strikedLetters.has(letter) ? {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: '50%',
                                        borderBottom: '2px solid red',
                                        transform: 'rotate(-45deg)',
                                    } : {},
                                }}
                            >
                                {letter}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default LetterGuess;
