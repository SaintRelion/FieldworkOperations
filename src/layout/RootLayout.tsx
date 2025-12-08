import SpecialHeader from "@/components/SpecialHeader";
import { useIsPathPublic } from "@saintrelion/routers";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  const isPathPublic = useIsPathPublic();

  return (
    <>
      {isPathPublic != "" ? (
        <Outlet />
      ) : (
        <div className="flex">
          <SpecialHeader>
            <Outlet />
          </SpecialHeader>
        </div>
      )}
    </>
  );
};
export default RootLayout;
