import {useSelector} from "react-redux";
import React, {useEffect, useRef, useState} from "react";
import {Card, CardBody, CardHeader} from "reactstrap";
import Alerts from "../../../components/Alerts";
import UqaiFormik from "../../../components/UqaiFormik";
import axios from "axios";
import {defaultSiniestro, TIPOS, TIPOS_RECLAMO, v_siniestro} from "./utils";
import {routes as routesVam} from "../UtilsVam";
import {routes} from "../../gen/UtilsGeneral";
import {useHistory, useParams} from "react-router-dom";
import {CustomNumberFormat} from "../../../components/CustomNumberFormat";
import moment from "moment";
import {Comentario} from "./parts/Comentario";
import {DocumentosAdjuntos} from "./parts/documentos-adjuntos/DocumentosAdjuntos";
import Humanize from "humanize-plus";
import {CustomPrompt} from "../../../prompt/CustomPrompt";
import {bytesToMb, getKeysFromObject, MAX_ADJUNTOS_SIZE} from "./parts/documentos-adjuntos/util";
import {LoadingContextProvider, useLoadingContext} from "./parts/documentos-adjuntos/context/LoadingContextProvider";
import {SiniestroEnviarButton} from "./parts/SiniestroEnviarButton";
import {SiniestroEstadosSelect} from "./parts/SiniestroEstadosSelect";
import {searchTpNotificacion} from "../../home/utils";
import {CardIncapSiniestro} from "./parts/card-incap-siniestro/CardIncapSiniestro";
import {
    defaultEstadoSiniestro,
    ESTADOS_PORTAL_LISTA,
    ESTADOS_SINI_VALUES,
    isEjecutivoOrAdminAbleToEditByEstadoSiniestro
} from "./estados_edicion";
import Pages from "../../../layouts/Pages";
import {JedaiCalendarioViewText} from "../../../components/UqaiCalendario";
import {useFormikContext} from "formik";
import {IncapacidadLabel} from "./parts/card-incap-siniestro/IncapacidadSelect";
import {EstadoDocumentoLabel} from "./parts/documentos-adjuntos/EstadoDocumento";


