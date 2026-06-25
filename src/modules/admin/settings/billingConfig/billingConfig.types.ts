import { BillingConfig } from "../../../../generated/prisma/client.js";

export const SALE_CHANNELS = ["POS", "WEB"];

export type billingConfig = {
  id: BillingConfig["id"];
  uuid: BillingConfig["uuid"];
  channel: BillingConfig["channel"];
  cai: BillingConfig["cai"];
  rangeFrom: BillingConfig["rangeFrom"];
  rangeTo: BillingConfig["rangeTo"];
  limitDate: BillingConfig["limitDate"];
  prefix: BillingConfig["prefix"];
  currentSequence: BillingConfig["currentSequence"];
  isActive: BillingConfig["isActive"];
  createdAt: BillingConfig["createdAt"];
  updatedAt: BillingConfig["updatedAt"];
};

export type createBillingConfig = Pick<
  billingConfig,
  | "channel"
  | "cai"
  | "rangeFrom"
  | "rangeTo"
  | "limitDate"
  | "prefix"
  | "currentSequence"
  | "isActive"
>;

export type updateBillingConfig = createBillingConfig;
