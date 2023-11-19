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
import { Refresh } from "@mui/icons-material";

const familyDataService = new FamilyDataService();

interface AllData {
  id: string;
  label: string;
}

interface SourceDataMap {
  id: string;
  name: string;
}

interface SearchDataProps {
  onResult: (data: any | undefined) => void;
  onResetZoom: boolean;
}

export const SearchData = ({ ...props }: SearchDataProps) => {
  const [listData, setListData] = useState<AllData[]>([]);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [onProgress, setOnProgress] = useState<boolean>(false);
  const [onRefresh, setOnRefresh] = useState<boolean>(false);
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
        setOnRefresh(false);
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

    if (search !== undefined) {
      familyDataService
        .getSearchOneline(search)
        .then(async (data) => {
          const result = await familyDataService.mappingData(data);
          props.onResult(result);
          props.onResetZoom = true;
          setOnProgress(false);
        })
        .catch((e: Error) => {
          setAlert({
            message: e.message,
            type: "error",
          });
          setOnProgress(false);
        });
    } else {
      setAlert({
        message: "Silahkan masukkan nama!",
        type: "error",
      });
      setOnProgress(false);
    }
  };

  const handleChange = (search: string | undefined) => {
    props.onResult(undefined);
    props.onResetZoom = true;
    setSearch(search);
  };

  const handleFetch = () => {
    setOnRefresh(true);
    getAllDataByName();
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
          zIndex: 1,
          top: 50,
          padding: 1,
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
              Cari Silsilah
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Autocomplete
              fullWidth
              disablePortal
              id="father"
              options={listData}
              size="small"
              sx={{ marginBottom: 1 }}
              onChange={(e, v) => {
                handleChange(v?.id);
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
            <Button variant="outlined" fullWidth onClick={handleFetch}>
              {onRefresh ? <CircularProgress size="sm" /> : <Refresh />}
            </Button>
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
