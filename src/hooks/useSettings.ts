import { useStore } from "../stores/RootStore";

export function useSettings() {
  const { settingsStore } = useStore();
  return settingsStore;
}
