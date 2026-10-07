import { registerResource } from "@saintrelion/data-access-layer";

registerResource({
  name: "notification",
  endpoint: "notification/",
  store: "Notification",
});
