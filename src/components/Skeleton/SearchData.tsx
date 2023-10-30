import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import FamilyDataService from "../../services/FamilyDataService";
import { useEffect, useState } from "react";
import { AlertType } from "../../types/family.type";
import { CircularProgress } from "@mui/joy";

const familyDataService = new FamilyDataService();

interface AllData {
  id: string;
  label: string;
}

interface SourceDataMap {
  id: string;
  name: string;
}

export const SearchData = () => {
  const [listData, setListData] = useState<AllData[]>([]);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [onProgress, setOnProgress] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertType | undefined>();

  const getAllDataByName = () => {
    familyDataService
      .getAll()
      .then((data) => {
        const mapData = data.map((result: SourceDataMap, index: number) => {
          return {
            id: result.id,
            label: result.name,
          };
        });
        setListData(mapData);
      })
      .catch((e: Error) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getAllDataByName();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOnProgress(true);

    console.log(search !== undefined);
    if (search !== undefined) {
      setOnProgress(false);
    } else {
      setAlert({
        message: "Silahkan masukkan nama!",
        type: "error",
      });
      setOnProgress(false);
    }
  };

  return (
    <>
      {alert && (
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={alert ? true : false}
          autoHideDuration={3000}
          onClose={() => setAlert(undefined)}
        >
          <Alert
            onClose={() => setAlert(undefined)}
            severity={alert.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          background: "white",
          position: "absolute",
          zIndex: 99,
          top: 50,
          padding: 2,
          width: "96%",
          "@media (min-width: 780px)": {
            width: 500,
          },
          margin: 1,
          borderRadius: 3,
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        }}
      >
        <Grid container spacing={1} sx={{}}>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Typography component="h1" variant="h5">
              Cari Data
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Autocomplete
              fullWidth
              disablePortal
              id="father"
              options={listData}
              size="small"
              sx={{ marginBottom: 1 }}
              onChange={(e, v) => {
                setSearch(v?.id);
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
                <TextField {...params} label="Masukkan nama" />
              )}
            />
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" type="submit" fullWidth>
              {onProgress ? <CircularProgress size="sm" /> : "CARI"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
