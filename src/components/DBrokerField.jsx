import { Field } from "formik";
import React from "react";

const DBrokerField = ({ name, searchTerm, handleChange, results }) => {
  return (
    <>
      <Field
        name={name}
        // render={({ field }) => (
        //   <div>
        //     <input
        //       {...field}
        //       type="text"
        //       placeholder="Buscar usuario"
        //       value={searchTerm}
        //       onChange={handleChange}
        //     />
        //     <ul>
        //       {results.map((result) => (
        //         <li key={result.id}>{result.name}</li>
        //       ))}
        //     </ul>
        //   </div>
        // )}
      >
        {({ field, form }) => (
          <div>
            <input type="text" {...field} placeholder="Buscar usuario" />
            <ul>
              {results.map((result) => (
                <li key={result.ID}>{result.ALIAS}</li>
              ))}
            </ul>
          </div>
        )}
      </Field>
    </>
  );
};

export default DBrokerField;
