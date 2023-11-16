import React from "react";
import { Header } from "./Header";
import background2 from "../assets/images/plataforma_fondo2.png";
import { HeaderDBroker } from "./HeaderDBroker";
import MenuDBroker from "components/MenuDBroker";

export const PagesDbroker = ({ children, title }) => {
  return (
    <>
      <div
        className="bg-fullscreen bg-img-center"
        style={{ backgroundImage: `url(${background2})` }}
      />
      <div
        className="vh-100 d-flex flex-column "
        //  id="outer-container"
      >
        {/* <button
          className="position-absolute top-50 start-0 translate-middle-y btn btn-primary"
          style={{ zIndex: 1 }}
        >
          MENU 1
        </button> */}
        {/* <MenuDBroker
          pageWrapId={"page-wrap"}
          outerContainerId={"outer-container"}
        /> */}

        <div
        //id="page-wrap"
        >
          <HeaderDBroker title={title} />
          {children}
        </div>
      </div>
    </>
  );
};

export default PagesDbroker;
