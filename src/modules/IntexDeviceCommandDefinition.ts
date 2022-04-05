/**
 * Type class representing an Intex command definition.
 */
export class IntexDeviceCommandDefinition {
  id: number | undefined;
  commandSetTypeId: number | undefined;
  currentVersion: string | undefined;
  commandSetType: string | undefined;
  commandName: string | undefined;
  commandData: string | undefined;
}
