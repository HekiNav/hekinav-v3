"use client";
import { Dispatch, SetStateAction, createContext } from "react";

export const FocusContext = createContext<{ setSidebarHidden: Dispatch<SetStateAction<boolean>> | null; }>({ setSidebarHidden: null });