const SiniestroPortal = () => {
    const [item, setItem] = useState(defaultSiniestro());
    const [matrix, setMatrix] = useState([]);
    const [asegs, setAsegs] = useState([]);
    const [ramos, setRamos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [viewCard, setViewCard] = useState(false);
    const [incapacidad, setIncapacidad] = useState(null);
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({aseguradora: "", plan: "", ramo: ""});
    const [comentarios, setComentarios] = useState([]);
    const [comentario, setComentario] = useState({});
    const [openComentario, setOpenComentario] = useState(false);
    const [edit, setEdit] = useState(true);
    const [isActivePrompt, setIsActivePrompt] = useState(true);
    const setGlobalLoading = useLoadingContext()[1];

    const user = useSelector(state => state.user);
    const alert = useRef();
    const params = useParams();
    const history = useHistory();
    const isUser = user.isUser;

    useEffect(() => {
        if (params?.cdComp === "new") {
            getDataMatrix(user?.cedula);
            //estado inicial de siniestro
            setComentario(defaultEstadoSiniestro('POR_REVISAR', user, 'Creación de siniestro en portal'));
            setOpen(true)
        } else {
            getItem(params?.cdComp, params?.cdReclamo, params?.cdIncSiniestro);
        }
    }, [params?.cdReclamo, user?.cedula])

    const getItem = (cdCompania, cdReclamo, cdIncSiniestro) => {
        if (cdCompania && cdReclamo) {
            axios.get(routesVam.api + '/siniestros-portal', {
                params: {cdCompania, cdReclamo, cdIncSiniestro}
            }).then(resp => {
                let item = resp.data;
                setItem(item);
                setComentarios(item?.observacionesEstados ? JSON.parse(item?.observacionesEstados) : []);
                getDataAdmin(item);
                setEdit(editable(item));
                getIncapacidad(item?.cdIncapacidad);
            }).catch(alert.current.handle_error);
        }
    }
    const getIncapacidad = (id) => {
        axios.get(routes.api + '/siniestros-portal/incapacidad', {params: {id}}).then(resp => {
            let item = resp.data
            setIncapacidad({
                label: item?.nmIncapacidad,
                value: item?.cdIncapacidad
            });
        });
    }
    const getDataMatrix = (cedula) => {
        if (cedula) {
            getMatrix(cedula).then(list => {
                setMatrix(list);
                if (list.length > 0) {
                    let aseguradoras = (list || []).map(x => ({
                        value: x.CD_ASEGURADORA,
                        cdCotizacion: x.CD_COTIZACION,
                        label: x.NM_ASEGURADORA
                    }));
                    let hash = {};
                    aseguradoras = aseguradoras.filter(o => hash[o.value] ? false : hash[o.value] = true);//distinct por aseguradora
                    aseguradoras.sort((a, b) => a.label.localeCompare(b.label))
                    setAsegs(aseguradoras);
                }
            }).catch(error => alert.current.handle_error(error));
        }
    }

    const getMatrix = async (cedula) => {
        let resp = await axios.get(routesVam.api + '/siniestro/deducible/matrix', {
            params: {
                cedula,
                caducada: false
            }
        });
        return resp.data;
    }

    const findRamos = (cdAseguradora) => {
        let ramos = (matrix || []).filter(x => x.CD_ASEGURADORA === cdAseguradora).map(x => ({
            ...x,
            value: x.CD_UBICACION + '_' + x.CD_COMPANIA,
            cdRamo: x.CD_RAMO,
            cdUbicacion: x.CD_UBICACION,
            cdCompania: x.CD_COMPANIA,
            cdRamoCotizacion: x.CD_RAMO_COTIZACION,
            label: x?.NM_RAMO + ' / ' + x?.POLIZA + ' / ' + x.DSC_PLAN,
            items: x.items
        }));
        ramos.sort((a, b) => a.label.localeCompare(b.label))
        setRamos(ramos);
    }


    const onSubmit = (newValues, actions) => {
        setIsActivePrompt(() => false);
        setGlobalLoading(() => true);
        let id = newValues.cdIncSiniestro;
        if (!id || id < 1) {
            comentario.fecha = new Date();
        }

        if (comentario.hasOwnProperty('estado')) {
            comentarios.push(comentario);
        }

        let commentString = JSON.stringify(comentarios);
        while (commentString.length >= 3000) {
            comentarios.shift();
            commentString = JSON.stringify(comentarios);
        }
        let estado = item.estadoPortal;
        newValues.observacionesEstados = JSON.stringify(comentarios);
        axios.post(routesVam.api + '/siniestros-portal', newValues).then(resp => {
            let data = resp.data;
            setItem(data);
            setEdit(editable(data));
            alert.current.show_info('Guardado con éxito');
            if (id !== data.cdIncSiniestro) {//siniestro nuevo
                sendMessage(data.cdCompania, data.cdReclamo, data.cdIncSiniestro, searchTpNotificacion('nuevo'))
            }
            if (estado !== data.estadoPortal) {//siniestro modificado
                sendMessage(data.cdCompania, data.cdReclamo, data.cdIncSiniestro, searchTpNotificacion('cambio'))
            }
            history.push("/vam/siniestros-reportados");
        }).catch(error => {
            alert.current.show_error('Error al guardar ' + error);
        }).finally(() => {
            setIsActivePrompt(() => true);
            setGlobalLoading(() => false);
            actions.setSubmitting(false);
        });
    }

    const findList = (list, id) => {
        return (list || []).find(x => x.value === id)?.label;
    }

    const findPoliza = (list, values) => {
        return (list || []).find(x => x.value === `${values.cdUbicacion}_${values.cdCompania}`)?.label;
    }
    const getDataAdmin = (item) => {
        axios.get(routes.api + '/siniestros-portal/data', {
            params: {
                cdAseguradora: item?.cdAseguradora,
                cdRamoCotizacion: item?.cdRamoCotizacion,
                cdUbicacion: item?.cdUbicacion,
                cdRamo: item?.cdRamo
            }
        }).then(resp => {
            setData(resp.data);
        }).catch(error => {
            alert.current.show_error('Error al guardar ' + error);
        });
    }

    const changeEstadoCliente = ({values, setFieldValue, submitForm}) => {
        if (isUser && (validateRequiredDocuments(values) || validateRequiredDocuments(values, "gastos"))) return;
        if (isUser && [ESTADOS_SINI_VALUES.porRegularizar, ESTADOS_SINI_VALUES.documentoAdicional].includes(values.estadoPortal)) {
            setFieldValue('estadoPortal', ESTADOS_SINI_VALUES.porRevisar);
            setComentario(defaultEstadoSiniestro(ESTADOS_SINI_VALUES.porRevisar, user, 'Modificación de siniestro por parte de usuario'));//estado inicial de siniestro
        }
        submitForm();
    }

    function validateRequiredDocuments(values, tipo = "documentos") {
        const isGastos = tipo === "gastos";
        const {documentos, gastos} = values;
        const documentosObligatorios = [];
        const gastosObligatorios = [];
        const array = isGastos ? gastos : documentos;
        array?.forEach(doc => {
            if (isGastos) {
                (doc.obligatorio && getKeysFromObject(doc?.subdocumentosItems).length < 1) && gastosObligatorios.push(doc.nmDocumento);
            } else {
                (doc.obligatorio && !doc?.documentoDigital?.url) && documentosObligatorios.push(doc.nmDocumento);
            }
        });
        const isRequiredDocsNeeded = documentosObligatorios.length > 0;
        if (isRequiredDocsNeeded) alert.current.show_error(`Los documentos: ${documentosObligatorios.join(", ")} son obligatorios.`);

        const isRequiredGastosNeeded = gastosObligatorios.length > 0;
        if (isRequiredGastosNeeded) alert.current.show_error(`Los gastos: ${gastosObligatorios.join(", ")} deben tener al menos un grupo de documentos.`);
        return isRequiredDocsNeeded || isRequiredGastosNeeded;
    }

    const editable = (item) => {
        return !item.cdReclamo || isEjecutivoOrAdminAbleToEditByEstadoSiniestro(user, item?.estadoPortal);
    }

    const sendMessage = (cdCompania, cdReclamo, cdIncSiniestro, tipo) => {
        axios.post(routes.api + '/siniestros-portal/send-message',
            {cdCompania, cdReclamo, cdIncSiniestro, tipo}).catch(error => {
            alert.current.show_error('Error al enviar mensaje a whatsapp ' + error);
        });
    }

    function onChangeSelect(e) {
        setComentario(defaultEstadoSiniestro(e.value, user));
        setOpenComentario(true);
    }

    const showBtnEstado = (!isUser && edit);
    return (<Pages title={"Siniestros"} key={params?.cdReclamo}>
            <section className="p-1 p-md-2 p-xl-4 flex-grow-1">
                <div className="container-fluid">
                    <Alerts ref={alert}/>
                    <UqaiFormik initialValues={item} onSubmit={onSubmit} enableReinitialize={true}
                                validateOnChange={false} validateOnBlur={false} validationSchema={v_siniestro}>
                        {({values}) => (
                            <>
                                <IsNewItem/>
                                <CardIncapSiniestro viewCard={viewCard} setViewCard={setViewCard}
                                                    setPacientes={setPacientes}
                                                    pacientes={pacientes} matrix={matrix}
                                                    asegs={asegs} ramos={ramos} setIncapacidad={setIncapacidad}
                                                    findRamos={findRamos} open={open} incapacidad={incapacidad}
                                                    setOpen={setOpen} alert={alert}
                                />
                                {!open &&
                                    <>
                                        <div className="row">
                                            <div className="col-lg-4 col-md-3 col-sm-12">
                                                <div className="position-sticky sticky-top">
                                                    <Card className="shadow">
                                                        <CardHeader
                                                            className="d-flex align-items-center border-bottom border-primary">
                                                            <h5 className="my-0 fw-bold">
                                                                <i className="icon-uqai align-middle uqai-filtros text-primary me-2"></i>
                                                                Parámetros
                                                            </h5>
                                                        </CardHeader>
                                                        <div className="container">
                                                            <CardBody>
                                                                <div className="row">
                                                                    <div className="col-lg-6">
                                                                        <label
                                                                            className="form-label fw-bold text-secondary fs-7">Aseguradora: </label><br/>
                                                                        <span>{values?.numSiniestro ? data?.aseguradora : findList(asegs, Number(values?.cdAseguradora))}</span>
                                                                    </div>
                                                                    <div className="col-lg-6">
                                                                        <label
                                                                            className="form-label fw-bold text-secondary fs-7">Póliza: </label><br/>
                                                                        <span>{values?.numSiniestro ? `${data?.ramo} / ${values?.poliza} / ${data?.plan}` : findPoliza(ramos, values)}</span>
                                                                    </div>
                                                                    <div className="col-lg-6">
                                                                        <label
                                                                            className="form-label fw-bold text-secondary fs-7">Tipo
                                                                            de reclamo: </label><br/>
                                                                        <span>{findList(TIPOS, values?.tpSiniestro)}</span>
                                                                    </div>
                                                                    <div className="col-lg-6">
                                                                        <label
                                                                            className="form-label fw-bold text-secondary fs-7">Paciente: </label><br/>
                                                                        <span>{values?.dscObjeto}</span>
                                                                    </div>
                                                                    <div className="col-lg-6">
                                                                        <IncapacidadLabel input={false}/><br/>
                                                                        <span>{incapacidad?.label}</span>
                                                                    </div>
                                                                    <div className="col-lg-6">
                                                                        <label
                                                                            className="form-label fw-bold text-secondary fs-7">
                                                                            {values.tpSiniestro === TIPOS_RECLAMO.preAutorizacion ? "Fc. de procedimiento:" : "Fc. de incurrencia:"}
                                                                        </label><br/>
                                                                        <span>{values.tpSiniestro === TIPOS_RECLAMO.preAutorizacion ? moment(values?.fcProcedimiento).locale('moment/locale/es').format('DD/MMM/YYYY') : moment(values.fcAlcance).locale('moment/locale/es').format('DD/MMM/YYYY')}</span>
                                                                    </div>

                                                                    {values.tpSiniestro === TIPOS_RECLAMO.preAutorizacion &&
                                                                        <div className="col-lg-6"
                                                                             style={{display: "none"}}>
                                                                            <label
                                                                                className="form-label fw-bold text-secondary fs-7">
                                                                                Fc. de procedimiento:
                                                                            </label>
                                                                            <br/>
                                                                            <JedaiCalendarioViewText
                                                                                value={values.fcProcedimiento}/>
                                                                        </div>}

                                                                    {values.numSiniestro &&
                                                                        <div className="col-lg-6">
                                                                            <label
                                                                                className="form-label fw-bold text-secondary fs-7">
                                                                                Num. Siniestro: </label><br/>
                                                                            <span>{`${item.numSiniestro}.${item.item}`}</span>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div className="row mt-3">
                                                                    <div className="col-12">
                                                                        <h5>Almacenamiento</h5>
                                                                        <span>{bytesToMb(values?.documentosSize)} / {Humanize.fileSize(MAX_ADJUNTOS_SIZE)}</span>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </div>
                                                    </Card>

                                                    <Card className="my-4 shadow">
                                                        <CardHeader
                                                            className="d-flex align-items-center border-bottom border-primary">
                                                            <h5 className="my-0 fw-bold">
                                                                <i className="icon-uqai align-middle uqai-valor-reclamo text-primary me-2"></i>
                                                                {values.tpSiniestro === TIPOS_RECLAMO.preAutorizacion ? "Valor del procedimiento" : "Valor de su reclamo"}
                                                            </h5>
                                                        </CardHeader>
                                                        <div className="container">
                                                            <CardBody>
                                                                <div className="row">
                                                                    <div className="col-lg-6">
                                                                <span className="fs-2 fw-bold text-secondary">
                                                                    <CustomNumberFormat
                                                                        value={values.tpSiniestro === TIPOS_RECLAMO.preAutorizacion ? values?.valCirugia : values?.valorReclamoPortal}/>
                                                                </span>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </div>
                                                    </Card>
                                                    <div className="" align="left">

                                                        <button type={"button"}
                                                                className="btn btn-active-border-0 p-0 text-secondary mx-2"
                                                                onClick={() => {
                                                                    if (values.numSiniestro) {
                                                                        history.push("/vam/siniestros-reportados");
                                                                    } else {
                                                                        setOpen(true);
                                                                    }
                                                                }}>
                                                            <i className={"icon-uqai uqai-regresar fs-5 fw-bolder pl-2"}>
                                                            <span
                                                                className={"ms-1"}>{`Regresar ${!values.numSiniestro ? 'a parámetros' : ''}`}</span>
                                                            </i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-8 col-md-9 col-sm-12">
                                                <div>
                                                    <DocumentosAdjuntos/>
                                                    {values.documentos &&
                                                        <div className="card w-100 btn-enviar-siniestro">
                                                            <div className="card-header">
                                                                <div
                                                                    className={"d-flex gap-3 justify-content-start align-items-end"}>
                                                                    {showBtnEstado ?
                                                                        <SiniestroEstadosSelect
                                                                            estadoPortal={item.estadoPortal}
                                                                            onChange={onChangeSelect}>
                                                                            <Comentario open={openComentario}
                                                                                        comentario={comentario}
                                                                                        setComentario={setComentario}
                                                                                        item={item}
                                                                                        setOpen={setOpenComentario}/>
                                                                        </SiniestroEstadosSelect>
                                                                        :
                                                                        (values.numSiniestro &&
                                                                            <EstadoDocumentoLabel
                                                                                estadoValue={item?.estadoPortal}
                                                                                isSiniestro
                                                                                estadoLista={ESTADOS_PORTAL_LISTA}/>)
                                                                    }
                                                                    <SiniestroEnviarButton
                                                                        changeEstadoCliente={changeEstadoCliente}
                                                                        initialValues={item}/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <CustomPrompt regexPath={/^\/vam\/reportar-siniestro\/.+\/.+(\/\d+)?$/}
                                                      isActivePrompt={isActivePrompt}/>
                                    </>
                                }
                            </>
                        )}
                    </UqaiFormik>
                </div>
            </section>
        </Pages>
    )
}

export const SiniestroPortalEdit = () => {
    return (
        <LoadingContextProvider>
            <SiniestroPortal/>
        </LoadingContextProvider>
    )
}

const IsNewItem = () => {
    const {values, setFieldValue} = useFormikContext();
    useEffect(() => {
        setFieldValue("isNew", !values?.cdIncSiniestro);
    }, [values.cdIncSiniestro])
    return <></>;
}
