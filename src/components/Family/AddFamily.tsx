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
import FamilyData from "../../types/family.type";
import { v4 as uuidv4 } from "uuid";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { RelType } from "relatives-tree/lib/types";
import Checkbox from "@mui/material/Checkbox";

interface AddFamilyProps {
  onAdd: string | undefined;
  onShow: (open: boolean) => void;
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
}

interface AlertType {
  message: string;
  type: "error" | "warning" | "info" | "success";
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
  });
  const [alert, setAlert] = useState<AlertType | undefined>();
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const handleChange = (group: string, value: any) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };

  const closeHandler = useCallback(() => props.onShow(false), [props]);
  const [selectedImage, setSelectedImage] = useState<File | undefined>(
    undefined
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [toggleImage, setToggleImage] = useState<boolean>(false);

  useEffect(() => {
    if (selectedImage) {
      setImageUrl(URL.createObjectURL(selectedImage));
      handleChange("photo", selectedImage);
    }
  }, [selectedImage]);

  const [onProgress, setOnProgress] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    } = selectedValues;

    // validate data

    setOnProgress(true);

    if (await validateData(selectedValues)) {
      // Perform your submit logic here
      if (relationType === "children") {
        //get data husband in parent (wife)
        const spouseOfParentId = await FamilyDataService.getById(parent).then(
          (data) => {
            return data.spouses.length > 0 ? [data.spouses[0].id] : [];
          }
        );
        // gabungkan id suami dan istri untuk data parent
        const parents: string[] = [parent].concat(spouseOfParentId);

        submitChildrenData(
          { name, gender, birthday, address, job, photo },
          parents
        );
      } else if (relationType === "spouse") {
        // get data anak dari pasangan
        const childrenOfSpouseId = await FamilyDataService.getById(parent).then(
          (data) => {
            return data.children.length > 0 ? [data.children[0].id] : [];
          }
        );
        // gabungkan id semua anak untuk pasangan baru
        const childrens: string[] = [parent].concat(childrenOfSpouseId);
        console.log(childrens);
        // submitSpouseData(name, gender, parent);
      }
    }
  };

  // function untuk tambah data anak
  const submitChildrenData = async (baseData: any, parentId: string[]) => {
    const { name, gender, birthday, address, job, photo } = baseData;
    const parents = parentId.map((data: any) => {
      return {
        id: data,
        type: "blood",
      };
    });

    const uploadPhoto =
      photo !== null ? await FamilyDataService.uploadImage(photo) : null;

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
    };

    const getAllData = await FamilyDataService.getAll();
    const lengthData = await FamilyDataService.getLengthData();

    getAllData[lengthData] = newData;

    await Promise.all(
      parentId.map(async (parent) => {
        const getDataParent = await FamilyDataService.getById(parent);
        getDataParent.children = [
          ...getDataParent.children,
          {
            id: newData.id,
            type: RelType.blood,
          },
        ];

        const indexData = await FamilyDataService.getIndexById(parent);
        getAllData[indexData] = await getDataParent;
        return getAllData;
      })
    );

    // // Add data in children and parents updated
    await FamilyDataService.update(getAllData);

    setAlert({
      message: "Berhasil menambahkan keluarga!",
      type: "success",
    });
    setShowAlert(true);
    setOnProgress(false);
  };

  // function untuk tambah data pasangan baru
  const submitSpouseData = async (
    name: string,
    gender: string,
    parentId: string
  ) => {
    const newData: FamilyData = {
      id: uuidv4(),
      name: name,
      gender: gender,
      parents: [],
      children: [],
      siblings: [],
      spouses: [
        {
          id: parentId,
          type: "married",
        },
      ],
    };

    FamilyDataService.create(newData)
      .then((data) => console.log(data))
      .catch((e: Error) => console.log(e));

    const allData = await FamilyDataService.getAll().then((data) => {
      return data;
    });

    const indexOfRelation = allData.findIndex(
      (data: any) => data.id === parentId
    );
    const parentData = allData.filter((data: any) => data.id === parentId);
    const mappingData = FamilyDataService.mappingData(parentData)[0];
    mappingData.spouses = [
      ...mappingData.spouses,
      {
        id: newData.id,
        type: "married",
      },
    ];

    //// Add children data in parents data
    // FamilyDataService.update({ ...mappingData }, indexOfRelation);
  };

  const validateData = async (value: FormSubmit) => {
    const { name, gender, parent, relationType } = value;
    // nama, gender, parent, relationType wajib diisi
    let statusValidation = true;
    if (!name) {
      setAlert({ message: "Nama wajib diisi!", type: "error" });
      setShowAlert(true);
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

    // cek kalau dia laki-laki dan punya pasangan harus tambahkan dari pasangan perempuan
    await FamilyDataService.getById(parent).then((parentData: any) => {
      if (
        parentData.spouses.length > 0 &&
        parentData.gender === "male" &&
        relationType === "children"
      ) {
        setAlert({
          message: "Silahkan tambahkan keluarga pada jalur pasangan perempuan!",
          type: "error",
        });
        setOnProgress(false);
        return (statusValidation = false);
      }
    });

    return statusValidation;
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className={css.root}
      noValidate
      autoComplete="off"
    >
      <Stack spacing={2}>
        {alert && (
          <Snackbar
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={showAlert}
            autoHideDuration={6000}
            onClose={() => setShowAlert(false)}
          >
            <Alert
              onClose={() => setShowAlert(false)}
              severity={alert.type}
              sx={{ width: "100%" }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        )}
        <header className={css.header}>
          <h2 className={css.title} onClick={() => setShowAlert(true)}>
            {" "}
            Tambah Keluarga{" "}
          </h2>
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
          required
          id="address"
          label="Alamat"
          size="small"
          sx={{ width: "50ch" }}
          onChange={(e) => handleChange("address", e.target.value)}
        />
        <TextField
          required
          id="job"
          label="Pekerjaan"
          size="small"
          sx={{ width: "50ch" }}
          onChange={(e) => handleChange("job", e.target.value)}
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
        <Checkbox
          checked={toggleImage}
          onChange={(e) => setToggleImage(e.target.checked)}
          sx={{
            width: 10,
          }}
        />
        {toggleImage ? "Sembunyikan" : "Tampilkan"} Gambar
        {imageUrl && toggleImage && (
          <Box mt={2} textAlign="left">
            <div>Image Preview:</div>
            <img src={imageUrl} alt={imageUrl} height="300px" />
          </Box>
        )}
        <Button type="submit" variant="contained" color="primary">
          {onProgress ? <CircularProgress color="inherit" /> : "SIMPAN"}
        </Button>
      </Stack>
    </Box>
  );
});
