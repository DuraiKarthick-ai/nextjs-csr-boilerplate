import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
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

          // Error state - red border bottom
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: "2px solid #C00000", // Red border on error
          },

          "&.Mui-error:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: "2px solid #C00000",
          },

          "&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderBottom: "2px solid #C00000",
          },
        },

        input: {
          fontSize: "16px",
          fontWeight: "400",
          letterSpacing: "normal",
          color: "#666666",
          width: "100%",
          padding: "10px 8px",

          // Reduce font size on screens below 1920px
          "@media (max-width:1919px)": {
            fontSize: "14px",
          },

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
          fontWeight: "400",
          letterSpacing: "normal",
          color: "#666666",
          width: "100%",
          padding: "10px 8px",
          // Reduce font size on screens below 1920px
          "@media (max-width:1919px)": {
            fontSize: "14px",
          },
        },
        icon: {
          color: "#005DAB", // Blue dropdown arrow
          right: "8px",
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          marginTop: "4px",
          "&.Mui-error": {
            color: "#C00000",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-error": {
            color: "#C00000",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "16px",
          lineHeight: "20px",
          fontWeight: "400",
          // Reduce font size on screens below 1920px
          "@media (max-width:1919px)": {
            fontSize: "14px",
          },
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
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#F4F5F5",
            borderRadius: 0,
            padding: "0 40px 0 0 !important",
            
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

            "& .MuiAutocomplete-input": {
              fontSize: "16px",
              fontWeight: "400",
              color: "#666666",
              padding: "10px 8px !important",
              // Reduce font size on screens below 1920px
              "@media (max-width:1919px)": {
                fontSize: "14px",
              },

              "&::placeholder": {
                color: "#999999",
                opacity: 1,
              },
            },
          },
        },
        endAdornment: {
          position: "absolute",
          right: "8px !important",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        },
        popupIndicator: {
          color: "#005DAB",
          padding: "2px",
        },
        clearIndicator: {
          color: "#666666",
          padding: "2px",
        },
        option: {
          fontSize: "16px",
          lineHeight: "20px",
          fontWeight: "400",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
          '&[aria-selected="true"]': {
            backgroundColor: "#e3f2fd",
            "&:hover": {
              backgroundColor: "#e3f2fd",
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: "#edf7ed",
          color: "#1e4620",
          border: "1px solid #c6e6c6",
          borderRadius: "4px",
          fontSize: "14px",
          maxWidth: "400px",
          "& .MuiAlert-message": {
            whiteSpace: "normal",
            wordBreak: "break-word",
          },
        },
      },
    },
    
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#ffffff",
          transform: "translateZ(0)",
          willChange: "transform",
          backfaceVisibility: "hidden",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          padding: "12px 8px",
          border: "1px solid #EEEEEE",
        },
        body: {
          padding: "12px 8px",
          borderBottom: "1px solid #EEEEEE",
        },
      },
    },

    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root:nth-of-type(even)": {
            backgroundColor: "#fafafa",
          },
        },
      },
    },

  }
});

// Compact theme for table filter dropdowns
export const tableFilterTheme = createTheme({
  components: {
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "4px",
          minWidth: "70px",
          height: "32px",
          
          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #d1d1d1",
            borderRadius: "4px",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #999999",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #005DAB",
          },
        },
        select: {
          fontSize: "13px",
          lineHeight: "16px",
          fontWeight: "400",
          color: "#333333",
          padding: "6px 28px 6px 10px !important",
          minHeight: "unset",
          display: "flex",
          alignItems: "center",
        },
        icon: {
          color: "#666666",
          right: "6px",
          fontSize: "18px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "4px",
          height: "32px",

          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #d1d1d1",
            borderRadius: "4px",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #999999",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #005DAB",
          },
        },
        input: {
          fontSize: "13px",
          lineHeight: "16px",
          fontWeight: "400",
          color: "#333333",
          padding: "6px 10px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "13px",
          lineHeight: "18px",
          fontWeight: "400",
          padding: "6px 12px",
          minHeight: "unset",
          justifyContent: "flex-start",
          textAlign: "left",
          display: "block",
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
    MuiList: {
      styleOverrides: {
        root: {
          textAlign: "left",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          textAlign: "left",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "4px",
          color: "#666666",
          "&.Mui-checked": {
            color: "#005DAB",
          },
        },
      },
    },
  }
});

// DatePicker theme with Costco blue styling - matches tableFilterTheme
export const datePickerTheme = createTheme({
  palette: {
    primary: {
      main: "#005DAB",
      light: "#e3f2fd",
      dark: "#004a8c",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          height: "32px",
          minWidth: "120px",
          paddingRight: "unset",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #d1d1d1",
            borderRadius: "4px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #999999",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #005DAB",
          },
        },
        input: {
          fontSize: "13px",
          lineHeight: "16px",
          fontWeight: "400",
          color: "#333333",
          padding: "6px 0 6px 10px",
          "&::placeholder": {
            color: "#333333",
            opacity: 1,
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          marginLeft: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#005DAB",
          padding: "4px",
          marginRight: "2px",
          "&:hover": {
            backgroundColor: "#e3f2fd",
          },
          "& .MuiSvgIcon-root": {
            fontSize: "18px",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "13px",
          color: "#333333",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: "#005DAB",
          fontSize: "13px",
          fontWeight: "500",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#e3f2fd",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          borderRadius: "4px",
          border: "1px solid #d1d1d1",
        },
      },
    },
  },
});

// Compact theme for Table Pagination
export const tablePagination = createTheme({
  components: {
    
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          padding: "6px 12px",
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

  },
});
