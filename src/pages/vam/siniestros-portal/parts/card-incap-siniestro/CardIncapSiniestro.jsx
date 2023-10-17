import React, {useEffect, useState} from "react";
import {Card, CardBody, CardHeader} from "reactstrap";
import {useFormikContext} from "formik";
import {UqaiField} from "../../../../../components/UqaiField";
import {isBefore90Days, SINIESTRO_EXPIRED_DAYS, TIPOS, TIPOS_RECLAMO} from "../../utils";
import {UqaiCalendario} from "../../../../../components/UqaiCalendario";
import {useHistory} from "react-router-dom";
import moment from "moment/moment";
import {NumberFormatField} from "../../../../../components/number-format/NumberFormatField";
import {AlcanceRadioButton} from "./AlcanceRadioButton";
import {IncapacidadSelect} from "./IncapacidadSelect";
import {useSelector} from "react-redux";
import UqaiTooltip from "../../../../../components/UqaiTooltip";

function ButtonContinuar({validar}) {
    const values = useFormikContext().values;

    const enabledButton = values.cdAseguradora && values.cdRamo && values.cdAsegurado && values.cdIncapacidad &&
        values.tpSiniestro && values.fcAlcance;

    const preAutVal = values.tpSiniestro === TIPOS_RECLAMO.preAutorizacion && values.valCirugia === 0;

    return (<button type="button" className="btn btn-primary" onClick={validar} disabled={!enabledButton || preAutVal}>
        Continuar
    </button>);
}

