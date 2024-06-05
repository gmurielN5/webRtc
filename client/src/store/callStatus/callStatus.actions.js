export const updateCallStatus = (prop, value) => {
  return {
    type: 'UPDATE_CALL_STATUS',
    payload: { prop, value },
  };
};
