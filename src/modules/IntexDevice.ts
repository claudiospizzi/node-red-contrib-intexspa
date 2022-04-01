/**
 * Type class representing an Intex device.
 */
export class IntexDevice {
  deviceId: string | undefined;
  userId: string | undefined;
  userDeviceRoleId: number | undefined;
  deviceAliasName: string | undefined;
  userDeviceRole: string | undefined;
  deviceIdentifier: string | undefined;
  remoteControll: boolean | undefined;
  subDeviceTypeId: number | undefined;
  deviceTypeId: number | undefined;
  deviceTypeName: string | undefined;
  subTypeName: string | undefined;
  controllPageNumber: string | undefined;
  isShowUIData: boolean | undefined;
  commandSetTypeId: number | undefined;
  currentFirmwareVersion: string | undefined;
  ipAddress: string | undefined;
  ssid: string | undefined;
  port: string | undefined;
  ioTPlatformSwitchFlag: boolean | undefined;
  isDeployCurrentIOTInfo: boolean | undefined;
  hasLatestFirmwareVersion: boolean | undefined;
  thresholdValue: number | undefined;
  offlineState: boolean | undefined;
  onlineState: boolean | undefined;
}
