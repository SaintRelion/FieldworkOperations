import { registerResource } from "@saintrelion/data-access-layer";

registerResource({
  name: "settings",
  endpoint: "settings/",
  store: "Settings",
});
