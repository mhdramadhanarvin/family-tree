import {
  Alert,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Modal,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useState } from "react";
import { AlertType, NewUserType } from "../../types/family.type";
import FamilyDataService from "../../services/FamilyDataService";

interface CreateUserProps {
  onShow: boolean;
  setShow: (open: boolean) => void;
}

export const CreateUser = ({ ...props }: CreateUserProps) => {
  const closeHandler = useCallback(() => {
    props.setShow(false);
    setSelectedValues({ email: "", password: "" });
    setOnProgress(false);
    setAlert(undefined);
  }, [props]);
  const [selectedValues, setSelectedValues] = useState<NewUserType>({
    email: "",
    password: "",
  });
  const [alert, setAlert] = useState<AlertType | undefined>();
  const [onProgress, setOnProgress] = useState<boolean>(false);

  const handleChange = (group: string, value: any) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOnProgress(true);

    if (validateData(selectedValues)) {
      FamilyDataService.createNewUser(selectedValues)
        .then((data) => {
          setAlert({
            message: "Berhasil membuat akun baru",
            type: "success",
          });
          setSelectedValues({ email: "", password: "" });
          handleChange("email", "");
          handleChange("password", "");
          setOnProgress(false);
        })
        .catch((e: Error) => {
          setAlert({
            message: e.message,
            type: "error",
          });
          setOnProgress(false);
        });
    }
  };

  const validateData = (value: NewUserType) => {
    const { email, password } = value;

    // email, password, relationType wajib diisi
    let statusValidation = true;
    if (!email) {
      setAlert({ message: "Email wajib diisi!", type: "error" });
      setOnProgress(false);
      return (statusValidation = false);
    } else if (!password) {
      setAlert({ message: "Password wajib diisi!", type: "error" });
      setOnProgress(false);
      return (statusValidation = false);
    }
    return statusValidation;
  };

  return (
    <>
      <Modal
        open={props.onShow}
        onClose={closeHandler}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              width: "100%",
              "@media (min-width: 780px)": {
                width: "30%",
              },
              backgroundColor: "white",
              padding: 5,
            }}
          >
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              sx={{
                float: "right",
              }}
              onClick={closeHandler}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
            {alert && (
              <Alert
                variant="filled"
                severity={alert.type}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setAlert(undefined);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ width: "100%", marginBottom: "10px" }}
              >
                {alert.message}
              </Alert>
            )}
            <Typography component="h1" variant="h5">
              Buat Akun
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {onProgress ? <CircularProgress color="inherit" /> : "SIMPAN"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
