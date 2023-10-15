import React, { useCallback } from "react";
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
import { Gender, RelType } from "relatives-tree/lib/types";

interface AddFamilyProps {
  onAdd: string;
}

export const AddFamily = ({ ...props }: AddFamilyProps) => {
  // const [formData, setFormData] = React.useState<UserData>({
  //   parent: "",
  //   name: "",
  //   type: "",
  // });

  // function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
  //   const { name, value } = event.target;
  //   setFormData({ ...formData, [name]: value });
  // }

  // function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  //   event.preventDefault(); 
  //   // onSubmit(formData);
  // }

  // const getType = (): void => {};

  const [selectedValues, setSelectedValues] = React.useState({
    parent: props.onAdd,
    name: "",
    gender: "male",
    relationType: "spouse",
  });

  const handleChange = (group: string, value: string) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [group]: value,
    }));
  };

  // const closeHandler = useCallback(() => props.onAdd(undefined), [props]);
  const closeHandler = () => {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parents,
      children,
      siblings,
      spouse = [];
    // Access selected values for group1 and group2 in selectedValues object
    // const { name, gender, relationType } = selectedValues;

    // Perform your submit logic here
    // event.preventDefault();
    // if ( selectedValues.relationType === "children") {

    // } 
    // FamilyDataService.create({
    //   id: "123",
    //   name: selectedValues.name,
    //   gender: selectedValues.gender,
    //   parents: [
    //     {
    //       id: selectedValues.parent,
    //       type: "blood",
    //     },
    //   ],
    //   children: [],
    //   siblings: [],
    //   spouses: [],
    // })
    //   .then(() => {
    //     console.log("Created new item successfully!");
    //     // this.setState({
    //     //   submitted: true,
    //     // });
    //   })
    //   .catch((e: Error) => {
    //     console.log(e);
    //   });
    // const familyDataService = FamilyDataService
    // FamilyDataService.getAll().then((result: any) => {
    //   const finalRes = FamilyDataService.mappingData(result) 
    // });
  };

  return (
    <Box component="form" className={css.root} noValidate autoComplete="off">
      {/* <form onSubmit={handleSubmit}> */}
      <Stack spacing={2}>
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
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Stack>
      {/* </form> */}
    </Box>
  );
};
