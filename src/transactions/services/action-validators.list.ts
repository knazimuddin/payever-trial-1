import { ActionItemValidatorsCollector } from './action-item-validators/action-item-validators.collector';
import { ActionItemIdentifierValidator } from './action-item-validators/validators/action-item-identifier-validator.service';
import { ActionItemTransactionValidatorService } from './action-item-validators/validators/action-item-transaction-validator.service';
import { ActionItemCaptureValidatorService } from './action-item-validators/validators/action-item-capture-validator.service';
import { ActionItemRefundValidatorService } from './action-item-validators/validators/action-item-refund-validator.service';
import { ActionAmountValidatorsCollector } from './action-amount-validators/action-amount-validators.collector';
import { ActionAmountCaptureValidatorService } from './action-amount-validators/validators/action-amount-capture-validator.service';
import { ActionAmountRefundValidatorService } from './action-amount-validators/validators/action-amount-refund-validator.service';
import { ActionAmountTransactionValidatorService } from './action-amount-validators/validators/action-amount-transaction-validator.service';

export const ActionValidatorsList: any[] = [
  ActionItemValidatorsCollector,
  ActionItemIdentifierValidator,
  ActionItemTransactionValidatorService,
  ActionItemCaptureValidatorService,
  ActionItemRefundValidatorService,

  ActionAmountValidatorsCollector,
  ActionAmountCaptureValidatorService,
  ActionAmountRefundValidatorService,
  ActionAmountTransactionValidatorService,
];
