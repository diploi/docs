/**
 * The "Reference" section of a generated element page: what the component or add-on exposes, built from its parsed
 * `diploi.yaml` (the same configuration the deployments run with, fetched from the Console API).
 *
 * This is the part an AI agent cannot find anywhere else: the addresses to reach the element at, the environment
 * variables it publishes and the ready-made connection strings.
 */
import type { Element, ElementConfig } from './api';

type Host = NonNullable<ElementConfig['hosts']>[number];
type ParameterGroup = NonNullable<ElementConfig['parameterGroups']>[number];
type Parameter = ParameterGroup['parameters'][number];

const table = (headers: string[], rows: string[][]) =>
  [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n');

const code = (value: string) => `\`${value.replace(/\|/g, '\\|')}\``;

/** Values like `${generate-random-password:16}` are generated per deployment, not literal defaults */
const defaultValue = (value: Parameter['defaultValue']) => {
  if (value === undefined || value === '') return '';
  const text = String(value);
  return /\$\{[^}]+\}/.test(text) ? '_generated_' : code(text);
};

const addressesSection = (element: Element, config: ElementConfig) => {
  // Without a port the component does not declare where it listens, and an address built from the defaults would be
  // wrong (the connection strings then say how to reach it)
  const hosts = (config.hosts ?? []).filter((host): host is Host & { port: number } => typeof host.port === 'number');
  if (!hosts.length) return '';

  const rows = hosts.map((host) => [
    code(host.identifier),
    host.endpoint === false ? 'no' : 'yes',
    code(`${host.serviceName ?? 'app'}.${element.identifier}:${host.port}`),
    code(`${host.identifier.replace(/-/g, '_').toUpperCase()}_ENDPOINT`),
  ]);

  return [
    '### Addresses',
    '',
    `Every host of ${element.name} is a service inside the deployment. Other components and the development environment reach it at its internal address; hosts that are exposed also get a public url, which the component itself gets as an environment variable.`,
    '',
    table(['Host', 'Public url', 'Internal address', 'Url in the environment'], rows),
  ].join('\n');
};

const connectionStringsSection = (element: Element, config: ElementConfig) => {
  const strings = config.connectionStrings ?? [];
  if (!strings.length) return '';

  return [
    '### Connection strings',
    '',
    `Ready-made addresses for ${element.name}, with the deployment's own values filled in. The Diploi Console shows them under the ${element.type === 'addon' ? 'add-on' : 'component'}; \`\${...}\` refers to the environment variables below.`,
    '',
    table(
      ['Name', 'Value'],
      strings.map((item) => [item.name, code(item.value)]),
    ),
  ].join('\n');
};

const parameterRows = (group: ParameterGroup) =>
  group.parameters.map((parameter) => [
    code(parameter.identifier),
    parameter.type === 'secret' ? 'secret' : parameter.type,
    defaultValue(parameter.defaultValue),
    parameter.description ?? parameter.name ?? '',
  ]);

const environmentSection = (element: Element, config: ElementConfig) => {
  const groups = (config.parameterGroups ?? []).filter((group) => group.parameters.length);
  const variables = config.environmentVariables ?? [];
  if (!groups.length && !variables.length) return '';

  const importer = element.type === 'addon' ? 'a component' : 'another component';
  const parts = [
    '### Environment variables',
    '',
    `These are available to ${element.name} itself, and can be imported into ${importer} with [\`env.include\`](/reference/diploi-yaml#env) as \`${element.identifier}.*\`. Values marked _secret_ are generated per deployment and shown masked; see them in the Diploi Console or with \`diploi describe ${element.identifier} --reveal\`.`,
  ];

  for (const group of groups) {
    const optional = group.toggleable ? `Only set when the group is enabled${group.defaultValue === false ? ' (off by default)' : ''}.` : '';
    const notes = [group.description?.replace(/\.?$/, '.'), optional].filter(Boolean).join(' ');
    parts.push(
      '',
      `**${group.name ?? group.identifier}**${notes ? ` — ${notes}` : ''}`,
      '',
      table(['Variable', 'Type', 'Default', 'Description'], parameterRows(group)),
    );
  }

  if (variables.length) {
    parts.push(
      '',
      '**Other variables** — set by the package, can be overridden in the Diploi Console or in `diploi.yaml`.',
      '',
      table(
        ['Variable', 'Default'],
        variables.map((variable) => [code(variable.identifier), defaultValue(variable.defaultValue)]),
      ),
    );
  }

  return parts.join('\n');
};

const runtimeSection = (element: Element, config: ElementConfig) => {
  const rows: string[][] = [];
  if (element.developmentStartupCommand) rows.push(['Development command', code(element.developmentStartupCommand)]);
  if (element.productionStartupCommand) rows.push(['Production command', code(element.productionStartupCommand)]);
  if (config.defaultContainer) rows.push(['Main container', code(config.defaultContainer)]);
  for (const volume of config.storage ?? []) {
    rows.push([`Storage \`${volume.identifier}\``, `${volume.sizeMiB >= 1024 ? `${volume.sizeMiB / 1024} GiB` : `${volume.sizeMiB} MiB`}`]);
  }
  if (!rows.length) return '';

  return [
    '### Runtime',
    '',
    `How ${element.name} runs in a deployment. The commands are what the container starts with; the main container is the one \`diploi logs ${element.identifier}\` and \`diploi exec ${element.identifier}\` use by default.`,
    '',
    table(['', ''], rows),
  ].join('\n');
};

/** The generated reference of an element, empty when its configuration is not available */
export const referenceSection = (element: Element): string => {
  const { config } = element;
  if (!config) return '';

  const sections = [
    addressesSection(element, config),
    connectionStringsSection(element, config),
    environmentSection(element, config),
    runtimeSection(element, config),
  ].filter(Boolean);
  if (!sections.length) return '';

  return [`## ${element.name} reference`, '', `What ${element.name} exposes in a deployment, from its own configuration.`, '', ...sections].join(
    '\n'
  );
};
