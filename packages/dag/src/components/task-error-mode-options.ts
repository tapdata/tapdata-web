type Translate = (key: string) => string

export function createTaskErrorModeOptions(
  translate: Translate,
  includeMigrateSnapshot = false,
) {
  const options = [
    {
      label: translate('packages_dag_migration_settingpanel_anzhaomorenzhong'),
      value: 'Disable',
    },
    {
      label: translate('packages_dag_migration_settingpanel_tiaoguoyichangshi'),
      value: 'SkipData',
    },
    {
      label: translate('packages_dag_migration_settingpanel_route_to_dlq'),
      value: 'DQL',
    },
  ]

  if (includeMigrateSnapshot) {
    options.push({
      label: translate('packages_dag_SkipTableForMigrateSnapshot'),
      value: 'SkipTableForMigrateSnapshot',
    })
  }

  return options
}
