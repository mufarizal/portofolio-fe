import { createContext, useContext } from "react";

export const PortofolioContext = createContext(null);
export const usePortofolio = () => useContext(PortofolioContext);
