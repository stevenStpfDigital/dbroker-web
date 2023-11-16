import { api_dbroker_url, api_url } from "../../util/General";

export const routes = {
  root: api_url(),
  base: api_url() + "/vam",
  api: api_url() + "/vam",
  gen: api_url() + "/gen",
  dbroker: api_dbroker_url(),
};

export const app = {
  name: "Asistencia Médica",
};
