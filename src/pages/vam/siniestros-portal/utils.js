import * as yup from "yup";
import { REQUERIDO } from "../../../util/General";
import moment from "moment";

export const TIPOS_RECLAMO = {
  preAutorizacion: "PRE_AUTORIZACION",
  medicinaContinua: "MEDICINA_CONTINUA",
};

const getDaysBetweenDates = (date1, date2) => {
  if (date1 instanceof Date && date2 instanceof Date) {
    const moment1 = moment(date1).startOf("day");
    const moment2 = moment(date2).startOf("day");
    return moment2.diff(moment1, "days");
  }
  return -1;
};

export const v_filtro = yup.object().shape({
  fcCreacionDesde: yup.date().required(REQUERIDO).typeError("Fecha inválida"),
  fcCreacionHasta: yup
    .date()
    .required(REQUERIDO)
    .test(
      "test fcCreacionHasta",
      "Fecha inválida - Debe ser mayor o igual a Fc.Creación Desde",
      (value, context) => {
        const fcDdesde = context.parent.fcCreacionDesde;
        return getDaysBetweenDates(fcDdesde, value) >= 0;
      }
    )
    .typeError("Fecha inválida"),
  fcIncurrenciaDesde: yup
    .date()
    .required(REQUERIDO)
    .typeError("Fecha inválida"),
  fcIncurrenciaHasta: yup
    .date()
    .required(REQUERIDO)
    .test(
      "test fcincurrenciahasta",
      "Fecha inválida - Debe ser mayor o igual a Fc.Incurrencia Desde",
      (value, context) => {
        const fcDdesde = context.parent.fcIncurrenciaDesde;
        return getDaysBetweenDates(fcDdesde, value) >= 0;
      }
    )
    .typeError("Fecha inválida"),
});

export const v_comentario = yup.object().shape({
  comentario: yup.string().when("estado", {
    is: "INGRESADO",
    then: yup.string().max(250, "Máximo 250 caracteres"),
    otherwise: yup
      .string()
      .required(REQUERIDO)
      .max(250, "Máximo 250 caracteres"),
  }),
});

let now = new Date();
now.setHours(23, 59, 59, 0);

let initDay = new Date();
initDay.setHours(0, 0, 0, 0);

export const v_siniestro = yup.object().shape({
  cdAseguradora: yup.string().required(REQUERIDO),
  cdRamo: yup.string().required(REQUERIDO),
  cdAsegurado: yup.string().required(REQUERIDO),
  cdIncapacidad: yup.string().required(REQUERIDO),
  tpSiniestro: yup.string().required(REQUERIDO),
  valCirugia: yup.number().when(["tpSiniestro"], {
    is: (tpSiniestro) => TIPOS_RECLAMO.preAutorizacion === tpSiniestro,
    then: yup.number().required(REQUERIDO).min(0.01, "Debe ser mayor a 0"),
  }),
  fcAlcance: yup.date().when(["tpSiniestro"], {
    is: (tpSiniestro) => TIPOS_RECLAMO.preAutorizacion !== tpSiniestro,
    then: yup
      .date()
      .required(REQUERIDO)
      .typeError(REQUERIDO)
      .max(now, "Fecha inválida - No debe ser mayor a la fecha actual"),
  }),
  fcProcedimiento: yup.date().when(["tpSiniestro"], {
    is: (tpSiniestro) => TIPOS_RECLAMO.preAutorizacion === tpSiniestro,
    then: yup
      .date()
      .required(REQUERIDO)
      .typeError(REQUERIDO)
      .min(initDay, "Fecha inválida - No debe ser menor a la fecha actual"),
  }),
});

export const getMomentDate = (date) => {
  if (date instanceof Date) return moment(date);
  if (typeof date === "string") return moment(date).format("YYYY-MM-DD");
  return date;
};

