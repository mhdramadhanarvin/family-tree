import { memo, useCallback } from "react";
import classNames from "classnames";
import { Relations } from "./Relations";
import css from "./NodeDetails.module.css";
import Button from "@mui/material/Button";
import { Node } from "../../types/family.type";
import { Session } from "@supabase/supabase-js";
import { Box } from "@mui/material";

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
}

export const NodeDetails = memo(function NodeDetails({
  node,
  allNode,
  className,
  ...props
}: NodeDetailsProps) {
  const closeHandler = useCallback(() => props.onSelect(undefined), [props]);
  const addFamilyHandler = () => {
    closeHandler();
    return props.onAddFamily(node.id);
  };

  return (
    <section className={classNames(css.root, className)}>
      <header className={css.header}>
        {node.photo && (
          <Box mt={2} textAlign="left">
            <img src={node.photo} alt={node.photo} height="300px" />
          </Box>
        )}
      </header>
      <header className={css.header}>
        <h3 className={css.title}>{node.name}</h3>
        <button className={css.close} onClick={closeHandler}>
          &#10005;
        </button>
      </header>
      {node.birthday && (
        <h4 className={css.header}>Tanggal Lahir : {node.birthday}</h4>
      )}
      {node.address && <h4 className={css.header}>Alamat : {node.address}</h4>}
      {node.job && <h4 className={css.header}>Pekerjaan : {node.job}</h4>}
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
        <Button variant="contained" size="small" onClick={addFamilyHandler}>
          {props.userRole === 1 ? "TAMBAH KELUARGA" : "AJUKAN TAMBAH KELUARGA"}
        </Button>
      )}
    </section>
  );
});
