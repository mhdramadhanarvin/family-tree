import { Box, IconButton, Typography, Modal, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useEffect, useState } from "react";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import FamilyDataService from "../../services/FamilyDataService";
import { TemporaryFamilyType } from "../../types/family.type";
import { Check, Visibility } from "@mui/icons-material";

interface ListRequestFamilyProps {
  onShow: boolean;
  setShow: (open: boolean) => void;
  onView: (parentId: string) => void
}

export const ListRequestFamily = ({ ...props }: ListRequestFamilyProps) => {
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

  useEffect(() => {
    FamilyDataService.getAllListRequestFamily()
      .then((data: any) => {
        setRowData(data);
      })
      .catch((e: Error) => {
        console.log(e.message);
      });
  }, [rowData]);

  const handleClick = (type: string, id: number) => {
    console.log(type, id);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "parent",
      headerName: "Parent",
      description: "This column has a value getter and is not sortable.",
      width: 300,
      valueGetter: (params: GridValueGetterParams) =>
        `${params.row.parent_name || ""}`,
      headerAlign: "center",
      align: "center"
    },
    {
      field: "relation_type",
      headerName: "Hubungan",
      width: 130,
      renderCell: ({ row }) =>
        row.relation_type === "children" ? "ANAK" : "SUAMI/ISTRI",
      headerAlign: "center",
      align: "center"
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: ({ row }) =>
        row.status === 0 ? (
          <Chip label="DITOLAK" color="error" />
        ) : row.status === 1 ? (
          <Chip label="PENDING" color="warning" />
        ) : (
          <Chip label="DITERIMA" color="success" />
        ),
      headerAlign: "center",
      align: "center"
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <>
            <IconButton
              aria-label="detail"
              // disabled={}
              onClick={() => {
                props.onView(row.parent_id);
              }}
            >
              <Visibility />
            </IconButton>
            <IconButton
              aria-label="setujui"
              // disabled={}
              onClick={() => {
                handleClick("approve", row.id);
              }}
            >
              <Check />
            </IconButton>
            <IconButton
              aria-label="tolak"
              // disabled={}
              onClick={() => {
                handleClick("reject", row.id);
              }}
            >
              <CloseIcon />
            </IconButton>
          </>
        );
      },
      headerAlign: "center",
      align: "center"
    },
  ];

  const closeHandler = useCallback(() => {
    props.setShow(false);
  }, [props]);

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
            // width: "50%",
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
          <DataGrid
            rows={rowData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            // checkboxSelection
          />
        </Box>
      </Modal>
    </>
  );
};
