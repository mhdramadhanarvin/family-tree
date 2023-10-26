import {
  Box,
  IconButton,
  Typography,
  Modal,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useEffect, useState } from "react";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import FamilyDataService from "../../services/FamilyDataService";
import FamilyData, {
  AlertType,
  RelationType, 
  statusTemporaryFamily,
} from "../../types/family.type";
import { Check, Visibility } from "@mui/icons-material";
import { RelType } from "relatives-tree/lib/types";

interface ListRequestFamilyProps {
  onShow: boolean;
  setShow: (open: boolean) => void;
  onView: (parentId: string) => void;
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
  const [alert, setAlert] = useState<AlertType | undefined>(undefined);
  const [view, setView] = useState<string>();

  const approveRequest = async (
    requestId: number,
    parentId: string,
    relationType: RelationType,
    data: FamilyData
  ) => {
    if (relationType === RelationType.children) {
      await storeDataChildren(data, parentId);
    } else if (relationType === RelationType.spouse) {
      await storeDataSpouse(data, parentId);
    }

    FamilyDataService.updateRequestFamily(
      requestId,
      statusTemporaryFamily.approve
    )
      .then(() => {
        setAlert({ message: "Permintaan berhasil disetujui", type: "success" });
      })
      .catch((e: Error) => {
        setAlert({ message: e.message, type: "error" });
      });
  };

  const rejectRequest = (requestId: number) => {
    FamilyDataService.updateRequestFamily(
      requestId,
      statusTemporaryFamily.rejected
    )
      .then(() => {
        setAlert({ message: "Permintaan berhasil ditolak", type: "success" });
      })
      .catch((e: Error) => {
        setAlert({ message: e.message, type: "error" });
      });
  };

  const storeDataChildren = async (newData: FamilyData, parentId: string) => {
    const getAllData = await FamilyDataService.getAll();
    const lengthData = await FamilyDataService.getLengthData();

    getAllData[lengthData] = newData;

    //get data husband in parent (wife)
    const spouseOfParentId = await FamilyDataService.getById(parentId).then(
      (data) => {
        return data.spouses.length > 0 ? [data.spouses[0].id] : [];
      }
    );
    // gabungkan id suami dan istri untuk data parent
    const parents: string[] = [parentId].concat(spouseOfParentId);

    await Promise.all(
      parents.map(async (parentData) => {
        const getDataParent = await FamilyDataService.getById(parentData);
        getDataParent.children = [
          ...getDataParent.children,
          {
            id: newData.id,
            type: RelType.blood,
          },
        ];

        const indexData = await FamilyDataService.getIndexById(parentData);
        getAllData[indexData] = await getDataParent;
        console.log(indexData);
        return getAllData;
      })
    );

    await FamilyDataService.update(getAllData);
  };

  const storeDataSpouse = async (newData: FamilyData, parentId: string) => {
    const childrenOfSpouseId = await FamilyDataService.getById(parentId).then(
      (data) => {
        // kalau dia punya anak dan belum punya pasangan
        // ambil data anaknya
        // untuk dimasukkan ke pasangan baru
        return data.children.length > 0 && data.spouses.length < 1
          ? [data.children[0].id]
          : [];
      }
    );

    const children = childrenOfSpouseId.map((data: any) => {
      return {
        id: data,
        type: "blood",
      };
    });

    newData.children = children;

    const getAllData = await FamilyDataService.getAll();
    const lengthData = await FamilyDataService.getLengthData();

    // masukkan data pasangan baru dan anaknya
    getAllData[lengthData] = newData;

    // tambahkan data pasangan baru sebagai pasangan di parent data
    const getDataParent = await FamilyDataService.getById(parentId);
    getDataParent.spouses = [
      ...getDataParent.spouses,
      {
        id: newData.id,
        type: RelType.married,
      },
    ];
    const indexData = await FamilyDataService.getIndexById(parentId);
    getAllData[indexData] = await getDataParent;

    await FamilyDataService.update(getAllData);
  };

  useEffect(() => {
    FamilyDataService.getAllListRequestFamily()
      .then((data: any) => {
        setRowData(data);
      })
      .catch((e: Error) => {
        console.log(e.message);
      });
  }, [rowData]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "parent",
      headerName: "Parent",
      description: "This column has a value getter and is not sortable.",
      width: 270,
      valueGetter: (params: GridValueGetterParams) =>
        `${params.row.parent_name || ""}`,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "relation_type",
      headerName: "Hubungan",
      width: 130,
      renderCell: ({ row }) =>
        row.relation_type === "children" ? "ANAK" : "SUAMI/ISTRI",
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
      headerName: "Action",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <>
            <IconButton
              aria-label="detail"
              // disabled={row.status !== 1}
              sx={{
                color: "blue",
              }}
              onClick={() => {
                props.onView(row.parent_id);
                props.setShow(false);
              }}
            >
              <Visibility />
            </IconButton>
            <IconButton
              aria-label="setujui"
              disabled={row.status !== 1}
              onClick={() => {
                approveRequest(
                  row.id,
                  row.parent_id,
                  row.relation_type,
                  row.data
                );
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
