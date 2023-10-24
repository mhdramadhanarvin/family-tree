import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { AccountTree, PeopleAlt } from "@mui/icons-material";  
import { ListUsers } from "../Auth/ListUsers";

const actions = [ 
  { id: 1, icon: <PeopleAlt />, name: "Daftar Pengguna" },
  { id: 2, icon: <AccountTree />, name: "Keluarga" },
];

export const SuperAdminAccess = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [showListUsers, setShowListUsers] = React.useState<boolean>(false)

  const handleClick = (paramId: number) => {
    if (paramId === 1) {
      setShowListUsers(true)
    }
  };

  return (
    <>
      <Box>
        <SpeedDial
          ariaLabel="SpeedDial controlled open example"
          sx={{ position: "absolute", bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
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
      <ListUsers onShow={showListUsers} setShow={setShowListUsers}/>
    </>
  );
};
