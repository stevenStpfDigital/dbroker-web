import React, { useEffect, useRef, useState } from "react";
import Alerts from "../../../components/Alerts";
import { Card, CardBody, CardHeader, Modal, ModalBody } from "reactstrap";
import UqaiFormik from "../../../components/UqaiFormik";
import { UqaiField } from "../../../components/UqaiField";
import { useSelector, useDispatch } from "react-redux";
import {
  calcularDias,
  defaultFilter,
  defaultNuevoSiniestro,
  defaultNuevoSiniestroFilter,
  ESTADOS_CLASS,
  ESTADOS_SELECTS,
  PRIORIDAD_INTERVALES,
  PRIORIDAD_SELECTS,
  provitionalSiniestros,
  RAMO_SELECTS,
  SINIESTRO_EXPIRED_DAYS,
  SUCURSAL_SELECTS,
  TIPOS,
  v_filtro,
  validateTimeBetweenDates,
} from "./utils";
import ReactTable from "react-table";
import moment from "moment/moment";
import Select from "react-select";
import axios from "axios";
import { pos } from "../../../util/General";
import { routes as routesVam } from "../UtilsVam";
import {
  UqaiCalendario,
  formatDate,
  formatDateDBroker,
} from "../../../components/UqaiCalendario";
import {
  find_ram_grupos,
  find_ramos,
  find_ramos_ramgrp,
} from "../../../api/CacheApi";
import { ComboContratante } from "./parts/ComboContratante";
import { ComboAsegurados } from "./parts/ComboAsegurados";
import { Link, useHistory } from "react-router-dom";
import { CustomNumberFormat } from "../../../components/CustomNumberFormat";
import { ESTADOS_PORTAL_LISTA } from "./estados_edicion";
import Pages from "../../../layouts/Pages";
import { UqaiModalHeader } from "../../../components/UqaiModal";
import { Estados } from "./parts/Estados";
import { AccionButton } from "./parts/documentos-adjuntos/AccionesAdjuntos";
import { LoadingContextProvider } from "./parts/documentos-adjuntos/context/LoadingContextProvider";
import { NoDataResult } from "../../../components/NoDataResult";
import PagesDbroker from "../../../layouts/PagesDBroker";
import { TableColumnsSiniestros } from "./parts/TableColumns";
import { Offcanvas } from "react-bootstrap";
import "react-table/react-table.css";
import DBrokerField from "components/DBrokerField";
import AsyncSelect from "react-select/async";
import { save_data_storage } from "./redux/actions";

