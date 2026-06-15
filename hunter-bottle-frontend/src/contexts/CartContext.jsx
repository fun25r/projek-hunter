import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'hunter_bottle_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { items: [], note: '' };
  } catch {
    return { items: [], note: '' };
  }
}

function cartReducer(state, action) {
  let newState;
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product_id === action.payload.product_id);
      if (existing) {
        newState = {
          ...state,
          items: state.items.map(i =>
            i.product_id === action.payload.product_id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      } else {
        newState = { ...state, items: [...state.items, action.payload] };
      }
      break;
    }
    case 'REMOVE_ITEM':
      newState = { ...state, items: state.items.filter(i => i.product_id !== action.payload) };
      break;
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        newState = {
          ...state,
          items: state.items.filter(i => i.product_id !== action.payload.product_id),
        };
      } else {
        newState = {
          ...state,
          items: state.items.map(i =>
            i.product_id === action.payload.product_id
              ? { ...i, quantity: action.payload.quantity }
              : i
          ),
        };
      }
      break;
    case 'SET_NOTE':
      newState = { ...state, note: action.payload };
      break;
    case 'CLEAR_CART':
      newState = { items: [], note: '' };
      break;
    default:
      return state;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, null, loadCart);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (product_id, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product_id, quantity } });
  const setOrderNote = (note) => dispatch({ type: 'SET_NOTE', payload: note });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + (i.product_price || i.price || 0) * i.quantity, 0);
  const totalWeight = state.items.reduce((sum, i) => sum + ((i.weight_gram || 1000) * i.quantity), 0);

  return (
    <CartContext.Provider value={{
      items: state.items, note: state.note,
      addItem, removeItem, updateQuantity, setOrderNote, clearCart,
      totalItems, subtotal, totalWeight,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
