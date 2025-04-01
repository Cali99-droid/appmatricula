export type RespProcessType = {
  status: boolean;
  message: string;
  alreadyPaid: string[];
  amount: number;
  failedPayments: any[];
  successfulPayments: any[];
};
