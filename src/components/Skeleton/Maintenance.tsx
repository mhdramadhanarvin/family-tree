import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";

export const Maintenance = () => {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: "100vh" }}
    >
      <Typography sx={{ fontSize: 20, fontWeight: "bold" }} color="text.secondary" gutterBottom>
        Website Sedang Dalam Perbaikan
      </Typography>
    </Grid>
  );
};
