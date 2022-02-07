import { ScopeEnum } from '@pe/folders-plugin';

export class TransactionsFilter {
  public static applyBusinessFilter(
    businessId: string,
    filters: any = { },
    addScope: boolean = false,
  ): any {
    filters.business_uuid = [{
      condition: 'is',
      value: [businessId],
    }];
    if (addScope) {
      filters.scope = [{
        condition: 'is',
        value: [ScopeEnum.Business],
      }];
    }

    return filters;
  }

  public static applyUserIdFilter(
    userId: string,
    filters: any = { },
    addScope: boolean = false,
  ): any {
    filters.userId = [{
      condition: 'is',
      value: [userId],
    }];
    if (addScope) {
      filters.scope = [{
        condition: 'is',
        value: [ScopeEnum.User],
      }];
    }

    return filters;
  }

  public static applyUserUuidFilter(
    userId: string,
    filters: any = { },
    addScope: boolean = false,
  ): any {
    filters.user_uuid = [{
      condition: 'is',
      value: [userId],
    }];
    if (addScope) {
      filters.scope = [{
        condition: 'is',
        value: [ScopeEnum.User],
      }];
    }

    return filters;
  }
}