export const CardIncapSiniestro = ({
                                       viewCard,
                                       setViewCard,
                                       asegs,
                                       ramos, findRamos,
                                       setIncapacidad, incapacidad, setPacientes, pacientes,
                                       open, setOpen, alert, matrix
                                   }) => {
    const formik = useFormikContext();
    const {values, setFieldValue, validateField, errors} = formik;
    const history = useHistory();
    const user = useSelector(state => state.user);
    const [showNoRefund, setShowNoRefund] = useState(false);

    useEffect(() => {
        const fcIncurrenciaValidacion = isBefore90Days(values.fcAlcance);
        const fcProcedimientoValidacion = isBefore90Days(values.fcProcedimiento);
        const anyBeforeDays = fcIncurrenciaValidacion || fcProcedimientoValidacion;
        if (anyBeforeDays !== showNoRefund) setShowNoRefund(anyBeforeDays);
    }, [values.cdAseguradora, values.cdRamo, values.cdAsegurado, values.tpSiniestro]);


    if (!open) return (<></>);


    const setFieldsDefaultPaciente = (item, setFieldValue) => {
        let tipo = item?.TIPO === 'D' ? 'DEPENDIENTE' : null;
        setFieldValue('clAsegurado', item?.TIPO === 'T' ? 'TITULAR' : tipo);
        setFieldValue('dscObjeto', item?.NOMBRES);
    }

    const validar = () => {
        let now = new Date();
        let endDay = now.setHours(23, 59, 59, 0);
        let initDay = now.setHours(0, 0, 0, 0);

        if (values?.tpSiniestro !== TIPOS_RECLAMO.preAutorizacion && values?.fcAlcance > endDay) {
            alert.current.show_error('Fecha inválida - Fecha de incurrencia no debe ser mayor a la fecha actual');
            return;
        }

        if (values?.tpSiniestro === TIPOS_RECLAMO.preAutorizacion && values?.fcProcedimiento < initDay) {
            alert.current.show_error('Fecha inválida - Fecha de procedimiento no debe ser menor a la fecha actual');
            return;
        }
        setViewCard(!viewCard);
        setOpen(false);
    }

    const now = moment();
    const updateShowNoRefund = (dateSelected) => {
        setShowNoRefund(() => isBefore90Days(dateSelected));
    }

    const isValidDate = (currentDate) => {
        return currentDate.isBefore(now);
    };
    const isValidDateMin = (currentDate) => {
        return currentDate.isAfter(now) || currentDate.isSame(now, 'day');
    };

    const findPacientes = (item) => {
        if (item) {
            let pac = item?.items ?? [];
            pac.sort((a, b) => a.NOMBRES.localeCompare(b.NOMBRES))
            setPacientes(pac);
            setFieldsDefaultMatrix(item);
        } else {
            setPacientes([]);
            setFieldValue('cdCompania', null);
        }
    }

    const setFieldsDefaultMatrix = (item) => {
        formik.setFieldValue('cdAsegurado', '');
        formik.setFieldValue('cdPlan', item?.cdPlan);
        formik.setFieldValue('cdCompania', item?.cdCompania);
        formik.setFieldValue('carta', item?.NUM_CARTA);
        formik.setFieldValue('usuario', 'PORTAL_' + user?.email);
        formik.setFieldValue('poliza', item?.POLIZA);
        formik.setFieldValue('cdCliente', item?.CD_CLIENTE);
        formik.setFieldValue('cdUbicacion', item?.CD_UBICACION);
        formik.setFieldValue('cdRamoCotizacion', item?.CD_RAMO_COTIZACION);
        formik.setFieldValue('cdAseguradoTit', item?.CD_ASEGURADO);//titular
    }

    return (
        <div className="row">
            <div className="col py-2">
                <Card className="shadow">
                    <CardHeader className="d-flex align-items-center border-bottom border-primary">
                        <h5 className="my-0 fw-bold">
                            Parámetros crear siniestro
                        </h5>
                    </CardHeader>
                    <div className="container">
                        <CardBody>
                            <div className="row gy-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-bold text-secondary fs-7">Aseguradora:*
                                        <UqaiTooltip
                                            message={'Compañía o institución constituida legalmente para brindar cobertura del producto tomado'}/></label>
                                    <UqaiField type="text" className="form-select"
                                               name={'cdAseguradora'} disabled={values.numSiniestro}
                                               component={"select"} onChange={e => {
                                        setFieldValue('cdAseguradora', Number(e.target.value));
                                        setFieldValue('cdRamo', '');
                                        setFieldValue('cdAsegurado', '');
                                        findRamos(Number(e.target.value));
                                        setPacientes([]);
                                    }}>
                                        <option value={''} key={''}>{"--Seleccione--"}</option>
                                        {(asegs || []).map(a => (
                                            <option key={a.value} value={a.value}>{a.label}</option>
                                        ))}
                                    </UqaiField>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold text-secondary fs-7">Póliza:*
                                        <UqaiTooltip
                                            message={'Documento legal en donde se ven reflejadas sus coberturas'}/></label>
                                    <UqaiField type="text" className={"form-select"}
                                               name={'cdUbicacion2'} disabled={values.numSiniestro}
                                               component={"select"} onChange={e => {
                                        let ramo = ramos.find(x => x.value === e.target.value);
                                        setFieldValue('cdRamo', Number(ramo.cdRamo));
                                        setFieldValue('cdAsegurado', '');
                                        setFieldValue('cdUbicacion2', e.target.value);
                                        findPacientes(ramo);
                                    }}>
                                        <option value={''} key={''}>{"--Seleccione--"}</option>
                                        {(ramos || []).map(a => (
                                            <option key={a.value}
                                                    value={a.value}>{a.label}</option>
                                        ))}
                                    </UqaiField>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold text-secondary fs-7">Paciente:*
                                        <UqaiTooltip message={'Persona que recibe la atención médica'}/></label>
                                    <UqaiField type="text" className={"form-select"}
                                               name={'cdAsegurado'} disabled={values.numSiniestro}
                                               component={"select"} onChange={e => {
                                        setFieldValue('cdAsegurado', Number(e.target.value));
                                        let paciente = pacientes.find(x => Number(x.CD_ASEGURADO) === Number(e.target.value));
                                        setFieldsDefaultPaciente(paciente, setFieldValue);
                                    }}>
                                        <option value={''} key={''}>{"--Seleccione--"}</option>
                                        {(pacientes || []).map(a => (
                                            <option key={a.CD_ASEGURADO}
                                                    value={a.CD_ASEGURADO}>{a.NOMBRES}</option>
                                        ))}
                                    </UqaiField>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold text-secondary fs-7">Tipo de reclamo:*
                                        <UqaiTooltip message={
                                            <div>
                                                <b>{'Ambulatoria: '}</b><span>{'Atención que no sobrepasa las 24 horas en un centro médico, es decir no requiere hospitalización'}</span><br/>
                                                <b>{'Pre autorización: '}</b><span>{'Autorización previa a una cirugía o exámenes a realizarse con pedido médico'}</span><br/>
                                                <b>{'Hospitalario: '}</b><span>{'Atención que sobrepasa las 24 horas en un centro médico u hospital'}</span><br/>
                                                <b>{'Medicina continua: '}</b><span>{'Medicina recetada por más de 30 días por un médico tratante'}</span><br/>
                                            </div>
                                        }/>
                                    </label>
                                    <UqaiField type="text" name={'tpSiniestro'}
                                               className={"form-select"} disabled={values.numSiniestro}
                                               component={"select"} onChange={(e) => {

                                        setFieldValue('tpSiniestro', e.target.value);
                                        setFieldValue('valCirugia', 0);

                                        if (e.target.value === TIPOS_RECLAMO.preAutorizacion) {
                                            setFieldValue('fcProcedimiento', null);
                                        } else {
                                            setFieldValue('fcAlcance', null);
                                        }
                                        if (e.target.value === TIPOS_RECLAMO.medicinaContinua) {
                                            setFieldValue('alcance', 'S');
                                            setFieldValue('cdIncapacidad', null);
                                            setFieldValue('cdIncapacidadHash', '');
                                            setIncapacidad(null);
                                        }
                                        if (e.target.value === TIPOS_RECLAMO.preAutorizacion) {
                                            setFieldValue('alcance', 'N');
                                            setFieldValue('cdReclamo', null);
                                            setFieldValue('cdObjSiniestro', null);
                                            setFieldValue('item', 0);
                                        }
                                    }}>
                                        <option value={''} key={''}>{"--Seleccione--"}</option>
                                        {(TIPOS || []).map(tp => (
                                            <option value={tp.value}
                                                    key={tp.value}>{tp.label}</option>
                                        ))}
                                    </UqaiField>
                                </div>

                                <AlcanceRadioButton/>
                                <IncapacidadSelect alert={alert} setIncapacidad={setIncapacidad}
                                                   incapacidad={incapacidad}/>

                                {values.tpSiniestro !== TIPOS_RECLAMO.preAutorizacion &&
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold text-secondary fs-7">
                                            Fc. de incurrencia:*
                                            <UqaiTooltip
                                                message={'Fecha en que el paciente realiza el primer gasto de esta incapacidad'}/>
                                        </label>
                                        <UqaiField type="text" readOnly={values.numSiniestro}
                                                   name={'fcAlcance'} component={UqaiCalendario}
                                                   addMsg={"No es la fecha de ingreso"}
                                                   isValidDate={isValidDate} maxValue={now}
                                                   showInternalMessage={false}
                                                   onFieldSet={(e) => {
                                                       updateShowNoRefund(e);
                                                       setFieldValue('fcAlcance', e);
                                                       setTimeout(() => {
                                                           validateField('fcAlcance');
                                                       }, 500);
                                                   }}/>
                                        {showNoRefund ? <NoRefoundMessage/> : null}
                                    </div>}
                                {values.tpSiniestro === TIPOS_RECLAMO.preAutorizacion &&
                                    <>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary fs-7">
                                                Fc. de procedimiento:*
                                            </label>
                                            <UqaiField type="text" readOnly={values.numSiniestro}
                                                       name={'fcProcedimiento'} component={UqaiCalendario}
                                                       isValidDate={isValidDateMin} minValue={now}
                                                       showInternalMessage={false}
                                                       onFieldSet={(e) => {
                                                           setFieldValue('fcProcedimiento', e);
                                                           setFieldValue('fcAlcance', new Date());
                                                           setTimeout(() => {
                                                               validateField('fcProcedimiento');
                                                           }, 500);
                                                       }}/>

                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary fs-7">
                                                Valor del Procedimiento:*
                                            </label>
                                            <NumberFormatField name={'valCirugia'} className={"form-control"}/>
                                            <span className={'invalid-feedback d-block'}>{errors?.valCirugia}</span>
                                        </div>
                                    </>}
                                <div className="col-12" align="right">
                                    <button type="button" className="btn btn-success me-2"
                                            onClick={() => {
                                                setOpen(false);
                                                history.push("/vam/siniestros-reportados");
                                            }}>
                                        Cancelar
                                    </button>
                                    <ButtonContinuar validar={validar}/>
                                </div>
                            </div>
                        </CardBody>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export const NoRefoundMessage = () => {

    return (
        <span className={"text-danger d-block"}>
            {`Superó los ${SINIESTRO_EXPIRED_DAYS} días calendario de ingreso, posiblemente no tenga cobertura ni reembolso.`}
        </span>
    );
}