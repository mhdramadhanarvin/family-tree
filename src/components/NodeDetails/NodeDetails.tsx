import { memo, useCallback, useState } from "react";
import classNames from "classnames";
import { Relations } from "./Relations";
import css from "./NodeDetails.module.css";
import Button from "@mui/material/Button";
import { AlertType, Node } from "../../types/family.type";
import { Session } from "@supabase/supabase-js";
import { Alert, Box, Snackbar } from "@mui/material";
import { Add, Close, Create, Delete } from "@mui/icons-material";
import Swal from "sweetalert2";
import FamilyDataService from "../../services/FamilyDataService";
import { Gender } from "relatives-tree/lib/types";

const familyDataService = new FamilyDataService();

interface NodeDetailsProps {
  node: Readonly<Node>;
  allNode: any;
  className?: string;
  onSelect: (nodeId: string | undefined) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
  onAddFamily: (nodeId: string | undefined) => void;
  onLogin: Session | null;
  userRole: number | undefined;
  onRefresh: (setRefresh: boolean) => void;
  onEdit: (nodeId: string | undefined) => void;
}

export const NodeDetails = memo(function NodeDetails({
  node,
  allNode,
  className,
  ...props
}: NodeDetailsProps) {
  const [alert, setAlert] = useState<AlertType | undefined>();
  const closeHandler = useCallback(() => props.onSelect(undefined), [props]);
  const addFamilyHandler = () => {
    closeHandler();
    return props.onAddFamily(node.id);
  };

  const deleteFamilyHandler = async (id: string) => {
    const getIndex = await familyDataService.getIndexById(id);
    const getData = await familyDataService.getById(id);
    const getAllData = await familyDataService.getAll();

    if (
      getData.children.length > 0 ||
      (getData.gender === Gender.male && getData.spouses.length > 0)
    ) {
      setAlert({
        message: "Silahkan hapus data pasangan/anak terlebih dahulu!",
        type: "error",
      });
    } else {
      // jika seorang anak dan punya kedua orangtua
      if (getData.parents.length > 0) {
        await Promise.all(
          getData.parents.map(async (parent: any) => {
            // ambil index dari kedua orangtua
            const getParentIndex = await familyDataService.getIndexById(
              parent.id
            );
            // ambil info tentang orang tua
            const getParentData = await familyDataService.getById(parent.id);
            // hapus data anak dari kedua orangtua
            const childrenOfParent = getParentData.children.filter(
              (filterChildren: any) => filterChildren.id !== id
            );
            getAllData[getParentIndex].children = childrenOfParent;
          })
        );
      }

      // jika seorang istri
      if (getData.spouses.length > 0) {
        await Promise.all(
          getData.spouses.map(async (spouse: any) => {
            // ambil index dari pasangan
            const getSpouseIndex = await familyDataService.getIndexById(
              spouse.id
            );
            // ambil info tentang pasangan
            const getSpouseData = await familyDataService.getById(spouse.id);
            // hapus data pasangan dari pasangan lain
            const spouseList = getSpouseData.spouses.filter(
              (spouseData: any) => spouseData.id !== id
            );
            getAllData[getSpouseIndex].spouses = spouseList;
          })
        );
      }
      // remove data dari list
      getAllData.splice(getIndex, 1);
      familyDataService.update(getAllData);

      setAlert({
        message: "Berhasil menghapus data",
        type: "success",
      });
      setTimeout(() => {
        props.onRefresh(true);
      }, 1000);
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
      <section className={classNames(css.root, className)}> 
        <button className={css.close} onClick={closeHandler}> 
          <Close fontSize="medium" />
        </button> 
        {node.photo && (
          <Box mt={2} textAlign="left">
            <img src={node.photo} alt={node.photo} height="300px" />
          </Box>
        )}
        <header className={css.header}>
          <h3 className={css.title}>{node.name}</h3>
        </header>
        {node.birthday && (
          <h4 className={css.header}>Tanggal Lahir : {node.birthday}</h4>
        )}
        {node.address && (
          <h4 className={css.header}>Alamat : {node.address}</h4>
        )}
        {node.job && <h4 className={css.header}>Pekerjaan : {node.job}</h4>}
        {node.description && (
          <>
            <h4 className={css.header}>Deskripsi : </h4>
            <p>{node.description}</p>
          </>
        )}
        <Relations
          {...props}
          allNode={allNode}
          title="OrangTua"
          items={node.parents}
        />
        <Relations
          {...props}
          allNode={allNode}
          title="Anak"
          items={node.children}
        />
        <Relations
          {...props}
          allNode={allNode}
          title="Saudara"
          items={node.siblings}
        />
        <Relations
          {...props}
          allNode={allNode}
          title="Pasangan"
          items={node.spouses}
        />
        {props.onLogin && (
          <>
            <Button
              variant="contained"
              size="small"
              onClick={addFamilyHandler}
              sx={{ marginRight: 1 }}
              startIcon={<Add />}
            >
              TAMBAH KELUARGA
            </Button>
            <Button
              color="warning"
              variant="contained"
              size="small"
              onClick={() => props.onEdit(node.id)}
              sx={{ marginRight: 1 }}
              startIcon={<Create />}
            >
              UBAH DATA
            </Button>
            <Button
              color="error"
              variant="outlined"
              size="small"
              onClick={() => {
                Swal.fire({
                  title: `Yakin ingin menghapus ${node.name} ?`,
                  text: "Data yang dihapus tidak dapat dikembalikan!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Ya, lanjutkan!",
                  cancelButtonText: "Batal!",
                }).then((result) => {
                  if (result.isConfirmed) {
                    deleteFamilyHandler(node.id);
                  }
                });
              }}
              startIcon={<Delete />}
            >
              HAPUS DATA
            </Button>
          </>
        )}
      </section>
    </>
  );
});
