import React, { useCallback, useState } from "react";
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
import FamilyData, { Node } from "../../types/family.type";
import { v4 as uuidv4 } from "uuid";
import { Alert } from "@mui/material";

interface AddFamilyProps {
  onAdd: string | undefined;
}

interface FormSubmit {
  parent: string | undefined;
  name: string;
  gender: string;
  relationType: string;
}

interface AlertType {
  message: string;
}

export const AddFamily = ({ ...props }: AddFamilyProps) => {
  const [selectedValues, setSelectedValues] = React.useState<FormSubmit>({
    parent: props.onAdd,
    name: "",
    gender: "male",
    relationType: "spouse",
  });
  const [alert, setAlert] = useState<AlertType | undefined>();

  const handleChange = (group: string, value: string) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };

  // const closeHandler = useCallback(() => props.onAdd(undefined), [props]);
  const closeHandler = () => {};

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Access selected values for group1 and group2 in selectedValues object
    const { parent, name, gender, relationType } = selectedValues;

    // validate data
    if (await validateData(selectedValues)) {
      // Perform your submit logic here
      if (relationType === "children") {
        //get data husband in parent (wife)
        const spouseOfParentId = await FamilyDataService.getById(parent).then(
          (data) => {
            return data.spouses[0].id;
          }
        );
        // gabungkan id suami dan istri untuk data parent
        const parents = [spouseOfParentId, parent];

        submitChildrenData(name, gender, parents);
      } else if (relationType === "spouse") {
        // submitSpouseData(name, gender, parent);
      }

      setSelectedValues({
        parent: props.onAdd,
        name: "",
        gender: "male",
        relationType: "spouse",
      });
    }
  };

  // function untuk tambah data anak
  const submitChildrenData = async (
    name: string,
    gender: string,
    parentId: Array<string>
  ) => {
    const parents = parentId.map((data) => {
      return {
        id: data,
        type: "blood",
      };
    });

    const newData: FamilyData = {
      id: uuidv4(),
      name: name,
      gender: gender,
      parents,
      children: [],
      siblings: [],
      spouses: [],
    };

    FamilyDataService.create(newData);

    // const allData = await FamilyDataService.getAll().then((data) => {
    //   return data;
    // });

    // Find index array of parent data
    // const indexOfRelation = allData.findIndex(
    //   (data: any) => data.id === parentId
    // );
    // const parentData = allData.filter((data: any) => data.id === parentId);
    // const mappingData = FamilyDataService.mappingData(parentData)[0];
    // mappingData.children = [
    //   ...mappingData.children,
    //   {
    //     id: newData.id,
    //     type: "blood",
    //   },
    // ];

    parentId.forEach(async (parent) => {
      const getDataParent = await FamilyDataService.getById(parent);
      getDataParent.children = [
        ...getDataParent.children,
        {
          id: newData.id,
          type: "blood",
        },
      ];

      const indexData = await FamilyDataService.getIndexById(parent);
      FamilyDataService.update({ ...getDataParent }, indexData);
    });

    // // Add children data in parents data
    // FamilyDataService.update({ ...mappingData }, indexOfRelation);
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
    FamilyDataService.update({ ...mappingData }, indexOfRelation);
  };

  const validateData = async (value: FormSubmit) => {
    const { name, gender, parent, relationType } = value;
    // nama, gender, parent, relationType wajib diisi
    let statusValidation = true;
    if (!name) {
      setAlert({ message: "Nama wajib diisi!" });
      return (statusValidation = false);
    } else if (!gender) {
      setAlert({ message: "Jenis kelamin wajib diisi!" });
      return (statusValidation = false);
    } else if (!parent) {
      setAlert({ message: "Relasi wajib diisi!" });
      return (statusValidation = false);
    } else if (!relationType) {
      setAlert({ message: "Hubungan wajib diisi!" });
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
        });
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
          <Alert
            severity="error"
            onClose={() => {
              setAlert(undefined);
            }}
          >
            {alert.message}
          </Alert>
        )}
        <header className={css.header}>
          <h2 className={css.title}> Tambah Keluarga </h2>
          <button className={css.close} onClick={closeHandler}>
            &#10005;
          </button>
        </header>
        <TextField
          required
          id="outlined-required"
          label="Nama"
          size="small"
          sx={{ width: "50ch" }}
          onChange={(e) => handleChange("name", e.target.value)}
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          // onClick={handleSubmit}
        >
          SIMPAN
        </Button>
      </Stack>
    </Box>
  );
};
