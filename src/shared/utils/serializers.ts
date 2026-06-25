//Detecta y convierte los campos Decimal a Number en la respuesta JSON de los Controllers,
// para evitar problemas de serialización con Prisma Decimal
export function formatResponse<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => formatResponse(item)) as unknown as T;
  }

  if (typeof data === "object") {
    const formatted = {} as { [K in keyof T]: any };

    for (const key in data) {
      const value = (data as any)[key];

      if (value && typeof value === "object") {
        if (typeof value.toNumber === "function") {
          formatted[key] = value.toNumber();
        } else {
          formatted[key] = formatResponse(value);
        }
      } else {
        formatted[key] = value;
      }
    }

    return formatted as T;
  }

  return data;
}