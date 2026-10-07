import {
  setAuthAPIBaseUrl,
  setAuthLibClientAppName,
  setAuthMode,
} from "@saintrelion/auth-lib";
import {
  setDALClientAppName,
  setGlobalMode,
} from "@saintrelion/data-access-layer";

// AUTH-LIB
setAuthLibClientAppName("ojt");
setAuthAPIBaseUrl("");
setAuthMode("firebase");

// DAL
setDALClientAppName("ojt");
setGlobalMode("firebase");
