import React, { useMemo, useState, useCallback, useEffect } from "react";
import ReactFamilyTree from "react-family-tree";
import { PinchZoomPan } from "../PinchZoomPan/PinchZoomPan";
import { FamilyNode } from "../FamilyNode/FamilyNode";
import { NodeDetails } from "../NodeDetails/NodeDetails";
import { NODE_WIDTH, NODE_HEIGHT, SOURCES, DEFAULT_SOURCE } from "../const";
import { getNodeStyle } from "./utils";
import { AddFamily } from "../Family/AddFamily";
import FamilyDataService, { supabase } from "../../services/FamilyDataService";
import { Node } from "../../types/family.type";
import { ExtNode } from "relatives-tree/lib/types";
import { Session } from "@supabase/supabase-js";
import { Login } from "../Auth/Login";
import { Alert } from "../Skeleton/Alert";

import css from "./App.module.css";
import { SuperAdminAccess } from "../Skeleton/SuperAdminAccess";
import { Register } from "../Auth/Register";
import { Maintenance } from "../Skeleton/Maintenance";
import { MemberAccess } from "../Skeleton/MemberAccess";
// import { Search } from "@mui/icons-material";
// import { SearchData } from "../Skeleton/SearchData";

const familyDataService = new FamilyDataService();

export default React.memo(function App() {
  const [source] = useState(DEFAULT_SOURCE);
  const [nodes, setNodes] = useState(SOURCES[source]);
  const firstNodeId = useMemo(() => nodes[0].id, [nodes]);
  const [rootId, setRootId] = useState(firstNodeId);

  const [selectId, setSelectId] = useState<string>();
  const [hoverId, setHoverId] = useState<string>();
  const [addFamilyId, setAddFamilyId] = useState<string>();
  const [addFamily, setAddFamily] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userRole, setUserRole] = useState<number | undefined>(undefined);
  const [alert, setAlert] = useState<AlertType | undefined>(undefined);
  const [temporaryNode, setTemporaryNode] = useState<Node[] | undefined>(
    undefined
  );
  const maintenance =
    process.env.REACT_APP_MAINTENANCE_STATUS !== undefined &&
    process.env.REACT_APP_MAINTENANCE_STATUS === "true";

  interface AlertType {
    title: string;
    message: string;
    type: "error" | "warning" | "info" | "success";
  }

  useEffect(() => {
    if (temporaryNode) {
      setRootId(temporaryNode[0].id);
      setNodes(temporaryNode);
    } else {
      fetchData();
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session?.user.email === process.env.REACT_APP_ADMIN_EMAIL) {
        setUserRole(1);
      } else {
        setUserRole(2);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user.email === process.env.REACT_APP_ADMIN_EMAIL) {
        setUserRole(1);
      } else {
        setUserRole(2);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [temporaryNode]);

  const fetchData = () => {
    familyDataService
      .getAll()
      .then((result: Node[]) => {
        setRootId(result[0].id);
        setNodes(result);
      })
      .catch((e: Error) => {
        setAlert({
          title: "Terjadi kesalahan",
          message: e.message + ". Please refresh..",
          type: "error",
        });
      });
  };

  const resetRootHandler = useCallback(
    () => setRootId(firstNodeId),
    [firstNodeId]
  );

  const selected = useMemo(
    () => (nodes ? nodes.find((item) => item.id === selectId) : null),
    [nodes, selectId]
  );

  const seeDetailNode = (selectId: string) => {
    setSelectId(selectId);
    setAddFamily(false);
  };

  const signOut = async () => {
    setUserRole(undefined);
    setTemporaryNode(undefined);
    return await supabase.auth.signOut();
  };

  return (
    <>
      {maintenance ? (
        <Maintenance />
      ) : (
        <div className={css.root}>
          {alert && (
            <Alert
              open={true}
              onClose={() => {}}
              style={{
                position: "absolute" as "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "background.paper",
                border: "2px solid #000",
                boxShadow: 24,
                p: 4,
              }}
              message={alert.message}
              title={alert.title}
            />
          )}
          <header className={css.header}>
            <h1 className={css.title}>FamilyTree</h1>
            {!session && (
              <div
                style={{
                  display: "inline-flex",
                }}
              >
                <span
                  className={css.version}
                  onClick={() => setShowRegister(true)}
                >
                  REGISTER
                </span>
                <span
                  className={css.version}
                  onClick={() => setShowLogin(true)}
                >
                  LOGIN
                </span>
              </div>
            )}
            {session && (
              <span className={css.version} onClick={async () => signOut()}>
                {session.user.email} - LOGOUT
              </span>
            )}
          </header>
          {/* <SearchData onResult={setTemporaryNode} /> */}
          {nodes !== null && nodes.length > 0 && (
            <PinchZoomPan
              min={0.2}
              max={2.5}
              captureWheel
              className={css.wrapper}
            >
              <ReactFamilyTree
                nodes={nodes as Readonly<Node[]>}
                rootId={rootId || ""}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                className={css.tree}
                renderNode={(node: Readonly<ExtNode>) => (
                  <FamilyNode
                    key={node.id}
                    node={node}
                    isRoot={node.id === rootId}
                    isHover={node.id === hoverId}
                    onClick={seeDetailNode}
                    onSubClick={setRootId}
                    style={getNodeStyle(node)}
                  />
                )}
              />
            </PinchZoomPan>
          )}
          {rootId !== firstNodeId && (
            <button className={css.reset} onClick={resetRootHandler}>
              Reset
            </button>
          )}
          {selected && (
            <NodeDetails
              node={selected}
              allNode={nodes}
              className={css.details}
              onSelect={setSelectId}
              onHover={setHoverId}
              onClear={() => setHoverId(undefined)}
              onAddFamily={() => {
                setAddFamilyId(selectId);
                setAddFamily(true);
              }}
              onLogin={session}
              userRole={userRole}
            />
          )}

          {addFamily && session && (
            <AddFamily
              onAdd={addFamilyId}
              onShow={setAddFamily}
              onRefresh={fetchData}
            />
          )}

          <Login onShow={showLogin} setShow={setShowLogin} />
          <Register onShow={showRegister} setShow={setShowRegister} />
          {userRole === 1 && session && <SuperAdminAccess />}
          {session && <MemberAccess onRefresh={fetchData} />}
        </div>
      )}
    </>
  );
});
