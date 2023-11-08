import { CircularProgress } from "@mui/joy";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import css from "./AddFamily.module.css";
import { useCallback, useEffect, useState } from "react";
import { AlertType } from "../../types/family.type";
import FamilyDataService from "../../services/FamilyDataService";

const familyDataService = new FamilyDataService();

interface EditFamilyProps {
  onEdit: string;
  onShow: (show: string | undefined) => void;
  onRefresh: (setRefresh: boolean) => void;
}

interface FormSubmit {
  editId: string;
  name: string;
  gender: string;
  birthday: string;
  address: string;
  job: string | null;
  photo: any;
  description: string;
}

export const EditFamily = ({ ...props }: EditFamilyProps) => {
  const [alert, setAlert] = useState<AlertType | undefined>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [toggleImage, setToggleImage] = useState<boolean>(false);
  const [onProgress, setOnProgress] = useState<boolean>(false);
  const closeHandler = useCallback(() => props.onShow(undefined), [props]);
  const handleChange = (group: string, value: any) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };
  const [selectedValues, setSelectedValues] = useState<FormSubmit>({
    editId: props.onEdit,
    name: "",
    gender: "male",
    birthday: "",
    address: "",
    job: "",
    photo: null,
    description: "",
  });
  useEffect(() => {
    fetchData();
    // if (selectedImage) {
    //   setImageUrl(URL.createObjectURL(selectedImage));
    //   handleChange("photo", selectedImage);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = () => {
    console.log("FETCH DATA EDIT");
    familyDataService
      .getById(props.onEdit)
      .then((data) => {
        handleChange("name", data.name);
        handleChange("gender", data.gender);
        handleChange("birthday", data.birthday);
        handleChange("address", data.address);
        handleChange("job", data.job);
        handleChange("description", data.description);
        if (data.photo) {
          previewImage(data.photo);
        }
      })
      .catch((e: Error) => {
        console.log(e);
      });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOnProgress(true);

    if (await validateData(selectedValues)) {
      const getAll = await familyDataService.getAll();
      const getById = await familyDataService.getById(selectedValues.editId);
      const getIndex = await familyDataService.getIndexById(
        selectedValues.editId
      );

      if (selectedValues.photo) {
        const uploadedPhoto = await familyDataService.uploadImage(
          selectedValues.photo
        );
        selectedValues.photo = uploadedPhoto;
      }

      const mergedData = {
        ...getById,
        ...selectedValues,
      };

      getAll[getIndex] = mergedData;

      await familyDataService.update(getAll);

      setAlert({
        message: "Berhasil mengubah data!",
        type: "success",
      });

      setTimeout(() => {
        props.onRefresh(true);
        props.onShow(undefined);
      }, 2000);
    }
  };

  const validateData = async (value: FormSubmit) => {
    const { name, gender } = value;
    // nama, gender, parent, relationType wajib diisi
    let statusValidation = true;
    if (!name) {
      setAlert({ message: "Nama wajib diisi!", type: "error" });
      setOnProgress(false);
      return (statusValidation = false);
    } else if (!gender) {
      setAlert({ message: "Jenis kelamin wajib diisi!", type: "error" });
      setOnProgress(false);
      return (statusValidation = false);
    }

    return statusValidation;
  };

  const previewImage = (image: any, uploaded = false) => {
    if (image) {
      if (uploaded) {
        handleChange("photo", image);
      }
      const prepareImage = uploaded ? URL.createObjectURL(image) : image;
      setImageUrl(prepareImage);
      setToggleImage(true);
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
      <Box
        component="form"
        onSubmit={handleSubmit}
        className={css.root}
        noValidate
        autoComplete="off"
        sx={{
          zIndex: 3,
        }}
      >
        <Stack spacing={2}>
          <header className={css.header}>
            <h2 className={css.title}> Ubah Data </h2>
            <button className={css.close} onClick={closeHandler}>
              &#10005;
            </button>
          </header>
          <TextField
            required
            id="name"
            label="Nama"
            size="small"
            sx={{ width: "50ch" }}
            value={selectedValues.name}
            autoFocus
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextField
            id="address"
            label="Alamat"
            size="small"
            sx={{ width: "50ch" }}
            value={selectedValues.address}
            autoFocus={selectedValues.address !== ""}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <TextField
            id="job"
            label="Pekerjaan"
            size="small"
            sx={{ width: "50ch" }}
            value={selectedValues.job}
            autoFocus={selectedValues.job !== ""}
            onChange={(e) => handleChange("job", e.target.value)}
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Deskripsi"
            multiline
            sx={{ width: "50ch" }}
            maxRows={5}
            value={selectedValues.description}
            autoFocus={selectedValues.description !== ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <FormControl>
            <FormLabel id="gender">Jenis Kelamin</FormLabel>
            <RadioGroup
              aria-labelledby="gender"
              name="gender"
              value={selectedValues.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <FormControlLabel
                value="male"
                control={<Radio size="small" />}
                label="Laki-laki"
              />
              <FormControlLabel
                value="female"
                control={<Radio size="small" />}
                label="Perempuan"
              />
            </RadioGroup>
          </FormControl>
          {/* <FormControl>
            <FormLabel id="relationType">Hubungan</FormLabel>
            <RadioGroup
              aria-labelledby="relationType"
              name="relationType"
              value={selectedValues.relationType}
              onChange={(e) => handleChange("relationType", e.target.value)}
            >
              <FormControlLabel
                value="spouse"
                control={<Radio size="small" />}
                label="Suami/Istri"
              />
              <FormControlLabel
                value="children"
                control={<Radio size="small" />}
                label="Anak"
              />
            </RadioGroup>
          </FormControl> */}
          <input
            accept="image/*"
            type="file"
            id="select-image"
            style={{ display: "none" }}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              // setSelectedImage((e.target as HTMLInputElement)?.files?.[0]);
              const file = e.target as HTMLInputElement;
              if (file) {
                // setImageUrl(URL.createObjectURL((e.target as HTMLInputElement).files.[0]) || null);
                // handleChange("photo", selectedImage);
                previewImage(file?.files?.[0], true);
              }
              setToggleImage(true);
            }}
          />
          <label htmlFor="select-image">
            <Button variant="contained" color="primary" component="span">
              Upload Foto
            </Button>
          </label>
          <FormControlLabel
            value="end"
            control={
              <Checkbox
                checked={toggleImage}
                onChange={(e) => setToggleImage(e.target.checked)}
                sx={{
                  width: 10,
                }}
              />
            }
            label={toggleImage ? "Sembunyikan Gambar" : "Tampilkan Gambar"}
            labelPlacement="end"
          />
          {imageUrl && toggleImage && (
            <Box mt={2} textAlign="left">
              <div>Image Preview:</div>
              <img src={imageUrl} alt={imageUrl} height="300px" />
            </Box>
          )}
          <Button type="submit" variant="contained" color="primary">
            {onProgress ? <CircularProgress size="sm" /> : "SIMPAN"}
          </Button>
        </Stack>
      </Box>
    </>
  );
};
