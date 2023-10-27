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
  Node,
  RelationType,
  statusTemporaryFamily,
} from "../../types/family.type";
import { Check, Visibility } from "@mui/icons-material";
import { RelType } from "relatives-tree/lib/types";
import classNames from "classnames";
import css from "./ListRequestFamily.module.css";

interface ListRequestFamilyProps {
  onShow: boolean;
  setShow: (open: boolean) => void;
  onDetailNode: (node: Node[] | any) => void;
}

const familyDataService = new FamilyDataService()

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
  const [seeDetail, setSeeDetail] = useState<string>();

  const approveRequest = async (
    requestId: number,
    parentId: string,
    relationType: RelationType,
    data: FamilyData
  ) => {
    let resultData: FamilyData[] = [
      {
        id: "user1",
        name: "Nama",
        gender: "male",
        parents: [],
        siblings: [],
        spouses: [],
        children: [],
      },
    ];
    if (relationType === RelationType.children) {
      resultData = await storeDataChildren(data, parentId);
    } else if (relationType === RelationType.spouse) {
      resultData = await storeDataSpouse(data, parentId);
    }

    await familyDataService.update(resultData);

    familyDataService.updateRequestFamily(
      requestId,
      statusTemporaryFamily.approve
    )
      .then(() => {
        props.onDetailNode(resultData);
        setAlert({ message: "Permintaan berhasil disetujui", type: "success" });
      })
      .catch((e: Error) => {
        setAlert({ message: e.message, type: "error" });
      });
  };

  const rejectRequest = (requestId: number) => {
    familyDataService.updateRequestFamily(
      requestId,
      statusTemporaryFamily.rejected
    )
      .then(() => {
        props.onDetailNode(undefined);
        setSeeDetail('')
        setAlert({ message: "Permintaan berhasil ditolak", type: "success" });
      })
      .catch((e: Error) => {
        setAlert({ message: e.message, type: "error" });
      });
  };

  const storeDataChildren = async (
    newData: FamilyData,
    parentId: string,
    temporaryData: boolean = false
  ) => {
    const getAllData = await familyDataService.getAll();
    const lengthData = await familyDataService.getLengthData();

    newData.placeholder = temporaryData;

    getAllData[lengthData] = newData;

    //get data husband in parent (wife)
    const spouseOfParentId = await familyDataService.getById(parentId).then(
      (data) => {
        return data.spouses.length > 0 ? [data.spouses[0].id] : [];
      }
    );
    // gabungkan id suami dan istri untuk data parent
    const parents: string[] = [parentId].concat(spouseOfParentId);

    await Promise.all(
      parents.map(async (parentData) => {
        const getDataParent = await familyDataService.getById(parentData);
        getDataParent.children = [
          ...getDataParent.children,
          {
            id: newData.id,
            type: RelType.blood,
          },
        ];

        const indexData = await familyDataService.getIndexById(parentData);
        getAllData[indexData] = await getDataParent;
        return getAllData;
      })
    );

    return getAllData;
  };

  const storeDataSpouse = async (
    newData: FamilyData,
    parentId: string,
    temporaryData: boolean = false
  ) => {
    const childrenOfSpouseId = await familyDataService.getById(parentId).then(
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

    const getAllData = await familyDataService.getAll();
    const lengthData = await familyDataService.getLengthData();

    newData.placeholder = temporaryData;

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

    // await familyDataService.update(getAllData);
    return getAllData;
  };

  const previewNode = async (
    requestId: number,
    parentId: string,
    relationType: RelationType,
    data: FamilyData
  ) => {
    props.setShow(false);

    let resultData;
    if (relationType === RelationType.children) {
      resultData = await storeDataChildren(data, parentId, true);
    } else if (relationType === RelationType.spouse) {
      resultData = await storeDataSpouse(data, parentId, true);
    }

    props.onDetailNode(resultData);
  };

  useEffect(() => { 
    familyDataService.getAllListRequestFamily()
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
      headerName: "Keluarga",
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
      headerName: "Aksi",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <>
            <IconButton
              aria-label="detail"
              disabled={row.status !== 1}
              className={classNames(css.selectedButton)}
              onClick={() => {
                previewNode(row.id, row.parent_id, row.relation_type, row.data);
                setSeeDetail(row.id);
              }}
              sx={{
                color: seeDetail === row.id ? "blue" : "",
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
