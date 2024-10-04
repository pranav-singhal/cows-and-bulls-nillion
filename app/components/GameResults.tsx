import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import React from 'react';

interface GameResultsProps {
    guesses: Array<{ word: string; result: { cows: number; bulls: number } | null }>;
}

export const GameResults: React.FC<GameResultsProps> = ({ guesses }) => {
    return (
        <Box sx={{ mt: 4, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Game Results</Typography>
            <List>
                {guesses.map((guess, index) => (
                    <React.Fragment key={index}>
                        <ListItem>
                            <ListItemText
                                primary={`Word: ${guess.word.toUpperCase()}`}
                                secondary={
                                    guess.result
                                        ? `Bulls: ${guess.result.bulls}, Cows: ${guess.result.cows}`
                                        : 'Calculating...'
                                }
                            />
                        </ListItem>
                        {guess.result?.bulls === 4 && (
                            <ListItem>
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" color="success.main">
                                            Congratulations! You guessed the word correctly!
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        )}
                        {index < guesses.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};