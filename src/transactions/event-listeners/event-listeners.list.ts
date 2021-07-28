import { HistoryRecordEventListener } from './history-record-event.listener';
import { StatisticsEventListener } from './statistics-event.listener';
import { BeforeSantanderSeShippingGoodsEventListener } from './before-santander-se-shipping-goods-event.listener';
import { SendTransactionUpdateEventAfterActionListener } from './send-transaction-update-event-after-action.listener';
import { ValidateItemsBeforeActionListener } from './validate-items-before-action.listener';
import { SaveItemsAfterActionListener } from './save-items-after-action.listener';
import { ValidateAmountBeforeActionListener } from './validate-amount-before-action.listener';
import { ValidateAmountMatchesItemsBeforeActionListener } from './validate-amount-matches-items-before-action.listener';
import { FolderDocumentsListener } from './folder-documents.listener';
import { SendHistoryEventAfterActionListener } from './send-history-event-after-action.listener';

export const EventListenersList: any[] = [
  BeforeSantanderSeShippingGoodsEventListener,
  HistoryRecordEventListener,
  SaveItemsAfterActionListener,
  SendHistoryEventAfterActionListener,
  SendTransactionUpdateEventAfterActionListener,
  StatisticsEventListener,
  ValidateAmountBeforeActionListener,
  ValidateAmountMatchesItemsBeforeActionListener,
  ValidateItemsBeforeActionListener,
  FolderDocumentsListener,
];
