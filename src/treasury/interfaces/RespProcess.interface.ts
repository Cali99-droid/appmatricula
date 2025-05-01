export interface RespProcess {
  status: boolean;
  message: string;
  alreadyPaid: DetailStudent[];
  numberOfRecords: number;
  failedPayments: any[];
  successfulPayments: any[];
  total: number;
  totalDebtPending: number;
}

export interface DetailStudent {
  code: string;
  student: string;
}
