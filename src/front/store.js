export const initialStore = () => {
  return {
    message: null,
    showMessage: false,
  };
};

// export default function storeReducer(store, action = {}) {
//   switch (action.type) {
//     case "SET_MESSAGE":
//       return {
//         ...store,
//         message: action.payload,
//       };
//     case "SET_SHOW_MESSAGE":
//       return {
//         ...store,
//         showMessage: action.payload,
//       };
//     default:
//       throw Error("Unknown action.");
//   }
// }

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
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
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      throw Error('Unknown action.');
  }    
}