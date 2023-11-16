const siniestrosReducer = (state = [], action) => {
  switch (action.type) {
    case "SAVE_DATA_STORAGE":
      return action.payload;
    default:
      return state;
  }
};

export default siniestrosReducer;
