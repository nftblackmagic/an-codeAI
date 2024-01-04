import { createContext, ReactNode, useState, useEffect, useRef } from 'react';
import { History, HistoryItem } from "../components/history/history_types";
import toast from "react-hot-toast";

interface historyContextType {
    history: History;
    currentVersion: number | null;
    setCurrentVersion: (version: number | null) => void;
    addHistory: (generationType: string, updateInstruction: string, referenceImages: string[], initText: string, code: string) => void;
    updateHistoryScreenshot: (img: string, version?: number) => void;
}

const initialValue = {
    history: [],
    currentVersion: null,
    setCurrentVersion: (version: number | null) => {},
    addHistory: (generationType: string, updateInstruction: string, referenceImages: string[], initText: string, code: string) => {},
    updateHistoryScreenshot: (img: string, version?: number) => {}
}

export const HistoryContext = createContext<historyContextType>(initialValue);

export default function SettingProvider({ children }: { children: ReactNode }) {
    const [history , setHistory] = useState<History>([]);
    let [currentVersion, setCurrentVersionStatus] = useState<number | null>(null);

    function addHistory (generationType: string, updateInstruction: string, referenceImages: string[], initText: string, code: string) {
        if (generationType === "create") {
            setHistory([
              {
                type: "ai_create",
                parentIndex: null,
                code,
                inputs: { 
                  image_url: referenceImages[0],
                  initText
                },
              },
            ]);
            setCurrentVersionStatus(0);
          } else {
            setHistory((prev) => {
              // Validate parent version
              if (currentVersion === null) {
                toast.error(
                  "No parent version set. Contact support or open a Github issue."
                );
                return prev;
              }
  
              const newHistory: History = [
                ...prev,
                {
                  type: "ai_edit",
                  parentIndex: currentVersion,
                  code,
                  inputs: {
                    prompt: updateInstruction,
                  },
                },
              ];
              setCurrentVersionStatus(newHistory.length - 1);
              return newHistory;
            });
        }
    }
    const updateHistoryScreenshot = (img: string, version?: number) => {
      console.log('*************2333', currentVersion);  
      setHistory((prevState) => {
          const newHistory = [...prevState];
          const index = version || currentVersion || 0;
          console.log('*************22', currentVersion);
          if (index !== -1 && newHistory) {
            newHistory[index].screenshot = img;
          }
          return newHistory;
        });
    }
   

    function setCurrentVersion(version: number | null) {
        currentVersion = version;
        setCurrentVersionStatus(version)
    }

    return (
        <HistoryContext.Provider
          value={{
            history,
            currentVersion,
            setCurrentVersion,
            addHistory,
            updateHistoryScreenshot
          }}
        >
          {children}
        </HistoryContext.Provider>
    );
}