export const validateTimeBetweenDates = (f1, f2) => {
  const momentF1 = getMomentDate(f1);
  const momentF2 = getMomentDate(f2);
  const daysExpire = 365;
  const days = momentF2.diff(momentF1, "days");
  return days > daysExpire;
};
export const defaultFilter = (user, isEjecutivo, isAdmin) => {
  return {
    cedula: isAdmin || isEjecutivo ? "" : user.cedula,
    poliza: null,
    cdRamo: 0,
    cdEstado: 0,
    cdCompania: user.cdCompania,
    fcCreacionDesde: firstDayMonth(),
    fcCreacionHasta: lastDayMonth(),
    fcIncurrenciaDesde: firstDayMonth(),
    fcIncurrenciaHasta: lastDayMonth(),
    cdReclamo: 0,
    cdContratante: 0,
    cdEjecutivo: isEjecutivo ? user.cdEjecutivoAdm : 0,
    pageSize: 10,
    page: 0,
    sorted: [],
  };
};
export const defaultNuevoSiniestroFilter = () => {
  return {
    cdCliente: "%",
    poliza: null,
    numSiniestro: null,
    año: null,
    cdAseguradora: "%",
    cdAgente: "%",
    cdEstado: "%",
    cdRamo: "%",
    cdSucursal: "%",
    cdUsuario: "%",
    fcIngreso: firstDayMonth(),
    fcEvento: firstDayMonth(),
    fcRecepcion: firstDayMonth(),
    fcGestion: firstDayMonth(),
    cdSubarea: "%",
    cdPrioridad: "%",
    cdDiagnostico: "%",
    cdPlaca: null,
    cdTaller: "%",
  };
};
export const defaultNuevoSiniestro = () => {
  return {
    cdCliente: null,
    cdAseguradora: null,
    cdSucursal: null,
    fcRecepcion: firstDayMonth(),
    cdRamo: null,
    poliza: null,
    fcEvento: firstDayMonth(),
    cdAsegurado: null,
    cdDiagnostico: null,
    placa: null,
    cdTaller: null,
    usuario: "broker",
    cdRC: null,
  };
};

export const defaultIncapSiniestroPortal = () => {
  return {
    cdIncSiniestro: null,
    cdHospital: null,
    cdIncapacidad: null,
    valorReclamoPortal: 0,
    tpSiniestro: null,
    obsIncapacidad: null,
    estado: null,
    item: 0,
    fcLiquida: new Date(),
    carta: null,
    fcUltimodoc: new Date(),
    fcAlcance: null,
    fcRecepcionLiq: new Date(),
    usuario: null,
    cerrado: null,
    zohoId: null,
    observacionesEstados: "", //estado inicial
    estadoPortal: "POR_REVISAR",
    fcPrimeraFactura: new Date(),
  };
};

export const defaultSiniestroPortal = () => {
  return {
    numSiniestro: null,
    cdReclamo: null,
    cdTabRubro: null,
    cdAseguradora: null,
    cdRamo: null,
    cdCompania: null,
    cdRamoCotizacion: null,
    fcCreacion: new Date(),
    refAviso: null,
    cdAsegurado: null,
    fcSiniestro: new Date(),
    causa: null,
    obsSiniestro: null,
    poliza: null,
    cdUsuario: null,
    numAseguradora: null,
    cdCliente: null,
    anoSiniestro: new Date().getFullYear(),
    flgAmv: 1, //por defecto
    cdAseguradoTit: null,
    cdAgenteSinies: null,
    fcRecpcionBrk: null,
    rucCedBenef: null,
    nmBeneficiario: null,
    fcNacBenef: null,
    fcNotificacion: null,
    alcance: "N",
  };
};

export const defaultSiniestro = () => {
  return {
    ...defaultSiniestroPortal(),
    ...defaultIncapSiniestroPortal(),
    ...defaultObjSiniestro(),
    ...defaultSegSiniestro(),
    ...defaultSiniestroPreAutorizado(),
  };
};

export const defaultObjSiniestro = () => {
  return {
    cdObjSiniestro: null,
    dscObjeto: null,
    cdObjeto: null,
    valAsegurado: null,
    clAsegurado: null,
    cdUbicacion: null,
    cdPlan: null,
    cdObjOrigen: null,
    cdRamCotOrigen: null,
  };
};

export const defaultSegSiniestro = () => {
  return {
    cdSegSiniestro: null,
    fcSeguimiento: new Date(),
    observacion: null,
    cdEstSiniestro: 1, //estado registrado
    cdIncSiniestro: null, //llave primaria de incap_siniestro
    cdSubestado: null,
    activo: 1,
  };
};

