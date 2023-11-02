import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import FamilyDataService, { supabase } from "../../services/FamilyDataService";
import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress } from "@mui/joy";
import { Refresh } from "@mui/icons-material";

const familyDataService = new FamilyDataService();

interface RegisterProps {
  setShow: (open: boolean) => void;
  onShow: boolean;
}

interface FormSubmit {
  email: string;
  name: string;
  password: string;
  fatherId: string;
  motherId: string;
}

interface AlertType {
  message: string;
  type: "error" | "warning" | "info" | "success";
}

interface AllData {
  id: string;
  label: string;
  parentId: string;
}

interface ParentDataMap {
  id: number;
  name: string;
}

export const Register = ({ ...props }: RegisterProps) => {
  const [alert, setAlert] = useState<AlertType | undefined>();
  const [listFather, setListFather] = useState<AllData[]>([]);
  const [listMother, setListMother] = useState<AllData[]>([]);
  const [onLoad, setOnLoad] = useState<boolean>(false);
  const [onProgress, setOnProgress] = useState<boolean>(false);
  const [selectedValues, setSelectedValues] = React.useState<FormSubmit>({
    email: "",
    name: "",
    password: "",
    fatherId: "",
    motherId: "",
  });

  const handleChange = (group: string, value: any) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };

  const hideRegister = useCallback(() => props.setShow(false), [props]);

  const signUpWithEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOnProgress(true);

    if (validateData(selectedValues)) {
      familyDataService
        .userSignUp(selectedValues)
        .then(() => {
          setOnProgress(false);
          setAlert({
            message: "Berhasil daftar, silahkan menunggu verifikas data...",
            type: "success",
          });
          setTimeout(async () => {
            await supabase.auth.signOut();
            props.setShow(false);
            setAlert(undefined);
          }, 2500);
        })
        .catch((e: Error) => {
          setOnProgress(false);
          setAlert({
            message: e.message,
            type: "error",
          });
        });
    }
  };

  const validateData = (data: FormSubmit) => {
    const { email, password, fatherId, motherId } = data;
    let statusValidation = true;

    if (!email) {
      setAlert({
        message: "Email wajib diisi!",
        type: "error",
      });
      setOnProgress(false);
      return (statusValidation = false);
    } else if (!password) {
      setAlert({
        message: "Password wajib diisi!",
        type: "error",
      });
      setOnProgress(false);
      return (statusValidation = false);
    } else if (fatherId === "" || fatherId === undefined) {
      setAlert({
        message: "Pilih nama ayah terlebih dahulu!",
        type: "error",
      });
      setOnProgress(false);
      return (statusValidation = false);
    } else if (motherId === "" || motherId === undefined) {
      setAlert({
        message: "Pilih nama ibu terlebih dahulu!",
        type: "error",
      });
      setOnProgress(false);
      return (statusValidation = false);
    }

    return statusValidation;
  };

  const getFatherData = (byPassOnload = false) => {
    familyDataService
      .getAllFatherData()
      .then((data) => {
        const mapData = data.map((result: ParentDataMap) => {
          return {
            id: result.id,
            label: result.name,
          };
        });
        if (!byPassOnload) setOnLoad(false);
        setListFather(mapData);
        console.log("GET FATHER");
      })
      .catch((e: Error) => {
        console.log("Error", e);
      });
  };

  const getMotherData = () => {
    if (selectedValues.fatherId) {
      setListMother([]);
      familyDataService
        .getSpouseByHusbandId(selectedValues.fatherId)
        .then((data) => {
          handleChange("motherId", undefined);
          setListMother(data);
          setOnLoad(false);
          console.log("GET MOTHER");
        })
        .catch((e: Error) => {
          console.log(e);
        });
    }
  };

  const refreshData = () => {
    setOnLoad(true);
    if (selectedValues.fatherId === undefined || selectedValues.fatherId === "")
      getFatherData();
    getMotherData();
  };

  useEffect(() => {
    getFatherData();
  }, []);

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
              Daftar
            </Typography>
            <TextField
              margin="dense"
              required
              fullWidth
              id="name"
              label="Nama"
              name="name"
              autoComplete="name"
              autoFocus
              size="small"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              size="small"
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              size="small"
              autoComplete="current-password"
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <Autocomplete
              fullWidth
              disablePortal
              id="father"
              options={listFather}
              size="small"
              sx={{ marginTop: 1 }}
              onChange={(e, v) => {
                handleChange("motherId", undefined);
                setListMother([]);
                handleChange("fatherId", v?.id);
              }}
              isOptionEqualToValue={(option, value) =>
                option.label === value.label
              }
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.id}>
                    {option.label}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Nama Ayah" />
              )}
            />
            <Grid container spacing={0}>
              <Grid item xs={10}>
                <Autocomplete
                  disabled={listMother.length === 0}
                  fullWidth
                  disablePortal
                  id="mother"
                  options={listMother}
                  size="small"
                  sx={{ marginTop: 1 }}
                  onChange={(e, v) => {
                    handleChange("motherId", v?.parentId);
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.label === value.label
                  }
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {option.label}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Nama Ibu " />
                  )}
                />
              </Grid>
              <Grid item xs={2} sx={{ padding: 1 }}>
                <IconButton onClick={refreshData}>
                  {onLoad ? <CircularProgress size="sm" /> : <Refresh />}
                </IconButton>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {onProgress ? <CircularProgress size="sm" /> : "DAFTAR"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
