export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join_room',
  ORDER_CREATED: 'order_created',     // Mesero -> Cocina
  ORDER_READY: 'order_ready',         // Cocina -> Caja/Mesero
  ORDER_PAID: 'order_paid',           // Caja -> Sistema
};

export const ROOMS = {
  KITCHEN: 'kitchen',
  CASHIER: 'cashier',
};