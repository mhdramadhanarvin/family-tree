import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { AdminPanelSettings, Group } from "@mui/icons-material";
import { ListRequestUsers } from "../Auth/ListRequestFamily";

const actions = [{ id: 2, icon: <Group />, name: "Keluarga" }];

export const SuperAdminAccess = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [showListRequest, setShowListRequest] = React.useState<boolean>(false);

  const handleClick = (paramId: number) => {
    if (paramId === 2) {
      setShowListRequest(true);
    }
  };

  return (
    <>
      <Box>
        <SpeedDial
          ariaLabel="SpeedDial controlled open example"
          sx={{ position: "absolute", bottom: 16, right: 75 }}
          icon={<AdminPanelSettings />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => handleClick(action.id)}
            />
          ))}
        </SpeedDial>
      </Box>
      <ListRequestUsers onShow={showListRequest} setShow={setShowListRequest} />
    </>
  );
};
