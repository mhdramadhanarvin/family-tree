import {
  Alert,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import FamilyDataService from "../../services/FamilyDataService";
import CloseIcon from "@mui/icons-material/Close";

interface RegisterProps {
  onShow: (open: boolean) => void;
}

interface FormSubmit {
  email: string;
  password: string;
}

interface AlertType {
  message: string;
  type: "error" | "warning" | "info" | "success";
}

export const Register = ({ ...props }: RegisterProps) => {
  const [alert, setAlert] = useState<AlertType | undefined>();
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

  const hideRegister = useCallback(() => props.onShow(false), [props]);

  const signUpWithEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { email, password } = selectedValues;

    FamilyDataService.userSignUp({
      email,
      password,
    })
      .then(() => {
        setAlert({
          message: "Berhasil daftar, silahkan menunggu...",
          type: "success",
        });

        setTimeout(() => {
          props.onShow(false);
        }, 1500);
      })
      .catch((e: Error) => {
        setAlert({
          message: e.message,
          type: "error",
        });
      });
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={signUpWithEmail}
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
          onClick={hideRegister}
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
          Register
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
          Sign Up
        </Button>
      </Box>
    </>
  );
};