export const defaultSiniestroPreAutorizado = () => {
  return {
    fcProcedimiento: null,
    valCirugia: 0,
  };
};

function firstDayMonth() {
  let date = new Date();
  date.setFullYear(date.getFullYear());
  return date;
}

function lastDayMonth() {
  return new Date();
}

export const calcularDias = (fc) => {
  try {
    if (fc) {
      if (typeof fc === "string") fc = moment(fc).format("YYYY-MM-DD");
      return moment().diff(fc, "days");
    }
  } catch (ignore) {}
  return "";
};

export const isBefore90Days = (dateSelected) => {
  const days = calcularDias(dateSelected);
  return days > SINIESTRO_EXPIRED_DAYS;
};

export const TIPOS = [
  { value: "AMBULATORIO", label: "Ambulatorio" },
  { value: TIPOS_RECLAMO.preAutorizacion, label: "Pre autorización" },
  { value: "HOSPITALARIO", label: "Hospitalario" },
  { value: TIPOS_RECLAMO.medicinaContinua, label: "Medicina Continua" },
];

export const ESTADOS = [
  { value: "TODOS", label: "TODOS" },
  { value: "OPC1", label: "OPC1" },
  { value: "OPC2", label: "OPC2" },
];

export const defaultEstado = (estado, user, com = "") => {
  return {
    estado,
    userId: user.id,
    fecha: new Date(),
    comentario: com,
  };
};

export const ESTADOS_CLASS_VALUES = {
  aprobado: "APROBADO",
  porRevisar: "POR_REVISAR",
  ingresado: "INGRESADO",
  devuelto: "DEVUELTO",
  rechazado: "RECHAZADO",
  porRegularizar: "POR_REGULARIZAR",
  documentoAdicional: "DOCUMENTO_ADICIONAL",
};
export const ESTADOS_CLASS_LABEL = [
  { value: ESTADOS_CLASS_VALUES.aprobado, label: "APROBADO" },
  { value: ESTADOS_CLASS_VALUES.porRevisar, label: "POR REVISAR" },
  { value: ESTADOS_CLASS_VALUES.ingresado, label: "INGRESADO" },
  { value: ESTADOS_CLASS_VALUES.devuelto, label: "DEVUELTO" },
  { value: ESTADOS_CLASS_VALUES.porRegularizar, label: "POR REGULARIZAR" },
  { value: ESTADOS_CLASS_VALUES.rechazado, label: "RECHAZADO" },
  { value: ESTADOS_CLASS_VALUES.documentoAdicional, label: "DOC ADICIONAL" },
];
export const ESTADOS_CLASS = [
  { value: ESTADOS_CLASS_VALUES.aprobado, label: "tr-primary" },
  { value: ESTADOS_CLASS_VALUES.porRevisar, label: "tr-light" },
  { value: ESTADOS_CLASS_VALUES.ingresado, label: "tr-light" },
  { value: ESTADOS_CLASS_VALUES.devuelto, label: "tr-warning" },
  { value: ESTADOS_CLASS_VALUES.porRegularizar, label: "tr-warning" },
  { value: ESTADOS_CLASS_VALUES.rechazado, label: "tr-danger" },
  { value: ESTADOS_CLASS_VALUES.documentoAdicional, label: "tr-alternative" },
];
export const ESTADOS_CLASS_IMAGEN = [
  {
    value: ESTADOS_CLASS_VALUES.aprobado,
    label: "uqai-estado-aprobado text-primary",
  },
  {
    value: ESTADOS_CLASS_VALUES.porRevisar,
    label: "uqai-estado-revisar text-light",
  },
  {
    value: ESTADOS_CLASS_VALUES.ingresado,
    label: "uqai-estado-revisar text-light",
  },
  {
    value: ESTADOS_CLASS_VALUES.devuelto,
    label: "uqai-estado-devuelto text-warning",
  },
  {
    value: ESTADOS_CLASS_VALUES.porRegularizar,
    label: "uqai-estado-devuelto text-warning",
  },
  {
    value: ESTADOS_CLASS_VALUES.rechazado,
    label: "uqai-estado-rechazado text-danger",
  },
  {
    value: ESTADOS_CLASS_VALUES.porRegularizar,
    label: "uqai-estado_doc_adicional text-alternative",
  },
];

