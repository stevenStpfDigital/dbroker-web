import siniestrosReducer from "pages/vam/siniestros-portal/redux/reducer";
import loginReducer from "./pages/sec/redux/reducer";

const initState = {};

export default (state = initState, action) => {
  return {
    ...state,
    user: loginReducer(state.user, action),
    siniestros: siniestrosReducer(state.siniestros, action),
  };
};
