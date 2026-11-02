import React from "react";
import { createRoot } from "react-dom/client";
import { BillPreview } from "./BillPreview";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BillPreview />
  </React.StrictMode>
);
