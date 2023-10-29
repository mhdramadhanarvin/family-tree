import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { GridCloseIcon } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import FamilyDataService from "../../services/FamilyDataService";
import { Refresh } from "@mui/icons-material";

const familyDataService = new FamilyDataService();

interface ParentData {
  id: number;
  label: string;
  parentId: string;
}

interface ParentDataMap {
  id: number;
  name: string;
}

interface Person {
  name: string;
  gender: string;
}

interface FormSubmit {
  father: string;
  mother: string;
  person: Person[];
}

export const MemberAccess = () => {
  const [listFather, setListFather] = useState<ParentData[]>([]);
  const [listMother, setListMother] = useState<ParentData[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedValues, setSelectedValues] = useState<FormSubmit>({
    father: "",
    mother: "",
    person: [
      {
        name: "",
        gender: "male",
      },
    ],
  });
  const handleChange = (group: string, value: any) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };

  const handleAddPerson = () => {
    handleChange("person", [
      ...selectedValues.person,
      { name: "", gender: "male" },
    ]);
  };

  const handleRemovePerson = (index: number) => {
    const filteredFields = selectedValues.person.filter((_, i) => i !== index);
    handleChange("person", filteredFields);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log(selectedValues);
  };

  useEffect(() => {
    if (showForm) {
      if (selectedValues.father === undefined) {
        handleChange("mother", undefined);
        setListMother([]);
      }
      if (selectedValues.father === "") {
        familyDataService
          .getAllFatherData()
          .then((data) => {
            const mapData = data.map((result: ParentDataMap, index: number) => {
              return {
                id: index,
                label: result.name,
                parentId: result.id,
              };
            });
            setListFather(mapData);
            console.log("GET FATHER");
          })
          .catch((e: Error) => {
            console.log("Error", e);
          });
      }
    }
  }, [
    listFather,
    listMother,
    selectedValues.father,
    selectedValues.mother,
    showForm,
  ]);

  const getMotherData = () => {
    familyDataService
      .getSpouseByHusbandId(selectedValues.father)
      .then((data) => {
        handleChange("mother", "");
        setListMother(data);
      })
      .catch((e: Error) => {
        console.log(e);
      });
  };

  return (
    <>
      <Box
        onClick={() => setShowForm(true)}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
        }}
      >
        <Fab color="primary" aria-label="add">
          <AddIcon />
        </Fab>
      </Box>
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            // width: "50%",
            width: "100%",
            "@media (min-width: 780px)": {
              width: "70%",
            },
            backgroundColor: "white",
            padding: 3,
            // paddingBottom: 10,
          }}
          component="form"
          onSubmit={handleSubmit}
        >
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            sx={{
              float: "right",
            }}
            onClick={() => setShowForm(false)}
          >
            <GridCloseIcon fontSize="inherit" />
          </IconButton>
          <Typography
            component="h1"
            variant="h5"
            sx={{
              marginBottom: 2,
            }}
          >
            Tambah Keluarga
          </Typography>
          <Typography component="h1" variant="subtitle1" marginBottom={1}>
            Data Orangtua
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Autocomplete
                disablePortal
                id="father"
                options={listFather}
                size="small"
                sx={{ marginBottom: 1 }}
                onChange={(e, v) => {
                  handleChange("mother", undefined);
                  handleChange("father", v?.parentId);
                  setListMother([]);
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
                noOptionsText="Silahkan pilih nama ayah"
              />
            </Grid>
            <Grid item xs={5}>
              <Autocomplete
                disabled={listMother.length === 0}
                id="mother"
                options={listMother}
                size="small"
                sx={{ marginBottom: 1 }}
                onChange={(e, v) => handleChange("mother", v?.parentId)}
                isOptionEqualToValue={(option, value) =>
                  option.label === value.label
                }
                filterSelectedOptions
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.label}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Nama Ibu" />
                )}
                noOptionsText="Silahkan pilih nama ibu"
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton onClick={getMotherData}>
                <Refresh />
              </IconButton>
            </Grid>
          </Grid>
          <Typography component="h1" variant="subtitle1" marginBottom={1}>
            Data Pribadi
          </Typography>
          {selectedValues.person.map((field, index) => (
            <Grid container spacing={2} key={index} sx={{ marginBottom: 1 }}>
              <Grid item xs={6}>
                <TextField
                  required
                  id="name"
                  label="Nama"
                  size="small"
                  // sx={{ width: "50ch" }}
                  fullWidth
                  // onChange={(e) => handleChange("name", e.target.value)}
                  value={selectedValues.person[index].name}
                  onChange={(e) => {
                    const updatedFields = [...selectedValues.person];
                    updatedFields[index].name = e.target.value;
                    handleChange("person", updatedFields);
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label">
                    Jenis Kelamin
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="gender"
                    value={selectedValues.person[index].gender}
                    onChange={(e) => {
                      const updatedFields = [...selectedValues.person];
                      updatedFields[index].gender = e.target.value;
                      handleChange("gender", updatedFields);
                    }}
                  >
                    <MenuItem value="male">Laki - Laki</MenuItem>
                    <MenuItem value="female">Perempuan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => handleRemovePerson(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button variant="contained" onClick={handleAddPerson} sx={{ mt: 2 }}>
            TAMBAH DATA
          </Button>
          <Box marginTop={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {/* {onProgress ? <CircularProgress color="inherit" /> : "SIMPAN"} */}
              SIMPAN
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
