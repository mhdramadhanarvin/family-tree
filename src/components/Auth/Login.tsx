import {
  Alert,
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import FamilyDataService, { supabase } from "../../services/FamilyDataService";
import CloseIcon from "@mui/icons-material/Close";
import { Role, StatusVerifyUser } from "../../types/family.type";
import { CircularProgress } from "@mui/joy";

const familyDataService = new FamilyDataService();

interface LoginProps {
  setShow: (open: boolean) => void;
  onShow: boolean;
}

interface FormSubmit {
  email: string;
  password: string;
}

interface AlertType {
  message: string;
  type: "error" | "warning" | "info" | "success";
}

export const Login = ({ ...props }: LoginProps) => {
  const [alert, setAlert] = useState<AlertType | undefined>();
  const [onProgress, setOnProgress] = useState<boolean>(false);
  const [selectedValues, setSelectedValues] = React.useState<FormSubmit>({
    email: "",
    password: "",
  });

  const handleChange = (group: string, value: any) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };

  const hideLogin = useCallback(() => props.setShow(false), [props]);

  const signInWithEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOnProgress(true);

    familyDataService
      .userSignIn(selectedValues)
      .then(async (data) => {
        const getStatus = await familyDataService.getProfileById(
          data?.user.id || ""
        );

        if (
          (getStatus.role_id === Role.member && getStatus.is_verify === StatusVerifyUser.approve) ||
          getStatus.role_id === Role.administrator
        ) {
          setOnProgress(false);
          setAlert({
            message: "Berhasil Login, silahkan menunggu...",
            type: "success",
          });
          setTimeout(() => {
            props.setShow(false);
          }, 1500);
        } else {
          await supabase.auth.signOut();
          setOnProgress(false);
          setAlert({
            message: "Akun dalam proses verifikasi admin, silahkan menunggu...",
            type: "error",
          });
        }
      })
      .catch((e: Error) => {
        setAlert({
          message: "Email atau password salah",
          type: "error",
        });
        setOnProgress(false);
      });
  };

  return (
    <>
      <Modal
        open={props.onShow}
        onClose={() => props.setShow(false)}
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
            onSubmit={signInWithEmail}
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
              onClick={hideLogin}
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
              Sign in
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
            {/* <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        /> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {onProgress ? <CircularProgress size="sm" /> : "Sign In"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
