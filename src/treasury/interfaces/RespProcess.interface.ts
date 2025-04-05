export interface RespProcess {
  status: boolean;
  message: string;
  alreadyPaid: string[];
  numberOfRecords: number;
  failedPayments: any[];
  successfulPayments: any[];
  total: number;
  totalDebtPending: number;
}
