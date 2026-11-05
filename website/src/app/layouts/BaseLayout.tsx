import { SpecialHeader } from "@/app/components/SpecialHeader";
import { DemoBanner } from "@/shared/components/demo/DemoBanner";
import { Outlet } from "react-router-dom";

const BaseLayout = () => {
  return (
    <SpecialHeader>
      <DemoBanner />
      <Outlet />
    </SpecialHeader>
  );
};
export default BaseLayout;
