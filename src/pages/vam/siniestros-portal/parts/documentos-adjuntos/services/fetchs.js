import axios from "axios";
import {routes} from "../../../../../gen/UtilsGeneral";

export const fetchVerFactura = (pathFile) => {
    return axios.get(routes.api + '/documentos-digitales/ver-factura', {params: {nm: pathFile}});
}