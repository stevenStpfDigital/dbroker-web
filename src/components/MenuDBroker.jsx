import React, { useState } from "react";
// import { slide as Menu } from "react-burger-menu";
// import { push as MenuPush } from "react-burger-menu";
import { Dropdown, DropdownButton } from "react-bootstrap";

const MenuDBroker = (pageWrap, outerContainer) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleMenuClick = (option) => {
    setSelectedOption(option);
  };

  return (
    // <MenuPush
    //   customBurgerIcon={
    //     <div className="iconBurgerContainer ">
    //       <i className="icon-uqai uqai-flecha-derecha customBurgerIcon "></i>
    //     </div>
    //   }
    //   pageWrapId={pageWrap}
    //   outerContainerId={outerContainer}
    // >
    //   <div>
    //     <h3>Menú</h3>
    //     <DropdownButton
    //       className="w-100"
    //       id="menu-dropdown"
    //       title={selectedOption || "Siniestros"}
    //       onSelect={handleMenuClick}
    //     >
    //       <Dropdown.Item eventKey="Siniestros Pendientes">
    //         Siniestros Pendientes
    //       </Dropdown.Item>
    //       <Dropdown.Item eventKey="Reporte de Siniestros">
    //         Reporte de Siniestros
    //       </Dropdown.Item>
    //     </DropdownButton>
    //   </div>
    // </MenuPush>
    <></>
  );
};

export default MenuDBroker;