export const SINIESTRO_EXPIRED_DAYS = 90;

//Provitional data Siniestros
export const provitionalSiniestros = {
  numSiniestro: 1,
  cdRamo: "Ramo",
  fcEvento: "2022-12-31T10:30:00Z",
  fcRecepcion: "2022-12-31T10:30:00Z",
  fcIngreso: "2022-12-31T10:30:00Z",
  asegurado: "NOMBRE NOMBRE APELLIDO APELLIDO",
  contratante: "CONTRATANTE",
  subAgente: "SUBAGENTE",
  poliza: "POLIZAS",
  aseguradora: "ASEGURADO",
  diagnostico: "DIAGNOSTICO",
  placa: "PLACA",
  taller: "TALLER",
  fcUltGestion: "2022-12-31T10:30:00Z",
  estadoPortal: "POR_REVISAR",
  commentario: "Esto es un comentario del estado del sisniestro",
  usuario: "USUARIO",
};

export const ESTADOS_SELECTS = [
  {
    label: "RECEPCION",
  },
  {
    label: "NOTIFICADO ASEGURADORA",
  },
  {
    label: "INGRESADO ASEGURADORA",
  },
  {
    label: "INSEPECCION",
  },
  {
    label: "DOCUMENTACION PENDIENTE",
  },
  {
    label: "VALORACION DE DAÑOS",
  },
  {
    label: "VALIDACION DE DAÑOS",
  },
  {
    label: "REVISIÓN ASEGURADORA",
  },
  {
    label: "APROBADO",
  },
  {
    label: "LIQUITDACION ",
  },
  {
    label: "INDEMNIZADO",
  },
];
export const RAMO_SELECTS = [
  {
    label: "ATENCIONES",
  },
  {
    label: "BANCOS E INSTITUCIONES FINANCIERAS",
  },
  {
    label: "BUEN USO DE CARTA CREDITO",
  },
  {
    label: "BUEN USO DE MATERIALES ",
  },
  {
    label: "BUEN USO DEL ANTICIPO ",
  },
  {
    label: "BUENA CALIDAD DE MATERIALES",
  },
  {
    label: "CASCO AEREO",
  },
  {
    label: "CASCO DE BUQUES",
  },
  {
    label: "CRIME INFORMATICO",
  },
  {
    label: "CUMPLIMENTIO DE CONTRATO ",
  },
  {
    label: "DEDUCIBLE - VEHICULOS",
  },
];

export const SUCURSAL_SELECTS = [
  {
    label: "SEGUSUAREZ AMB",
  },
  {
    label: "SEGUSUAREZ GYE",
  },
  {
    label: "SEGUSUAREZ UIO",
  },
  {
    label: "SEGUSUAREZ CUE",
  },
  {
    label: "SEGUSUAREZ UIO SUR ",
  },
];

export const PRIORIDAD_SELECTS = [
  { color: "none", value: "TODOS", label: "TODOS" },
  { color: "none", value: 0, label: "NORMAL" },
  { color: "#FFEC0F", value: 1, label: "MEDIA" },
  { color: "#FF1C1C", value: 2, label: "ALTA" },
];

export const PRIORIDAD_INTERVALES = {
  gen: {
    masivos: {
      normal: {
        diasInicio: 0,
        diasFinal: 25,
      },
      media: {
        diasInicio: 26,
        diasFinal: 45,
      },
      alta: {
        diasInicio: 46,
      },
    },
    normal: {
      diasInicio: 0,
      diasFinal: 30,
    },
    media: {
      diasInicio: 31,
      diasFinal: 60,
    },
    alta: {
      diasInicio: 61,
    },
  },
  vam: {
    masivos: {
      normal: {
        diasInicio: 0,
        diasFinal: 25,
      },
      media: {
        diasInicio: 26,
        diasFinal: 45,
      },
      alta: {
        diasInicio: 46,
      },
    },
    normal: {
      diasInicio: 0,
      diasFinal: 15,
    },
    media: {
      diasInicio: 15,
      diasFinal: 30,
    },
    alta: {
      diasInicio: 31,
    },
  },
};
