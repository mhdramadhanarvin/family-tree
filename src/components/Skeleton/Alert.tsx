import { Box, Modal, Typography } from "@mui/material";

interface AlertProps {
  open: boolean;
  onClose: (close: boolean) => void;
  style: object;
  title: string;
  message: string;
}

export const Alert = ({ open, onClose, style, title, message }: AlertProps) => {
  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {message}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};
