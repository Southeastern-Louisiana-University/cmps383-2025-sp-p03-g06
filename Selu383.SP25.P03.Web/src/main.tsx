import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "./index.css";
import App from "./App.tsx";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
// Create a custom theme matching your green and gold color scheme
const theme = createTheme({
  colors: {
    primary: [
      "#e8f5ed", // primary-light
      "#c5e4d3",
      "#a2d4b9",
      "#7fc49f",
      "#5cb485",
      "#39a46b",
      "#0d6832", // primary-color
      "#064023", // primary-dark
      "#043519",
      "#02280f",
    ],
    secondary: [
      "#fdf7e4", // secondary-light
      "#f9eec9",
      "#f5e4ae",
      "#f1db93",
      "#ecd178",
      "#e8c85d",
      "#d4af37", // secondary-color
      "#b3901f", // secondary-dark
      "#856b17",
      "#57460f",
    ],
  },
  primaryColor: "primary",
  primaryShade: 6,
  fontFamily: "Poppins, sans-serif",
  headings: {
    fontFamily: "Poppins, sans-serif",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorSchemeProvider>
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
    </ColorSchemeProvider>
  </StrictMode>
);
