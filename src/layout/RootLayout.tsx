import SpecialHeader from "@/components/SpecialHeader";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="flex">
      <SpecialHeader>
        <Outlet />
      </SpecialHeader>
    </div>
  );
};
export default RootLayout;
