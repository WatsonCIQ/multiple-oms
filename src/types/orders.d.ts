import { Context } from '@finos/fdc3';
export interface OrderContext extends Context {
  order?: Order
}


export interface Order {
  account: string;
  appName?: string;
  broker: string;
  destinationApp?: string;
  duration: string;
  executedQuantity: number;
  executedPrice: string;
  instruction: string;
  limit: string;
  manager: string;
  orderId: string | number;
  securityId: string | number;
  securityType: string;
  settlementDate: string | Date;
  status: "NEW" | "OPEN" | "ACCT" | "WORK" | "READY"|"EXECUTING"|"WAITING FOR ACK";
  targetAmount: string | number;
  targetPrice: string | number;
  targetQuantity: number;
  ticker: string;
  tradeDate: string | Date;
  trader: string;
  transactionType: "BUYL" | "SELLL";
}

