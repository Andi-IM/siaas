import { invoke } from "@tauri-apps/api/core";

export interface SelectedFile {
  path: string;
  name: string;
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

const safeInvoke = async <T,>(cmd: string, args?: any): Promise<T> => {
  if (typeof window !== "undefined" && (window as any).__E2E_MOCK_INVOKE__) {
    return (window as any).__E2E_MOCK_INVOKE__(cmd, args);
  }
  return invoke<T>(cmd, args);
};

/**
 * Global file picker utility for the UI.
 * Provides a predictable Promise-based interface.
 */
export const filePicker = {
  /**
   * General purpose file picker.
   */
  pickFile: async (title: string, filters: FileFilter[]): Promise<SelectedFile | null> => {
    try {
      // We will implement this command in Rust
      return await safeInvoke<SelectedFile | null>("open_file_dialog", {
        title,
        filters,
      });
    } catch (error) {
      console.error("Failed to pick file:", error);
      return null;
    }
  },

  /**
   * General purpose file saver.
   */
  saveFile: async (title: string, filters: FileFilter[], defaultName?: string): Promise<SelectedFile | null> => {
    try {
      // We will implement this command in Rust
      return await safeInvoke<SelectedFile | null>("save_file_dialog", {
        title,
        filters,
        defaultName,
      });
    } catch (error) {
      console.error("Failed to save file:", error);
      return null;
    }
  },

  /**
   * Preset for Excel import.
   */
  pickExcel: async (): Promise<SelectedFile | null> => {
    return filePicker.pickFile("Pilih Berkas Excel", [
      { name: "Excel Files", extensions: ["xlsx"] }
    ]);
  },

  /**
   * Preset for SQLite database.
   */
  pickDatabase: async (): Promise<SelectedFile | null> => {
    return filePicker.pickFile("Pilih Berkas Database", [
      { name: "SQLite Database", extensions: ["db"] }
    ]);
  }
};
