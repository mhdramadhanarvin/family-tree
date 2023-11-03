import React, { memo, useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import css from "./AddFamily.module.css";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import FamilyDataService from "../../services/FamilyDataService";
import { v4 as uuidv4 } from "uuid";
import { Alert, Snackbar } from "@mui/material";
import CircularProgress from "@mui/joy/CircularProgress";
import { RelType } from "relatives-tree/lib/types";
import Checkbox from "@mui/material/Checkbox";
import { AlertType } from "../../types/family.type";

const familyDataService = new FamilyDataService();

interface AddFamilyProps {
  onAdd: string | undefined;
  onShow: (open: boolean) => void;
  onRefresh: (setRefresh: boolean) => void;
}

interface FormSubmit {
  parent: any;
  name: string;
  gender: string;
  relationType: string;
  birthday: string;
  address: string;
  job: string | null;
  photo: any;
  description: string;
}

export const AddFamily = memo(function AddFamily({ ...props }: AddFamilyProps) {
  const [selectedValues, setSelectedValues] = React.useState<FormSubmit>({
    parent: props.onAdd,
    name: "",
    gender: "male",
    relationType: "spouse",
    birthday: "",
    address: "",
    job: "",
    photo: null,
    description: "",
  });
  const [alert, setAlert] = useState<AlertType | undefined>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [toggleImage, setToggleImage] = useState<boolean>(false);
  const [onProgress, setOnProgress] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | undefined>(
    undefined
  );
  const closeHandler = useCallback(() => props.onShow(false), [props]);
  const handleChange = (group: string, value: any) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };
  useEffect(() => {
    if (selectedImage) {
      setImageUrl(URL.createObjectURL(selectedImage));
      handleChange("photo", selectedImage);
    }
  }, [selectedImage]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOnProgress(true);

    // Access selected values for group1 and group2 in selectedValues object
    const {
      parent,
      name,
      gender,
      birthday,
      address,
      job,
      photo,
      relationType,
      description,
    } = selectedValues;

    // validate data
    if (await validateData(selectedValues)) {
      // Perform your submit logic here
      if (relationType === "children") {
        //get data husband in parent (wife)
        const spouseOfParentId = await familyDataService
          .getById(parent)
          .then((data) => {
            return data.spouses.length > 0 ? [data.spouses[0].id] : [];
          });
        // gabungkan id suami dan istri untuk data parent
        const parents: string[] = [parent].concat(spouseOfParentId);
        submitChildrenData(
          { name, gender, birthday, address, job, photo, description },
          parents
        );
      } else if (relationType === "spouse") {
        // get data anak dari pasangan
        const childrenOfSpouseId = await familyDataService
          .getById(parent)
          .then((data) => {
            // kalau dia punya anak dan belum punya pasangan
            // ambil data anaknya
            // untuk dimasukkan ke pasangan baru
            return data.children.length > 0 && data.spouses.length < 1
              ? [data.children[0].id]
              : [];
          });
        // gabungkan id semua anak untuk pasangan baru
        submitSpouseData(
          { name, gender, birthday, address, job, photo, description },
          parent,
          childrenOfSpouseId
        );
      }
    }
  };

  // function untuk tambah data anak
  const submitChildrenData = async (baseData: any, parentId: string[]) => {
    const { name, gender, birthday, address, job, photo, description } =
      baseData;
    const parents = parentId.map((data: any) => {
      return {
        id: data,
        type: "blood",
      };
    });

    const uploadPhoto =
      photo !== null ? await familyDataService.uploadImage(photo) : null;

    const newData: any = {
      id: uuidv4(),
      name,
      gender,
      parents,
      birthday,
      address,
      job,
      photo: uploadPhoto,
      children: [],
      siblings: [],
      spouses: [],
      description,
    };

    const getAllData = await familyDataService.getAll();
    const lengthData = await familyDataService.getLengthData();

    getAllData[lengthData] = newData;

    await Promise.all(
      parentId.map(async (parent) => {
        const getDataParent = await familyDataService.getById(parent);
        getDataParent.children = [
          ...getDataParent.children,
          {
            id: newData.id,
            type: RelType.blood,
          },
        ];

        const indexData = await familyDataService.getIndexById(parent);
        getAllData[indexData] = await getDataParent;
        return getAllData;
      })
    );

    // Add data in children and parents updated
    familyDataService
      .update(getAllData)
      .then((data) => {
        setAlert({
          message: "Berhasil menambahkan keluarga!",
          type: "success",
        });
        props.onRefresh(true);
      })
      .catch((e: Error) => {
        setAlert({
          message: e.message,
          type: "error",
        });
      });

    setOnProgress(false);
    setTimeout(() => {
      closeHandler();
    }, 2000);
  };

  // function untuk tambah data pasangan baru
  const submitSpouseData = async (
    baseData: any,
    parentId: string,
    childrenId: string[]
  ) => {
    const { name, gender, birthday, address, job, photo, description } =
      baseData;

    // siapkan structuk data anak untuk si pasangan baru
    const children = childrenId.map((data: any) => {
      return {
        id: data,
        type: "blood",
      };
    });

    const uploadPhoto =
      photo !== null ? await familyDataService.uploadImage(photo) : null;

    const newData: any = {
      id: uuidv4(),
      name,
      gender,
      parents: [],
      birthday,
      address,
      job,
      photo: uploadPhoto,
      children,
      siblings: [],
      spouses: [
        {
          id: parentId,
          type: "married",
        },
      ],
      description,
    };

    const getAllData = await familyDataService.getAll();
    const lengthData = await familyDataService.getLengthData();

    // masukkan data pasangan baru dan anaknya
    getAllData[lengthData] = newData;

    // tambahkan data pasangan baru sebagai pasangan di parent data
    const getDataParent = await familyDataService.getById(parentId);
    getDataParent.spouses = [
      ...getDataParent.spouses,
      {
        id: newData.id,
        type: RelType.married,
      },
    ];
    const indexData = await familyDataService.getIndexById(parentId);
    getAllData[indexData] = await getDataParent;

    // simpan semua struktur
    familyDataService
      .update(getAllData)
      .then((data) => {
        setAlert({
          message: "Berhasil menambahkan keluarga!",
          type: "success",
        });
        props.onRefresh(true);
      })
      .catch((e: Error) => {
        setAlert({
          message: e.message,
          type: "error",
        });
      });

    setOnProgress(false);
    setTimeout(() => {
      closeHandler();
    }, 2000);
  };

  const validateData = async (value: FormSubmit) => {
    const { name, gender, parent, relationType } = value;
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
    } else if (!parent) {
      setAlert({ message: "Relasi wajib diisi!", type: "error" });
      setOnProgress(false);
      return (statusValidation = false);
    } else if (!relationType) {
      setAlert({ message: "Hubungan wajib diisi!", type: "error" });
      setOnProgress(false);
      return (statusValidation = false);
    }

    return statusValidation;
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
            <h2 className={css.title}> Tambah Keluarga </h2>
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
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextField
            id="address"
            label="Alamat"
            size="small"
            sx={{ width: "50ch" }}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <TextField
            id="job"
            label="Pekerjaan"
            size="small"
            sx={{ width: "50ch" }}
            onChange={(e) => handleChange("job", e.target.value)}
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Deskripsi"
            multiline
            sx={{ width: "50ch" }}
            maxRows={5}
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
          <FormControl>
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
          </FormControl>
          <input
            accept="image/*"
            type="file"
            id="select-image"
            style={{ display: "none" }}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              setSelectedImage((e.target as HTMLInputElement)?.files?.[0]);
              setToggleImage(true);
            }}
          />
          <label htmlFor="select-image">
            <Button variant="contained" color="primary" component="span">
              Upload Foto
            </Button>
          </label>
          {/* {toggleImage ? "Sembunyikan" : "Tampilkan"} Gambar */}
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
});
