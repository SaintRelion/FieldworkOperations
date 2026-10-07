import { registerResource } from "@saintrelion/data-access-layer";

registerResource({
  name: "attendance",
  endpoint: "attendance/",
  store: "Attendance",
});
