import { IProviderSettings, SETTINGS } from 'core/config/settings';

export interface IDcosProviderSettings extends IProviderSettings {
  defaults: {
    account?: string;
    proxy?: string;
  };
}

export const DcosProviderSettings: IDcosProviderSettings = <IDcosProviderSettings>SETTINGS.providers.dcos || { defaults: {} };
if (DcosProviderSettings) {
  DcosProviderSettings.resetToOriginal = SETTINGS.resetToOriginal;
}