export const NuevoFiltrosSiniestros = () => {
  const [data, setData] = useState({
    data: [],
    // pages: 0,
    // page: 0,
    loading: false,
    pageSize: 10,
    sorted: [],
  });
  const user = useSelector((state) => state.user);
  const isAdmin = user.isAdmin;
  const isEjecutivo = user.isEjecutivo;
  const isCliente = user.isUser;
  const history = useHistory();

  const [query, setQuery] = useState(defaultFilter(user, isEjecutivo, isAdmin));

  const [newQuery, setNewQuery] = useState(defaultNuevoSiniestroFilter());
  const [newSiniestroValues, setNewSiniestroValues] = useState(
    defaultNuevoSiniestro()
  );

  const defaultOptions = [{ value: 0, label: "TODOS" }];
  const [reset, setReset] = useState(false);

  const [aseguradora, setAseguradora] = useState([]);
  const [aseguradoraSiniestro, setAseguradoraSiniestro] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [estSiniestro, setEstSiniestro] = useState([]);
  const [ramos, setRamos] = useState([]);
  const [sucursal, setSucursal] = useState([]);
  const [sucursalSiniestro, setSucursalSiniestro] = useState([]);
  const [usuariosD, setUsuariosD] = useState([]);
  const [subArea, setSubArea] = useState([]);
  const [diagnostico, setDiagnostico] = useState([]);
  const [taller, setTaller] = useState([]);

  const [ejecutivos, setEjecutivos] = useState([]);
  const [first, setFirst] = useState(true);
  const [newSiniestro, setNewSiniestro] = useState(false);

  const alert = useRef(null);
  const form = useRef();
  const form2 = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("USE EFFECT");
    setQuery(defaultFilter(user, isEjecutivo, isAdmin));
    setNewQuery(defaultNuevoSiniestroFilter());
    setNewSiniestroValues(defaultNuevoSiniestro());

    // getRamos();
    // getEjecutivos();

    getAseguradora();
    getAgentes();
    getEstSiniestro();
    getRamosDBroker();
    getSucursal();
    getUsuariosD();
    getSubArea();

    // getDiagnostico();
    // getTaller();
  }, [user?.cedula]);

  function replaceNullsWithPercentage(object) {
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        if (object[key] === null) {
          object[key] = "%";
        }
      }
    }
    return object;
  }

  const fetchDataDbroker = (q, actions) => {
    setData({
      loading: true,
      ...data,
    });

    let queryDbroker = Object.assign({}, q);
    queryDbroker.anio = queryDbroker.año;
    delete queryDbroker.año;
    queryDbroker.fcIngreso = formatDateDBroker(queryDbroker.fcIngreso);
    queryDbroker.fcEvento = formatDateDBroker(queryDbroker.fcEvento);
    queryDbroker.fcRecepcion = formatDateDBroker(queryDbroker.fcRecepcion);
    queryDbroker.fcGestion = formatDateDBroker(queryDbroker.fcGestion);

    console.log("QUERY: ", queryDbroker);
    axios.post(`${routesVam.dbroker}/Siniestros`, queryDbroker).then((res) => {
      console.log("SINIESTROS RESPONSE: ", res);
      setData({
        data: res.data,
        loading: false,
        pageSize: 10,
      });
    });
    actions.setSubmitting(false);
  };
  const onSubmit = (newValues, actions) => {
    const formattedValues = replaceNullsWithPercentage(newValues);

    // formatDateDBroker(formattedValues.fcIngreso)
    // formatDateDBroker(formattedValues.fcEvento)
    // formatDateDBroker(formattedValues.fcRecepcion)
    // formatDateDBroker(formattedValues.fcGestion)

    // setQuery({ ...newValues, page: 0 });
    // fetchData({ ...newValues, page: 0 });
    // actions?.setSubmitting(false);
    // setFirst(false);
    fetchDataDbroker(formattedValues, actions);
  };

  const handleResetForm = (resetForm) => {
    setReset(true);
    setData({ data: [], pages: 0, page: 0, loading: false, pageSize: 10 });
    // setNewQuery(defaultNuevoSiniestro());
    resetForm();
  };

  function noDataComponent() {
    return <NoDataResult first={first} />;
  }

  const getAseguradora = () => {
    axios.get(`${routesVam.dbroker}/aliasAseguradora`).then((res) => {
      const dataWithTodos = [
        { ID: "%", ALIAS: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];
      // console.log("RESPONSE ASEGURADO: ", res.data);
      setAseguradora(dataWithTodos);
      setAseguradoraSiniestro(res.data);
    });
    // .catch((error) => {
    //   console.log("LLAMADO A: ", `${routesVam.dbroker}/aliasAseguradora`);
    //   console.log("ERROR RESPONSE:", error);
    // });
  };
  const getAgentes = () => {
    axios.get(`${routesVam.dbroker}/Agentes`).then((res) => {
      const dataWithTodos = [
        { ID: "%", AGENTE: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];
      //  console.log("RESPONSE ASEGURADO: ", res.data);
      setAgentes(dataWithTodos);
    });
  };
  const getEstSiniestro = () => {
    axios.get(`${routesVam.dbroker}/EstadosSiniestros`).then((res) => {
      const dataWithTodos = [
        { CD_EST_SINIESTRO: "%", DSC_ESTADO: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];

      setEstSiniestro(dataWithTodos);
      dispatch(save_data_storage(res.data));
    });
  };
  const getRamosDBroker = () => {
    axios.get(`${routesVam.dbroker}/Ramos`).then((res) => {
      const dataWithTodos = [
        { CD_RAMO: "%", NM_RAMO: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];
      setRamos(dataWithTodos);
      //console.log("dataWithTodos", dataWithTodos);
    });
  };
  const getSucursal = () => {
    axios.get(`${routesVam.dbroker}/Sucursales`).then((res) => {
      const dataWithTodos = [
        { ID: "%", SUCURSAL: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];
      setSucursal(dataWithTodos);
      setSucursalSiniestro(res.data);
    });
  };
  const getUsuariosD = () => {
    axios.get(`${routesVam.dbroker}/Usuarios`).then((res) => {
      const dataWithTodos = [
        { USUARIO: "%", NOMBRE: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];
      setUsuariosD(dataWithTodos);
    });
  };
  const getSubArea = () => {
    axios.get(`${routesVam.dbroker}/Subareas`).then((res) => {
      const dataWithTodos = [
        { ID: "%", SUBAREA: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];
      setSubArea(dataWithTodos);
    });
  };
  const getDiagnostico = () => {
    axios.get(`${routesVam.dbroker}/aliasAseguradora`).then((res) => {
      const dataWithTodos = [
        { ID: "%", AGENTE: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];
      setDiagnostico(res.data);
    });
  };
  const getTaller = () => {
    axios.get(`${routesVam.dbroker}/aliasAseguradora`).then((res) => {
      const dataWithTodos = [
        { ID: "%", AGENTE: "TODOS" },
        ...res.data, // Mantén los elementos existentes
      ];
      setTaller(res.data);
    });
  };

  function calcularDiferenciaEnDias(date) {
    const initialDate = moment(date, "YYYY-MM-DDTHH:mm:ss.SSSZ");
    const actualDate = moment();
    const days = actualDate.diff(initialDate, "days");
    return days;
  }

  const priorityClassName = (data) => {
    const daysDifference = calcularDiferenciaEnDias(data.FC_CREACION);
    const prioridades =
      data.SUBAREA === "MASIVOS"
        ? PRIORIDAD_INTERVALES.gen.masivos
        : PRIORIDAD_INTERVALES.gen;

    if (daysDifference >= 0 && daysDifference <= prioridades.normal.diasFinal) {
      return;
    }

    if (
      daysDifference > prioridades.media.diasInicio &&
      daysDifference <= prioridades.media.diasFinal
    ) {
      return "prioridad-media";
    }

    if (daysDifference > prioridades.alta.diasInicio) {
      return "prioridad-alta";
    }
  };

  return (
    <PagesDbroker title={"Siniestros registrados"}>
      <section className="p-1 p-md-2 p-xl-4 flex-grow-1">
        <div className="container-fluid">
          <Alerts ref={alert} />
          <div>
            <div className="col-12 ">
              <FiltosComponent
                query={newQuery}
                onSubmit={onSubmit}
                handleResetForm={handleResetForm}
                selectsData={{
                  aseguradora: aseguradora,
                  agentes: agentes,
                  estSiniestro: estSiniestro,
                  ramos: ramos,
                  sucursal: sucursal,
                  usuariosD: usuariosD,
                  subArea: subArea,
                  diagnostico: diagnostico,
                  taller: taller,
                }}
              />
              <Card className="shadow">
                <CardHeader
                  className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center  border-primary justify-content-between pt-0 pb-0" //border-bottom
                >
                  <h5 className="fw-bold">
                    <i className="icon-uqai align-middle uqai-lista-siniestros-reportados text-primary me-2"></i>
                    Lista
                  </h5>
                  <div className="col-6 row">
                    <div className="d-flex justify-content-around">
                      <LeyendaColor color={""} txt={`Prioridad Normal`} />
                      <LeyendaColor color={"#FFEC0F"} txt={`Prioridad Media`} />
                      <LeyendaColor color={"#FF1C1C"} txt={`Prioridad Alta`} />
                    </div>
                  </div>

                  <button
                    className="btn btn-info mt-2 mt-sm-0"
                    onClick={() => {
                      setNewSiniestro(true);
                    }}
                  >
                    Nuevo siniestro
                  </button>

                  {newSiniestro && (
                    <>
                      <ModalNewSiniestro
                        open={newSiniestro}
                        setOpen={setNewSiniestro}
                        query={newSiniestroValues}
                        form={form2}
                        selectsData={{
                          aseguradora: aseguradoraSiniestro,
                          sucursal: sucursalSiniestro,
                          ramos: ramos,
                        }}
                      />
                    </>
                  )}
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="row">
                    <div className="col">
                      <ReactTable
                        noDataText={noDataComponent}
                        loadingText={"Cargando..."}
                        rowsText={"filas"}
                        ofText={"de"}
                        previousText={"Anterior"}
                        nextText={"Siguiente"}
                        pageText={"Página"}
                        columns={TableColumnsSiniestros}
                        // manual
                        data={data.data}
                        // pages={data.pages}
                        loading={data.loading}
                        defaultPageSize={10}
                        filterable={true}
                        showPaginationTop
                        showPaginationBottom={false}
                        // onFetchData={(state) =>
                        //   fetchData({
                        //     ...newQuery,
                        //     page: state.page,
                        //     pageSize: state.pageSize,
                        //     sorted: state.sorted,
                        //     filtered: state.filtered,
                        //   })
                        // }
                        getTrProps={(_, rowInfo) => {
                          if (rowInfo) {
                            const isExpired =
                              calcularDias(
                                rowInfo?.original?.fcPrimeraFactura
                              ) > SINIESTRO_EXPIRED_DAYS;
                            return {
                              className: `${rowInfo?.row?._original?.class}
                                                            ${
                                                              isExpired
                                                                ? "text-custom"
                                                                : ""
                                                            }`,
                            };
                          }
                          return {};
                        }}
                        getTdProps={(state, rowInfo, column) => {
                          if (rowInfo && rowInfo.row) {
                            // console.log("RowInfo: ", rowInfo.row);
                            const priority = priorityClassName(
                              rowInfo.row._original
                            );

                            return {
                              onClick: (e, handleOriginal) => {
                                if (column.Header !== "Observación") {
                                  // history.push(
                                  //   `/vam/reportar-siniestro/${rowInfo.original.cdCompania}/${rowInfo.original.cdReclamo}/${rowInfo.original.cdIncSiniestro}`
                                  // );
                                }
                                if (handleOriginal) {
                                  handleOriginal();
                                }
                              },
                              style: {
                                cursor: "pointer",
                              },
                              className: `${priority}`,
                            };
                          } else {
                            return {};
                          }
                        }}
                        // page={data.page}
                        // pageSize={data.pageSize}
                        // onPageChange={(page) => setData({ ...data, page })}
                        // onPageSizeChange={(pageSize, page) => {
                        //   setData({ ...data, page, pageSize });
                        // }}
                        className="-highlight fs-7 mi-div "
                      ></ReactTable>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PagesDbroker>
  );
};

export const LeyendaColor = ({ color, txt }) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          width: "25px",
          height: "25px",
          background: color,
          marginRight: "10px",
          borderRadius: "4px",
        }}
      ></div>
      <span className={"form-label text-bold text-secondary fs-6 mt-1"}>
        {txt}
      </span>
    </div>
  );
};

export const ListObservaciones = ({ txt, icon, ...props }) => {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [newEstado, setNewEstado] = useState(false);

  useEffect(() => {
    if (txt) {
      setList(JSON.parse(txt));
    }
  }, []);

  const defineWidth = (length) => {
    if (length < 50) return "100%";
    if (length < 100) return "200px";
    if (length < 200) return "400px";
    return "500px";
  };

  return (
    <LoadingContextProvider>
      <div className={props?.className ?? "text-center w-100"}>
        <AccionButton
          onClick={() => setOpen(true)}
          title={"Ver historial de estados"}
        >
          <i className={`icon-uqai uqai-${icon ?? "ver"}`} />
        </AccionButton>
        {open && (
          <Modal isOpen={open} toggle={() => setOpen(false)} size="xl" centered>
            <UqaiModalHeader
              toggle={() => setOpen(false)}
              title="Estados del Siniestro"
            />
            <ModalBody>
              <div className="table-responsive">
                <br />
                <table className="table table-borderless table-hover">
                  <thead>
                    <tr className="text-secondary">
                      <th className="bg-white">Fecha</th>
                      <th className="bg-white">Estado</th>
                      <th className="bg-white">Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(list || []).map((x, index) => (
                      <tr key={x.estado}>
                        <td className="w-25" style={{ minWidth: "100px" }}>
                          {x.editable ? (
                            <div>{x.fecha}</div>
                          ) : (
                            <div>
                              {moment(x.fecha)
                                .locale("moment/locale/es")
                                .local()
                                .format("DD-MM-YYYY HH:mm:ss")}
                            </div>
                          )}
                        </td>
                        <td className="w-25" style={{ minWidth: "100px" }}>
                          {x.editable ? (
                            <div>
                              <select
                                value={x.estado}
                                placeholder="estado"
                                onChange={(e) => {
                                  const updatedData = [...list];
                                  updatedData[index].estado = e.target.value;
                                  setList(updatedData);
                                }}
                              >
                                {ESTADOS_SELECTS.map((res, index) => {
                                  return (
                                    <option value={index}>{res.label}</option>
                                  );
                                })}
                              </select>
                            </div>
                          ) : (
                            <div>
                              {
                                ESTADOS_PORTAL_LISTA.find(
                                  (est) => est.value === x.estado
                                )?.label
                              }
                            </div>
                          )}
                        </td>
                        <td className="w-100">
                          <textarea
                            disabled={!x.editable}
                            style={{
                              width: "100%",
                              minWidth: defineWidth(x.comentario?.length),
                            }}
                          >
                            {x.comentario}
                          </textarea>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* {newEstado ? (
                  <div>
                    <button
                      className="btn btn-danger mx-2 mt-2 mt-sm-0"
                      onClick={() => {
                        setNewEstado(false);
                        const updatedList = list.filter(
                          (item) => item.editable !== true
                        );
                        setList(updatedList);
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-alternative mx-2 mt-2 mt-sm-0"
                      onClick={() => {}}
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-info mt-2 mt-sm-0"
                    onClick={() => {
                      const newRow = {
                        estado: "INGRESADO",
                        fecha: moment().format("DD-MM-YYYY HH:mm:ss"),
                        comentario: "",
                        editable: true,
                      };
                      setList([...list, newRow]);
                      setNewEstado(true);
                    }}
                  >
                    Nuevo siniestro estado
                  </button>
                )} */}
              </div>
            </ModalBody>
          </Modal>
        )}
      </div>
    </LoadingContextProvider>
  );
};

const fechaPrimeraFactura = (row) => {
  const fcPrimeraFactura = row?.original?.fcPrimeraFactura;
  const caducado = row?.original?.caducado;
  return (
    <>
      <span
        title={caducado ? "Siniestro caducado" : ""}
        className={caducado ? "siniestro-caducado" : ""}
      >
        {caducado && (
          <>
            <i className="fas fa-circle text-danger" />
            &nbsp;
          </>
        )}
        {!fcPrimeraFactura
          ? ""
          : moment(fcPrimeraFactura)
              .locale("moment/locale/es")
              .local()
              .format("DD/MM/YYYY")}
      </span>
    </>
  );
};
// La función debounce ayuda a limitar la frecuencia de llamadas a loadOptions
function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, arguments), delay);
  };
}

const loadOptionsNew = debounce(async (inputValue, callback) => {
  callback(await getContratantesByInputValue(inputValue));
});

const getContratantesByInputValue = async (inputValue) => {
  if (inputValue.length >= 3) {
    try {
      const response = await axios.get(
        `${routesVam.dbroker}/Clientes/${inputValue}`
      );
      const formatedData = response.data.slice(0, 50).map((result) => ({
        value: result.ID,
        label: `${result.NOMBRES} ${result.APELLIDOS || null}`,
      }));

      return formatedData;
      // Mostrar los resultados en el frontend
    } catch (error) {
      console.error("Error al obtener datos:", error);
      return [];
      // Manejar el error y mostrar un mensaje al usuario si es necesario
    }
  }
};

const FiltosComponent = ({
  query,
  onSubmit,

  handleResetForm,
  selectsData,
}) => {
  const [show, setShow] = useState(false);
  const [valuePrioridad, setValuePrioridad] = useState(PRIORIDAD_SELECTS[0]);
  const [v0, set0] = useState(null);
  const [v1, set1] = useState(selectsData.aseguradora[0]);
  const [v2, set2] = useState(selectsData.agentes[0]);
  const [v3, set3] = useState(selectsData.estSiniestro[0]);
  const [v4, set4] = useState(selectsData.sucursal[0]);
  const [v5, set5] = useState(selectsData.usuariosD[0]);
  const [v6, set6] = useState(selectsData.subArea[0]);
  const [v7, set7] = useState(selectsData.ramos[0]);

  const handleClose = () => setShow(false);
  const toggleShow = () => setShow((s) => !s);
  const form = useRef();
  // console.log("SELECTS DATA: ", selectsData);

  return (
    <>
      <button
        variant="primary"
        onClick={toggleShow}
        className="bm-burger-button text-center"
      >
        <i className="icon-uqai uqai-flecha-derecha text-white"></i>
      </button>

      <Offcanvas
        show={show}
        onHide={handleClose}
        scroll={true}
        backdrop={true}
        className="w-25"
      >
        {/* <Offcanvas.Header closeButton>
          <Offcanvas.Title>Offcanvas</Offcanvas.Title>
        </Offcanvas.Header> */}
        <Offcanvas.Body className="p-0 ">
          <div className="col-12  bg-primary">
            <Card className="shadow">
              <CardHeader className="d-flex align-items-center border-bottom border-primary">
                <h5 className="my-0 fw-bold">
                  <i className="icon-uqai align-middle uqai-filtros text-primary me-2"></i>
                  Filtros
                </h5>
              </CardHeader>
              <CardBody>
                <UqaiFormik
                  initialValues={query}
                  onSubmit={onSubmit}
                  enableReinitialize={true}
                  validateOnChange={false}
                  // validationSchema={v_filtro}
                  ref={form}
                >
                  {({
                    resetForm,
                    submitForm,
                    setFieldValue,
                    values,
                    isSubmitting,
                  }) => {
                    // console.log("FILTRO VALUES: ", values);
                    return (
                      <div className="row gy-3">
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Cliente:
                          </label>
                          <AsyncSelect
                            placeholder="Clientes"
                            value={v0}
                            cacheOptions
                            defaultOptions
                            loadOptions={loadOptionsNew}
                            onChange={(valueSelect) => {
                              setFieldValue("cdCliente", valueSelect.value);
                              set0(valueSelect);
                            }}
                          />
                        </div>

                        <div className="col-6">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Póliza:
                          </label>
                          <UqaiField
                            type="text"
                            name={"poliza"}
                            className={"form-control"}
                            placeholder={"Póliza"}
                          />
                        </div>
                        <div className="col-3">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Nº:
                          </label>
                          <UqaiField
                            type="number"
                            name={"numSiniestro"}
                            className={"form-control"}
                            placeholder={"Nº"}
                          />
                        </div>
                        <div className="col-3">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Año:
                          </label>
                          <UqaiField
                            type="number"
                            name={"año"}
                            className={"form-control"}
                            placeholder={"Año"}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Aseguradora:
                          </label>

                          <Select
                            value={v1}
                            defaultValue={selectsData.aseguradora[0]}
                            options={selectsData.aseguradora}
                            getOptionLabel={(option) => option.ALIAS}
                            getOptionValue={(option) => option.ID}
                            onChange={(valueSelect) => {
                              setFieldValue("cdAseguradora", valueSelect.ID);
                              set1(valueSelect);
                              // setValuePrioridad(valueSelect);
                            }}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Agentes:
                          </label>
                          {/* <UqaiField
                            type="text"
                            name="cdAgente"
                            component="select"
                            className="form-select"
                          >
                            <option value={"TODOS"} key={"todos"}>
                              {"TODOS"}
                            </option>
                            {selectsData.agentes.map((est) => (
                              <option value={est.ID} key={est.ID}>
                                {est.AGENTE}
                              </option>
                            ))}
                          </UqaiField> */}
                          <Select
                            value={v2}
                            defaultValue={selectsData.agentes[0]}
                            options={selectsData.agentes}
                            getOptionLabel={(option) => option.AGENTE}
                            getOptionValue={(option) => option.ID}
                            onChange={(valueSelect) => {
                              setFieldValue("cdAgente", valueSelect.ID);
                              set2(valueSelect);
                              // setValuePrioridad(valueSelect);
                            }}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Est. Siniestro:
                          </label>
                          {/* <UqaiField
                            type="text"
                            name="cdEstado"
                            component="select"
                            className="form-select"
                          >
                            <option value={"TODOS"} key={"todos"}>
                              {"TODOS"}
                            </option>
                            {selectsData.estSiniestro.map((est) => (
                              <option
                                value={est.CD_EST_SINIESTRO}
                                key={est.CD_EST_SINIESTRO}
                              >
                                {est.DSC_ESTADO}
                              </option>
                            ))}
                          </UqaiField> */}
                          <Select
                            value={v3}
                            defaultValue={selectsData.estSiniestro[0]}
                            options={selectsData.estSiniestro}
                            getOptionLabel={(option) => option.DSC_ESTADO}
                            getOptionValue={(option) => option.CD_EST_SINIESTRO}
                            onChange={(valueSelect) => {
                              setFieldValue(
                                "cdEstado",
                                valueSelect.CD_EST_SINIESTRO
                              );
                              set3(valueSelect);
                              // setValuePrioridad(valueSelect);
                            }}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Ramo:
                          </label>
                          {/* <UqaiField
                            type="text"
                            name="cdRamo"
                            component="select"
                            className="form-select"
                          >
                            <option value={"TODOS"} key={"todos"}>
                              {"TODOS"}
                            </option>
                            {selectsData.ramos.map((est) => (
                              <option value={est.CD_RAMO} key={est.CD_RAMO}>
                                {est.NM_RAMO}
                              </option>
                            ))}
                          </UqaiField> */}
                          <Select
                            value={v7}
                            defaultValue={selectsData.ramos[0]}
                            options={selectsData.ramos}
                            getOptionLabel={(option) => option.NM_RAMO}
                            getOptionValue={(option) => option.CD_RAMO}
                            onChange={(valueSelect) => {
                              setFieldValue("cdRamo", valueSelect.CD_RAMO);
                              set7(valueSelect);
                              // setValuePrioridad(valueSelect);
                            }}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Sucursal:
                          </label>
                          {/* <UqaiField
                            type="text"
                            name="cdSucursal"
                            component="select"
                            className="form-select"
                          >
                            <option value={"TODOS"} key={"todos"}>
                              {"TODOS"}
                            </option>
                            {selectsData.sucursal.map((est) => (
                              <option value={est.ID} key={est.ID}>
                                {est.SUCURSAL}
                              </option>
                            ))}
                          </UqaiField> */}
                          <Select
                            value={v4}
                            defaultValue={selectsData.sucursal[0]}
                            options={selectsData.sucursal}
                            getOptionLabel={(option) => option.SUCURSAL}
                            getOptionValue={(option) => option.ID}
                            onChange={(valueSelect) => {
                              setFieldValue("cdSucursal", valueSelect.ID);
                              set4(valueSelect);
                              // setValuePrioridad(valueSelect);
                            }}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Usuario:
                          </label>
                          {/* <UqaiField
                            type="text"
                            name="cdUsuario"
                            component="select"
                            className="form-select"
                          >
                            <option value={"TODOS"} key={"todos"}>
                              {"TODOS"}
                            </option>
                            {selectsData.usuariosD.map((est) => (
                              <option value={est.USUARIO} key={est.USUARIO}>
                                {est.NOMBRE}
                              </option>
                            ))}
                          </UqaiField> */}
                          <Select
                            value={v5}
                            defaultValue={selectsData.usuariosD[0]}
                            options={selectsData.usuariosD}
                            getOptionLabel={(option) => option.NOMBRE}
                            getOptionValue={(option) => option.USUARIO}
                            onChange={(valueSelect) => {
                              setFieldValue("cdUsuario", valueSelect.USUARIO);
                              set5(valueSelect);
                              // setValuePrioridad(valueSelect);
                            }}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Fc.Ingreso:
                          </label>
                          <UqaiField
                            name="fcIngreso"
                            placeholder="Ingrese Fecha"
                            component={UqaiCalendario}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Fc.Evento:
                          </label>
                          <UqaiField
                            name="fcEvento"
                            placeholder="Ingrese Fecha"
                            component={UqaiCalendario}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Fc. Recepción:
                          </label>
                          <UqaiField
                            name="fcRecepcion"
                            placeholder="Ingrese Fecha"
                            component={UqaiCalendario}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Ultima Gestión
                          </label>
                          <UqaiField
                            name="fcGestion"
                            placeholder="Ingrese Fecha"
                            component={UqaiCalendario}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Subarea:
                          </label>
                          {/* <UqaiField
                            type="text"
                            name="cdSubarea"
                            component="select"
                            className="form-select"
                          >
                            <option value={"TODOS"} key={"todos"}>
                              {"TODOS"}
                            </option>
                            {selectsData.subArea.map((est) => (
                              <option value={est.ID} key={est.ID}>
                                {est.SUBAREA}
                              </option>
                            ))}
                          </UqaiField> */}
                          <Select
                            value={v6}
                            defaultValue={selectsData.subArea[0]}
                            options={selectsData.subArea}
                            getOptionLabel={(option) => option.SUBAREA}
                            getOptionValue={(option) => option.ID}
                            onChange={(valueSelect) => {
                              setFieldValue("cdSubarea", valueSelect.ID);
                              set6(valueSelect);
                              // setValuePrioridad(valueSelect);
                            }}
                          />
                        </div>
                        {/* <div className="col-6">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Prioridad:
                          </label>

                          <Select
                            value={valuePrioridad}
                            components={{
                              Option: (props) => (
                                <Option
                                  {...props}
                                  color={props.data.color} // Accede al color personalizado
                                  label={props.data.label} // Accede al label personalizado
                                />
                              ),
                            }}
                            options={PRIORIDAD_SELECTS}
                            onChange={(valueSelect) => {
                              setFieldValue("cdPrioridad", valueSelect.value);
                              setValuePrioridad(valueSelect);
                            }}
                          />
                        </div> */}
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Diagnostico:
                          </label>
                          <UqaiField
                            type="text"
                            component="select"
                            className="form-select"
                            name="cdDiagnostico"
                          >
                            <option value={"TODOS"} key={"todos"}>
                              {"TODOS"}
                            </option>
                            {(selectsData.diagnostico || []).map((opt) => (
                              <option key={opt.label} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </UqaiField>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Placa:
                          </label>
                          <UqaiField
                            type="text"
                            name={"cdPlaca"}
                            className={"form-control"}
                            placeholder={"Placa"}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary fs-7">
                            Taller:
                          </label>
                          <UqaiField
                            type="text"
                            component="select"
                            className="form-select"
                            name="cdTaller"
                          >
                            <option value={"TODOS"} key={"todos"}>
                              {"TODOS"}
                            </option>
                            {(selectsData.taller || []).map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </UqaiField>
                        </div>
                        <div>
                          <div
                            className="d-flex align-items-center justify-content-end"
                            align="right"
                          >
                            <button
                              type="button"
                              className="btn btn-success me-2"
                              onClick={() => {
                                setFieldValue("cdRamo");
                                setValuePrioridad(PRIORIDAD_SELECTS[0]);
                                set0(null);
                                set1(selectsData.aseguradora[0]);
                                set2(selectsData.agentes[0]);
                                set3(selectsData.estSiniestro[0]);
                                set4(selectsData.sucursal[0]);
                                set5(selectsData.usuariosD[0]);
                                set6(selectsData.subArea[0]);
                                set7(selectsData.ramos[0]);

                                handleResetForm(resetForm);
                              }}
                            >
                              Limpiar filtros
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              onClick={submitForm}
                              disabled={isSubmitting}
                            >
                              Buscar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </UqaiFormik>
              </CardBody>
            </Card>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

const ModalNewSiniestro = ({ open, setOpen, query, form, selectsData }) => {
  const [resultSearch, setResulSearch] = useState([]);
  // const searchDataPoliza = (newValues) => {
  //   console.log("SUBMITTING? ", newValues);
  //   axios
  //     .post(`${routesVam.dbroker}/polizas`, {
  //       cdCliente: 3846,
  //       cdSucursal: 3,
  //       cdRamo: 12,
  //       poliza: "%",
  //     })
  //     .then((res) => {
  //       console.log("RESPONSE POLIZA: ", res);
  //     });
  // };

  const loadOptions = async (values, callback) => {
    const newValues = {
      cdCliente: values.cdCliente,
      cdSucursal: values.cdSucursal,
      cdRamo: values.cdRamo,
      poliza: "%",
    };
    console.log("NewValues: ", newValues);
    callback(await searchDataPoliza(newValues));
  };
  const searchDataPoliza = async (values) => {
    console.log("Siniestro OBjeto ", values);
    try {
      const response = await axios.post(`${routesVam.dbroker}/polizas`, values);

      setResulSearch(response.data);
      const formatedData = response.data.map((result) => ({
        value: result.POLIZA,
        label: result.POLIZA,
      }));
      return formatedData;
    } catch (error) {
      console.log("ERROR: ", error);
      return [];
    }
  };
  const onSubmit = async (newValues, actions) => {
    const values = { ...newValues, fcRecepcion: null, fcEvento: null };
    console.log("VALUES?_ ", values);
    try {
      const response = await axios.post(
        `${routesVam.dbroker}/nuevoSiniestro`,
        values
      );
      console.log("SUCCES? : ", response);
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  return (
    <Modal isOpen={open} toggle={() => setOpen(false)} size="xl" centered>
      <UqaiModalHeader
        toggle={() => setOpen(false)}
        title="AÑADIR NUEVO SINIESTRO"
      />
      <ModalBody>
        <UqaiFormik
          onSubmit={onSubmit}
          initialValues={query}
          validateOnChange={false}
          ref={form}
        >
          {({ submitForm, values, isSubmitting, setFieldValue }) => {
            return (
              <div className="row my-3">
                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Cliente:
                  </label>

                  <AsyncSelect
                    placeholder="Clientes"
                    cacheOptions
                    defaultOptions
                    loadOptions={loadOptionsNew}
                    onChange={(valueSelect) => {
                      setFieldValue("cdCliente", valueSelect.value);
                    }}
                  />
                </div>
                {/* <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Cliente:
                  </label>
                  <UqaiField
                    type="text"
                    name={"cliente"}
                    className={"form-control"}
                    placeholder={"Cliente"}
                  />
                </div> */}
                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Aseguradora:
                  </label>

                  <Select
                    placeholder="Aseguradora"
                    options={selectsData.aseguradora}
                    getOptionLabel={(option) => option.ALIAS}
                    getOptionValue={(option) => option.ID}
                    onChange={(valueSelect) => {
                      setFieldValue("cdAseguradora", valueSelect.ID);
                      // setValuePrioridad(valueSelect);
                    }}
                  />
                </div>
                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Sucursal:
                  </label>

                  <Select
                    placeholder="Sucursal"
                    options={selectsData.sucursal}
                    getOptionLabel={(option) => option.SUCURSAL}
                    getOptionValue={(option) => option.ID}
                    onChange={(valueSelect) => {
                      setFieldValue("cdSucursal", valueSelect.ID);
                      // setValuePrioridad(valueSelect);
                    }}
                  />
                </div>
                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Fc. Recepcion:
                  </label>
                  <UqaiField
                    name="fcRecepcion"
                    placeholder="Ingrese Fecha"
                    component={UqaiCalendario}
                  />
                </div>
                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Ramo:
                  </label>

                  <Select
                    placeholder={"Ramo"}
                    options={selectsData.ramos}
                    getOptionLabel={(option) => option.NM_RAMO}
                    getOptionValue={(option) => option.CD_RAMO}
                    onChange={(valueSelect) => {
                      setFieldValue("cdRamo", valueSelect.CD_RAMO);
                    }}
                  />
                </div>
                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Poliza:
                  </label>
                  <AsyncSelect
                    placeholder="Poliza"
                    cacheOptions
                    defaultOptions
                    loadOptions={(input, callback) => {
                      if (
                        values.cdCliente &&
                        values.cdSucursal &&
                        values.cdRamo
                      ) {
                        loadOptions(values, callback);
                      }
                    }}
                    onChange={(valueSelect) => {
                      setFieldValue("poliza", valueSelect.value);
                      setFieldValue(
                        "cdAsegurado",
                        resultSearch[0].CD_COTIZACION
                      );
                      setFieldValue("cdPlaca", resultSearch[0].CD_COTIZACION);
                    }}
                  />
                </div>

                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Fc. Evento:
                  </label>
                  <UqaiField
                    name="fcEvento"
                    placeholder="Ingrese Fecha"
                    component={UqaiCalendario}
                  />
                </div>

                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Asegurado-propietario:
                  </label>
                  <UqaiField
                    type="text"
                    name={"cdAsegurado"}
                    className={"form-control"}
                    placeholder={"Asegurado"}
                  />
                </div>

                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Diagnostico-causa:
                  </label>
                  <UqaiField
                    type="text"
                    component="select"
                    className="form-select"
                    name="cdDiagnostico"
                  >
                    {(RAMO_SELECTS || []).map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </UqaiField>
                </div>
                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Placa-item:
                  </label>
                  <UqaiField
                    type="text"
                    name={"cdPlaca"}
                    className={"form-control"}
                    placeholder={"Placa"}
                  />
                </div>
                <div className="col-2">
                  <label className="form-label fw-bold text-secondary fs-7">
                    Taller:
                  </label>
                  <UqaiField
                    type="text"
                    component="select"
                    className="form-select"
                    name="cdTaller"
                  >
                    {(RAMO_SELECTS || []).map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </UqaiField>
                </div>
                <div className="d-flex justify-content-end col-12 ">
                  <div className="d-flex col-3 justify-content-between ">
                    <button
                      type="button"
                      className="btn btn-danger " // Agregar margen a la derecha
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-alternative"
                      onClick={submitForm}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        </UqaiFormik>
      </ModalBody>
    </Modal>
  );
};

const Option = ({ innerProps, label, color }) => (
  <div
    {...innerProps}
    style={{
      display: "flex",
      alignItems: "center",
      padding: "8px", // Ajusta esto según tus necesidades
    }}
  >
    <div
      style={{
        backgroundColor: color,
        width: "20px", // Ancho del cuadrado de color
        height: "20px", // Alto del cuadrado de color
        marginRight: "8px", // Espacio entre el cuadrado de color y el texto
      }}
    />
    <div>{label}</div>
  </div>
);
