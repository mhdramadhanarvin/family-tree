import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
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
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/joy/CircularProgress";
import { useEffect, useState } from "react";
import { GridCloseIcon } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import FamilyDataService from "../../services/FamilyDataService";
import { Refresh } from "@mui/icons-material";
import { AlertType } from "../../types/family.type";
import { v4 as uuidv4 } from "uuid";
import { RelType } from "relatives-tree/lib/types";

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
  const [onLoad, setOnLoad] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertType | undefined>();
  const [onProgress, setOnProgress] = useState<boolean>(false);
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

  useEffect(() => {
    if (showForm) {
      if (selectedValues.father === undefined) {
        handleChange("mother", undefined);
        setListMother([]);
      }
      if (selectedValues.father === "") {
        getFatherData(true);
      }
    }
  }, [
    // listFather,
    // listMother,
    selectedValues.father,
    selectedValues.mother,
    showForm,
  ]);

  const refreshData = () => {
    setOnLoad(true);
    if (selectedValues.father === undefined || selectedValues.father === "")
      getFatherData();
    getMotherData();
  };

  const getMotherData = () => {
    if (selectedValues.father) {
      setListMother([]);
      familyDataService
        .getSpouseByHusbandId(selectedValues.father)
        .then((data) => {
          handleChange("mother", undefined);
          setListMother(data);
          setOnLoad(false);
          console.log("GET MOTHER");
        })
        .catch((e: Error) => {
          console.log(e);
        });
    }
  };

  const getFatherData = (byPassOnload = false) => {
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
        if (!byPassOnload) setOnLoad(false);
        setListFather(mapData);
        console.log("GET FATHER");
      })
      .catch((e: Error) => {
        console.log("Error", e);
      });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOnProgress(true);
    const { father, mother, person } = selectedValues;

    if (validateData(selectedValues)) {
      const parents = [
        {
          id: father,
          type: RelType.blood,
        },
        {
          id: mother,
          type: RelType.blood,
        },
      ];

      const newData = person.map((data) => {
        return {
          id: uuidv4(),
          name: data.name,
          gender: data.gender,
          parents,
        };
      });

      let getAllData = await familyDataService.getAll();
      getAllData = getAllData.concat(newData);

      const childrenData = newData.map((data) => {
        return {
          id: data.id,
          type: RelType.blood,
        };
      });
      // ADD CHILDREN FOR FATHER
      const getFatherData = await familyDataService.getById(father);
      getFatherData.children = getFatherData.children.concat(childrenData);
      const indexFather = await familyDataService.getIndexById(father);
      getAllData[indexFather] = getFatherData;

      // ADD CHILDREN FOR MOTHER
      const getMotherData = await familyDataService.getById(mother);
      getMotherData.children = getMotherData.children.concat(childrenData);
      const indexMother = await familyDataService.getIndexById(mother);
      getAllData[indexMother] = getMotherData;
      
      familyDataService
        .update(getAllData)
        .then(() => {
          setAlert({
            message: "Berhasil menambahkan keluarga!",
            type: "success",
          });
          setOnProgress(false);
          setSelectedValues({
            father: "",
            mother: "",
            person: [
              {
                name: "",
                gender: "male",
              },
            ],
          });
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

  const validateData = (data: FormSubmit) => {
    const { father, mother, person } = data;
    let statusValidation = true;

    if (father === "" || father === undefined) {
      setAlert({
        message: "Pilih nama ayah terlebih dahulu!",
        type: "error",
      });
      setOnProgress(false);
      return (statusValidation = false);
    } else if (mother === "" || mother === undefined) {
      setAlert({
        message: "Pilih nama ibu terlebih dahulu!",
        type: "error",
      });
      setOnProgress(false);
      return (statusValidation = false);
    } else if (person.length === 0) {
      setAlert({
        message: "Tambah data anak terlebih dahulu!",
        type: "error",
      });
      setOnProgress(false);
      return (statusValidation = false);
    }

    return statusValidation;
  };

  const closeHandler = () => {
    setSelectedValues({
      father: "",
      mother: "",
      person: [
        {
          name: "",
          gender: "male",
        },
      ],
    });
    setShowForm(false)
  }

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
        onClose={closeHandler}
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
            width: "100%",
            "@media (min-width: 780px)": {
              width: "70%",
            },
            backgroundColor: "white",
            padding: 3,
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
            onClick={closeHandler}
          >
            <GridCloseIcon fontSize="inherit" />
          </IconButton>
          {alert && (
            <Snackbar
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={alert ? true : false}
              autoHideDuration={6000}
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
              <IconButton onClick={refreshData}>
                {onLoad ? <CircularProgress size="sm" /> : <Refresh />}
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
            TAMBAH DATA ANAK
          </Button>
          <Box marginTop={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {onProgress ? <CircularProgress size="sm" /> : "SIMPAN"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
