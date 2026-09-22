/**
 * The "Reference" section of a generated element page: the environment variables a component or add-on defines,
 * from the `diploi.yaml` of its repository as the Console has parsed it.
 */
import type { Element, ElementConfig } from './api';

type ParameterGroup = NonNullable<ElementConfig['parameterGroups']>[number];
type Parameter = ParameterGroup['parameters'][number];

const table = (headers: string[], rows: string[][]) =>
  [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');

const code = (value: string) => `\`${value.replace(/\|/g, '\\|')}\``;

/** Values like `${generate-random-password:16}` are generated per deployment, not literal defaults */
const defaultValue = (value: Parameter['defaultValue']) => {
  if (value === undefined || value === '') return '';
  const text = String(value);
  return /\$\{[^}]+\}/.test(text) ? '_generated_' : code(text);
};

/** Many elements name a parameter after its identifier, which would just repeat the first column */
const describe = (parameter: Parameter) => {
  const text = parameter.description ?? parameter.name ?? '';
  return text.replace(/[\s_]/g, '').toLowerCase() ===
    parameter.identifier.replace(/[\s_]/g, '').toLowerCase()
    ? ''
    : text;
};

const parameterRows = (group: ParameterGroup) =>
  group.parameters.map((parameter) => [
    code(parameter.identifier),
    parameter.type,
    defaultValue(parameter.defaultValue),
    describe(parameter),
  ]);

const environmentSection = (element: Element, config: ElementConfig) => {
  const groups = (config.parameterGroups ?? []).filter(
    (group) => group.parameters.length,
  );
  const variables = config.environmentVariables ?? [];
  if (!groups.length && !variables.length) return '';

  const importer = element.type === 'addon' ? 'Components' : 'Other components';
  const parts = [
    '### Environment variables',
    '',
    `${element.name} sets these values in every deployment.`,
    `${importer} can import them with [\`env.include\`](/reference/diploi-yaml#env) as \`${element.identifier}.*\`.`,
    'Defaults marked _generated_ are unique to each deployment.',
  ];

  if (groups.length) {
    parts.push('', "Parameters are set on the deployment's **Setup** tab.");
  }

  for (const group of groups) {
    const optional = group.toggleable
      ? group.defaultValue === false
        ? 'Optional, off by default.'
        : 'Optional.'
      : '';
    const notes = [group.description?.replace(/\.?$/, '.'), optional]
      .filter(Boolean)
      .join(' ');
    parts.push(
      '',
      `**${group.name ?? group.identifier}**`,
      ...(notes ? ['', notes] : []),
      '',
      table(
        ['Variable', 'Type', 'Default', 'Description'],
        parameterRows(group),
      ),
    );
  }

  if (variables.length) {
    parts.push(
      '',
      '**Other variables**',
      '',
      "Set by the package. Override them on the deployment's **Environment** tab or in `diploi.yaml`.",
      '',
      table(
        ['Variable', 'Default'],
        variables.map((variable) => [
          code(variable.identifier),
          defaultValue(variable.defaultValue),
        ]),
      ),
    );
  }

  return parts.join('\n');
};

/**
 * `diploi describe` reports what a deployment is actually running with, which the tables above cannot: the current
 * values, the addresses and the connection strings.
 */
const describeTip = (element: Element) => {
  // The identifier of a starter kit is not a component of the deployment, so describe the deployment itself
  const target = element.type === 'starter' ? '' : ` ${element.identifier}`;
  return [
    ':::tip[Check a running deployment]',
    `Run \`diploi describe${target}\` in a development environment to see the values a deployment actually uses, its addresses and its connection strings.`,
    'Secrets are masked unless you add `--reveal`.',
    'Add `--json` to get the same output as JSON, for scripts and AI agents.',
    ':::',
  ].join('\n');
};

/** The generated reference of an element, empty when its configuration is not available */
export const referenceSection = (element: Element): string => {
  const { config } = element;
  if (!config) return '';

  const sections = [environmentSection(element, config)].filter(Boolean);
  if (!sections.length) return '';

  return [
    `## ${element.name} reference`,
    '',
    `What ${element.name} defines in a deployment.`,
    '',
    describeTip(element),
    '',
    ...sections,
  ].join('\n');
};
