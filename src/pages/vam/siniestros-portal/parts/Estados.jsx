import React, { useRef, useState } from "react";
import { ESTADOS_CLASS_IMAGEN, ESTADOS_CLASS_LABEL } from "../utils";
import UqaiFormik from "components/UqaiFormik";
import { UqaiField } from "components/UqaiField";
import { ESTADOS_PORTAL_LISTA } from "../estados_edicion";
import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";
import Select from "react-select";

export const Estados = (estado) => {
  const form = useRef();
  const siniestrosData = useSelector((state) => state);
  const [v3, set3] = useState(siniestrosData[0]);
  const [aux, setAux] = useState();
  // console.log("SINIESTROS ESTADOS REDUX", siniestrosData);

  //   const classImage = ESTADOS_CLASS_IMAGEN.find(
  //     (x) => x.value === estado
  //   )?.label;

  // console.log("ESTADO?: ", estado);

  const handleFormChange = (value, setValue) => {
    // console.log("VALUE: ", value.target.value);
    setValue(value.target.value);
    // setValue

    // Realiza aquí la acción que deseas ejecutar cuando se detecta un cambio
    // Puedes comparar los valores actuales con los valores anteriores si es necesario
  };
  return (
    <>
      <UqaiFormik
        validateOnChange={false}
        ref={form}
        initialValues={{ cdEstadO: null }}
      >
        {({ submitForm, setFieldValue, isSubmitting }) => {
          //   useEffect(() => {}, [values]);
          // console.log("VALUES:", props);
          return (
            <div>
              <Select
                value={v3}
                defaultValue={siniestrosData[0]}
                options={siniestrosData}
                getOptionLabel={(option) => option.DSC_ESTADO}
                getOptionValue={(option) => option.CD_EST_SINIESTRO}
                onChange={(valueSelect) => {
                 
                  setFieldValue("cdEstado", valueSelect.CD_EST_SINIESTRO);
                  setAux(true);
                  set3(valueSelect);
                  // setValuePrioridad(valueSelect);
                }}
              />
              {aux && (
                <div>
                  <button className="btn  mr-2">
                    <i className="icon-uqai uqai-estado-aprobado text-alternative "></i>
                  </button>
                  <button className="btn ">
                    <i className="icon-uqai uqai-cerrar text-danger"></i>
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </UqaiFormik>
    </>
    // <UqaiFormik validateOnChange={false} ref={form} initialValues={estado}>
    //   {() => (
    //     <UqaiField
    //       type="text"
    //       name="estado"
    //       component="select"
    //       className="form-select"
    //     >
    //       {ESTADOS_CLASS_LABEL.map((est) => (
    //         <option value={est.value} key={est.value}>
    //           {est.label}
    //         </option>
    //       ))}
    //     </UqaiField>
    //   )}
    // </UqaiFormik>
  );
};
