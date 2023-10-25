import { Box, IconButton, Typography, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useEffect } from "react";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import FamilyDataService from "../../services/FamilyDataService";

interface ListUsersProps {
  onShow: boolean;
  setShow: (open: boolean) => void;
}

export const ListUsers = ({ ...props }: ListUsersProps) => {
  useEffect(() => {
    FamilyDataService.getAllUser()
      .then(({ users }) => {
        console.log(users);
      })
      .catch((e: Error) => {
        console.log(e.message);
      });
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "First name", width: 130 },
    { field: "lastName", headerName: "Last name", width: 130 },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      width: 90,
    },
    {
      field: "fullName",
      headerName: "Full name",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 160,
      valueGetter: (params: GridValueGetterParams) =>
        `${params.row.firstName || ""} ${params.row.lastName || ""}`,
    },
  ];

  const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
    { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
    { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
    { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
    { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
    { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
    { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
    { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  ];

  const closeHandler = useCallback(() => {
    props.setShow(false);
    // setSelectedValues({ email: "", password: "" });
    // setOnProgress(false);
    // setAlert(undefined);
  }, [props]);

  // const [selectedValues, setSelectedValues] = useState<AuthType>({
  //   email: "",
  //   password: "",
  // });
  // const [alert, setAlert] = useState<AlertType | undefined>();
  // const [onProgress, setOnProgress] = useState<boolean>(false);

  // const handleChange = (group: string, value: any) => {
  //   setSelectedValues((prevSelectedValues) => ({
  //     ...prevSelectedValues,
  //     [group]: value,
  //   }));
  // };

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setOnProgress(true);
  // };

  return (
    <>
      <Modal
        open={props.onShow}
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
            height: "70%",
            width: "50%",
            backgroundColor: "white",
            padding: 5,
            paddingBottom: 10,
          }}
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
            <CloseIcon fontSize="inherit" />
          </IconButton>
          <Typography
            component="h1"
            variant="h5"
            sx={{
              marginBottom: 2,
            }}
          >
            Buat Akun
          </Typography>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
          />
        </Box>
      </Modal>
    </>
  );
};
