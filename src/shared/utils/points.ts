//Calcular los puntos de una compra para sumarlo a un Cliente
export const calcPoints = (amount: any): number => {
  if (!amount || amount < 0) return 0;
  const totalPointsEarnd = Math.ceil(amount / 3);

  return totalPointsEarnd;
};
