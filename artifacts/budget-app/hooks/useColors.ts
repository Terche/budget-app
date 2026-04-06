import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the active color palette + radius for the current theme and mode.
 * Theme and mode are controlled by ThemeContext (user-selectable).
 */
export function useColors() {
  const { colors } = useTheme();
  return colors;
}
