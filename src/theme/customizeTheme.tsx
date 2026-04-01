import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#F4F5F5", // Light gray input background
          borderRadius: 0, // Remove rounded corners

          "& .MuiOutlinedInput-notchedOutline": {
            border: "none", // Remove all borders
            borderBottom: "2px solid #d1d1d1", // Only bottom border
            borderRadius: 0,
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: "2px solid #005DAB", // Bottom border on hover (Costco blue)
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: "2px solid #005DAB", // Bottom border on focus (Costco blue)
          },
        },

        input: {
          fontSize: "16px",
          lineHeight: "20px",
          fontWeight: "400",
          letterSpacing: "normal",
          color: "#666666",
          width: "100%",
          padding: "12px 8px",

          "&::placeholder": {
            color: "#999999",
            opacity: 1,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#F4F5F5",
          borderRadius: 0,
          
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: "2px solid #d1d1d1",
            borderRadius: 0,
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: "2px solid #005DAB",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: "2px solid #005DAB",
          },
        },
        select: {
          fontSize: "16px",
          lineHeight: "20px",
          fontWeight: "400",
          letterSpacing: "normal",
          color: "#666666",
          width: "100%",
          padding: "12px 8px",
        },
        icon: {
          color: "#005DAB", // Blue dropdown arrow
          right: "8px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "16px",
          lineHeight: "20px",
          fontWeight: "400",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
          "&.Mui-selected": {
            backgroundColor: "#e3f2fd",
            "&:hover": {
              backgroundColor: "#e3f2fd",
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 28,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          "&.Mui-checked": {
            transform: "translateX(24px)",
            color: "#ffffff",
            "& + .MuiSwitch-track": {
              backgroundColor: "#005DAB",
              opacity: 1,
              border: "none",
            },
          },
          "&.Mui-focusVisible & .MuiSwitch-thumb": {
            color: "#005DAB",
            border: "6px solid #fff",
          },
        },
        thumb: {
          width: 24,
          height: 24,
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        },
        track: {
          borderRadius: 14,
          backgroundColor: "#E0E0E0",
          opacity: 1,
        },
      },
    },
  }
});

export default theme;
