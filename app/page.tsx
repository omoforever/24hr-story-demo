"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { StoryTray } from "@/components/StoryTray";
import { useStories } from "@/hooks/useStories";

export default function Home() {
  const { stories, addStory, isLoaded } = useStories();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddStory(file: File) {
    setIsBusy(true);
    setError(null);

    try {
      await addStory(file);
    } catch (caught) {
      // StorageFullError already carries a message worth showing; anything else is unexpected.
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong saving that story.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Container maxWidth="sm" disableGutters>
      <Box component="header" sx={{ px: 4, pt: 6, pb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          24hr Stories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Post a photo. It disappears after 24 hours.
        </Typography>
      </Box>

      <StoryTray stories={stories} onAddStory={handleAddStory} isBusy={isBusy} />

      {isLoaded && stories.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 4, py: 2 }}>
          No stories yet — tap Add to post one.
        </Typography>
      )}

      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
