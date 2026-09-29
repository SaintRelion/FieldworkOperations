import { SpecialHeader } from "@/components/SpecialHeader";
import { Outlet } from "react-router-dom";

const BaseLayout = () => {
  return (
    <SpecialHeader>
      <Outlet />
    </SpecialHeader>
  );
};
export default BaseLayout;
