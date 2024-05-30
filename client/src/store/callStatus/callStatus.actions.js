export const updateCallStatus = (prop, value) => {
  console.log('action', 'prop', prop, 'value', value);
  return {
    type: 'UPDATE_CALL_STATUS',
    payload: { prop, value },
  };
};
