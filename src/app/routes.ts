import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/analysis/:scanId?",
    Component: Analysis,
  },
]);
