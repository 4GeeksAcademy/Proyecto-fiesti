export const initialStore = () => {
  return {
    message: null,
    showMessage: false,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "SET_MESSAGE":
      return {
        ...store,
        message: action.payload,
      };
    case "SET_SHOW_MESSAGE":
      return {
        ...store,
        showMessage: action.payload,
      };
    default:
      throw Error("Unknown action.");
  }
}
