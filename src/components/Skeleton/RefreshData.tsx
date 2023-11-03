import { Box, Fab } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

interface RefreshDataProps {
  onRefresh: (setRefresh: boolean) => void;
}

export const RefreshData = ({ ...props }: RefreshDataProps) => {
  return (
    <>
      <Box
        onClick={() => props.onRefresh(true)}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
        }}
      >
        <Fab color="default" aria-label="add">
          <RefreshIcon />
        </Fab>
      </Box>
    </>
  );
};
