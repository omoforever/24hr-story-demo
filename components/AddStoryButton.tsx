"use client";

import { useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { AVATAR_SIZE } from "./storyTrayLayout";

type AddStoryButtonProps = {
  onSelect: (file: File) => void;
  isBusy?: boolean;
};

export function AddStoryButton({ onSelect, isBusy = false }: AddStoryButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Clearing the value lets the same file be picked twice in a row — otherwise the input's
    // value is unchanged the second time and no change event fires.
    event.target.value = "";

    if (file) onSelect(file);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <ButtonBase
        onClick={() => inputRef.current?.click()}
        disabled={isBusy}
        aria-label="Add a story"
        sx={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: "50%",
          border: "2px dashed",
          borderColor: "divider",
          color: "text.secondary",
          flexShrink: 0,
        }}
      >
        {isBusy ? <CircularProgress size={24} /> : <AddIcon />}
      </ButtonBase>

      <Typography variant="caption" color="text.secondary">
        Add
      </Typography>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        hidden
      />
    </Box>
  );
}
