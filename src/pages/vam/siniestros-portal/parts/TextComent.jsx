import { UqaiField } from "components/UqaiField";
import UqaiFormik from "components/UqaiFormik";
import React, { useRef } from "react";

const TextComent = (txt) => {
  // console.log("Estado: ", txt);
  const form = useRef();

  return (
    <UqaiFormik validateOnChange={false} ref={form} initialValues={txt}>
      <UqaiField
        type="text"
        name={"txt"}
        className={"form-control"}
        placeholder={"Placa"}
      />
    </UqaiFormik>
  );
};

export default TextComent;
