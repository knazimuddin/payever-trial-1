import { FoldersPluginOptionsInterface } from '@pe/folders-plugin';
import { ElasticConfig } from './elastic.config';

export const FoldersConfig: FoldersPluginOptionsInterface = {
  combinedList: false,
  cucumberTest: false,
  elastic: ElasticConfig,
  useBusiness: true,
};
