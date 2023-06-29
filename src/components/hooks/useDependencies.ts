import { useContext } from "react";
import { DependenciesContainer, DependenciesContext } from "../di/DependenciesContext";

export default function useDependencies(): DependenciesContainer {
  const dependencies = useContext(DependenciesContext);

  if (!dependencies) {
    throw Error("Dependencies context not initialized!");
  }

  return dependencies;
}
