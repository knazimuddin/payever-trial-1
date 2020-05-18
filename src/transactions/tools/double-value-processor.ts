import { ElasticMappingFieldsConfig } from '../enum';

export class DoubleValueProcessor {
  public static process(
    field: string,
    filter: any,
  ): any {
    if (!ElasticMappingFieldsConfig[field] || ElasticMappingFieldsConfig[field].type !== 'long') {
      return filter;
    }

    for (const key of filter.value.keys()) {
      if (typeof filter.value[key] === 'object' ) {
        filter.value[key] = this.processObjectValue(filter.value[key]);
      } else {
        filter.value[key] = this.processPlainValue(filter.value[key]);
      }
    }

    return filter;
  }

  private static processObjectValue(value: any): { } {
    for (const valueKey in value) {
      if (value.hasOwnProperty(valueKey)) {
        value[valueKey] = this.processPlainValue(value[valueKey]);
      }
    }

    return value;
  }

  private static processPlainValue(value: any): number {
    return value * 100;
  }
}
