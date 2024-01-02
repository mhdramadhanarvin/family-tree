import { Box, Link } from "@mui/material";

export const Footer = () => {
  const currYear = new Date().getFullYear(); 

  return (
    <Box textAlign={"center"} padding={1}>
      Copyright &copy; 2023 - {currYear} All Right Reserved. Zuriat Online by
      <Link href="mailto:mramadhan687@gmail.com" underline="none"> Mhd. Ramadhan Arvin</Link>
    </Box>
  );
};
