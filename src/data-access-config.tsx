import { setAuthLibClientAppName } from "@saintrelion/auth-lib";
import {
  setDataAccessLayerClientAppName,
  setGlobalMode,
} from "@saintrelion/data-access-layer";

setAuthLibClientAppName("ojt");
setDataAccessLayerClientAppName("ojt");
setGlobalMode("firebase");
