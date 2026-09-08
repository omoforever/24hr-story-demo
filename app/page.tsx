import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <Container maxWidth="sm" disableGutters>
      <Box component="header" sx={{ px: 4, py: 6 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          24hr Stories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Post a photo. It disappears after 24 hours.
        </Typography>
      </Box>
    </Container>
  );
}
