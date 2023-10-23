import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { AccountTree, PeopleAlt, PersonAdd } from "@mui/icons-material"; 
import { CreateUser } from "../Auth/CreateUser";

const actions = [
  { id: 1, icon: <PersonAdd />, name: "Tambah Pengguna" },
  { id: 2, icon: <PeopleAlt />, name: "Daftar Pengguna" },
  { id: 3, icon: <AccountTree />, name: "Keluarga" },
];

export const SuperAdminAccess = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [showCreateUser, setShowCreateUser] = React.useState<boolean>(false)

  const handleClick = (paramId: number) => {
    if (paramId === 1) {
      setShowCreateUser(true)
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
      <CreateUser onShow={showCreateUser} setShow={setShowCreateUser}/>
    </>
  );
};
