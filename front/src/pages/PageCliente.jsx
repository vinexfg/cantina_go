import { useState } from "react";
import NavBar from "../components/NavBar";
import NavBarInferior from "../components/NavBarInferior";
import MainMenu from "../components/MainMenu";
import MainPerfil from "../components/MainPerfil";

function PageCliente() {
  return (
    <>
      <NavBar />
      {/* <MainMenu /> */}
      <MainPerfil />
      <NavBarInferior />
    </>
  );
}

export default PageCliente;
