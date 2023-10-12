import React from 'react';
import Polizas from "./polizas/Polizas";
import Siniestros from "./siniestros/Siniestros";
import AdminPolizas from "./polizas/AdminPolizas";
import VisorUsuarios from "../user/VisorUser";
import {GestorUsuario} from "./GestorUsuario";
import {Route, Switch} from "react-router-dom";
import {useSelector} from "react-redux";
import {Perfil} from "../user/Perfil";
import {FiltrosSiniestros} from "./siniestros-portal/FiltrosSiniestros";
import {SiniestroPortalEdit} from "./siniestros-portal/SiniestroPortalEdit";
import {Home} from "../home/Home";


export const RoutesPagesVam = () => {
    const user = useSelector(state => state.user);

    return (
        <Switch>
            <Route path="/vam/home" exact component={Home}/>
            <Route exact path="/vam/siniestros-reportados" component={FiltrosSiniestros}
                   title={"Siniestros Reportados"}/>
   
            <Route exact path="/vam/reportar-siniestro/:cdComp/:cdReclamo/:cdIncSiniestro?"
                   component={SiniestroPortalEdit}
                   title={"Portal Siniestros"}/>
            <Route exact path="/vam/perfil" component={Perfil} title={"Datos del Titular"}/>

            <Route exact path="/vam/polizas" component={Polizas}
                   title={"Pólizas de Seguros - " + user.nm + ' ' + user.ap}/>
            <Route exact path="/vam/siniestros" component={Siniestros}
                   title={"Consulta Siniestros - " + user.nm + ' ' + user.ap}/>
            <Route exact path="/vam/admin" component={AdminPolizas} title={"Administrador selección"}/>
            <Route exact path="/vam/visor" component={VisorUsuarios} title={"Usuarios"}/>
            <Route exact path="/vam/usuarios-gestor" component={GestorUsuario} title={"Gestor Usuario"}/>
        </Switch>
    )
}