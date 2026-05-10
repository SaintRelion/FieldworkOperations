import { registerResource } from "@saintrelion/data-access-layer";
registerResource({
  name: "accomplishment",
  endpoint: "accomplishments/",
  store: "Accomplishments",
});
