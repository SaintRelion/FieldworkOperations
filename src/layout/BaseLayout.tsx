import { SpecialHeader } from "@/components/SpecialHeader";
import { Outlet } from "react-router-dom";

const BaseLayout = () => {
  return (
    <div className="flex">
      <SpecialHeader>
        <Outlet />
      </SpecialHeader>
    </div>
  );
};
export default BaseLayout;
