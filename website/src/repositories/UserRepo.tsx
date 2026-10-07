import { registerResource } from "@saintrelion/data-access-layer";

registerResource({
  name: "user",
  endpoint: "user/",
  store: "User",
});
