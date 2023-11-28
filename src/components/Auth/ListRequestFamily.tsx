import {
  Box,
  IconButton,
  Typography,
  Modal,
  Chip,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import FamilyDataService from "../../services/FamilyDataService";
import { AlertType } from "../../types/family.type";
import { Check, Refresh } from "@mui/icons-material";

interface ListRequestUsersProps {
  onShow: boolean;
  setShow: (open: boolean) => void;
}

const familyDataService = new FamilyDataService();

export const ListRequestUsers = ({ ...props }: ListRequestUsersProps) => {
  const [alert, setAlert] = useState<AlertType | undefined>(undefined);
  const [rowData, setRowData] = useState<readonly any[]>([
    {
      id: 1,
      parent_id: "123",
      parent_name: "John",
      relation_type: "spouse",
      data: {},
      status: 1,
    },
  ]);

  const approveRequest = async (requestId: string) => {
    familyDataService
      .approvedUser(requestId)
      .then(() => {
        fetchData();
        setAlert({
          message: "Permintaan berhasil disetujui",
          type: "success",
        });
      })
      .catch((e: Error) => {
        fetchData();
        setAlert({
          message: e.message,
          type: "error",
        });
      });
  };

  const rejectRequest = (requestId: string) => {
    familyDataService
      .rejectedUser(requestId)
      .then(() => {
        fetchData();
        setAlert({
          message: "Permintaan berhasil ditolak",
          type: "success",
        });
      })
      .catch((e: Error) => {
        fetchData();
        setAlert({
          message: e.message,
          type: "error",
        });
      });
  };

  const fetchData = () => {
    familyDataService
      .getListRequestUsers()
      .then((data: any) => {
        setRowData(data);
      })
      .catch((e: Error) => {
        console.log(e.message);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nama",
      width: 200,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "fatherName",
      headerName: "Nama Ayah",
      width: 270,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "motherName",
      headerName: "Nama Ibu",
      width: 270,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: ({ row }) =>
        row.status === 1 ? (
          <Chip label="PENDING" color="warning" />
        ) : row.status === 2 ? (
          <Chip label="DISETUJUI" color="success" />
        ) : (
          <Chip label="DITOLAK" color="error" />
        ),
      headerAlign: "center",
      align: "center",
    },
    {
      field: "action",
      headerName: "Aksi",
      width: 100,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <>
            <IconButton
              aria-label="setujui"
              disabled={row.status !== 1}
              onClick={() => {
                approveRequest(row.id);
              }}
            >
              <Check />
            </IconButton>
            <IconButton
              aria-label="tolak"
              disabled={row.status !== 1}
              onClick={() => {
                rejectRequest(row.id);
              }}
            >
              <CloseIcon />
            </IconButton>
          </>
        );
      },
      headerAlign: "center",
      align: "center",
    },
  ];

  const closeHandler = useCallback(() => {
    props.setShow(false);
  }, [props]);

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
            width: "100%",
            "@media (min-width: 780px)": {
              width: "50%",
            },
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
            Daftar Permintaan Penambahan Keluarga
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={fetchData}
            sx={{ marginBottom: "20px" }}
          >
            <Refresh />
            REFRESH DATA
          </Button>
          <Box>
            <DataGrid
              rows={rowData}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};
