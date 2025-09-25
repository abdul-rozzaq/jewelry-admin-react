import { Riple } from "react-loading-indicators";

const LoadingComponent = () => {
  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <Riple color={["#32cd32", "#327fcd", "#cd32cd", "#cd8032"]} />{" "}
    </div>
  );
};

export default LoadingComponent;
