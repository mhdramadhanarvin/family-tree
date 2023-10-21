import React, { useMemo, useState, useCallback, useEffect } from "react";
import app from "../../..//package.json";
import ReactFamilyTree from "react-family-tree";
// import { SourceSelect } from '../SourceSelect/SourceSelect';
import { PinchZoomPan } from "../PinchZoomPan/PinchZoomPan";
import { FamilyNode } from "../FamilyNode/FamilyNode";
import { NodeDetails } from "../NodeDetails/NodeDetails";
import { NODE_WIDTH, NODE_HEIGHT, SOURCES, DEFAULT_SOURCE } from "../const";
import { getNodeStyle } from "./utils";
import { AddFamily } from "../Family/AddFamily";

import css from "./App.module.css";
import FamilyDataService, { supabase } from "../../services/FamilyDataService";
import { Node } from "../../types/family.type";
import { ExtNode } from "relatives-tree/lib/types";
import { Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared";
import { Box, Modal } from "@mui/material";

export default React.memo(function App() {
  const [source] = useState(DEFAULT_SOURCE);
  const [nodes, setNodes] = useState(SOURCES[source]);
  const firstNodeId = useMemo(() => nodes[0].id, [nodes]);
  const [rootId, setRootId] = useState(firstNodeId);

  const [selectId, setSelectId] = useState<string>();
  const [hoverId, setHoverId] = useState<string>();
  const [addFamilyId, setAddFamilyId] = useState<string>();
  const [session, setSession] = useState<Session | null>(null);
  const [showLogin, setShowLogin] = useState(false); 

  useEffect(() => {
    FamilyDataService.getAll().then((result: Node[]) => {
      setRootId(result[0].id);
      setNodes(result);
    });
  }, [nodes, firstNodeId, rootId]);

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
    setAddFamilyId(undefined);
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className={css.root}>
      <header className={css.header}>
        <h1 className={css.title}>
          FamilyTree
          <span className={css.version}>version: {app.version}</span>
        </h1>
        {!session && (
          <span className={css.version} onClick={() => setShowLogin(true)}>
            LOGIN
          </span>
        )}
        {session && (
          <span className={css.version} onClick={async () => signOut()}>
            LOGOUT
          </span>
        )}
      </header>
      {nodes !== null && nodes.length > 0 && (
        <PinchZoomPan min={0.5} max={2.0} captureWheel className={css.wrapper}>
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
          onAddFamily={setAddFamilyId}
          onLogin={session}
        />
      )}
      {addFamilyId && session && <AddFamily onAdd={addFamilyId} />}
      <Modal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            width: 500,
            backgroundColor: "primary.dark",
            margin: "auto",
            padding: 2,
          }}
        >
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }} 
          />
        </Box>
      </Modal>
    </div>
  );
});
