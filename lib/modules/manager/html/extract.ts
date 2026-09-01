import { regEx } from '../../../util/regex.ts';
import { CdnjsDatasource } from '../../datasource/cdnjs/index.ts';
import { JsDelivrDatasource } from '../../datasource/jsdelivr/index.ts';
import { cloudflareUrlRegex } from '../cdnurl/extract.ts';
import type { PackageDependency, PackageFileContent } from '../types.ts';

const regex = regEx(/<\s*(script|link)\s+[^>]*?\/?>/i);

const integrityRegex = regEx(
  /\s+integrity\s*=\s*("|')(?<currentDigest>[^"']+)/,
);

// https://cdn.jsdelivr.net/npm/jquery@4.0.0/dist/jquery.min.js
// https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js
const jsDelivrNpmUrlRegex = regEx(
  /\/\/cdn\.jsdelivr\.net\/npm\/(?<depName>(?:@[^/@]+\/)?[^/@]+)@(?<currentValue>[^/]+)\/(?<asset>[-/_.a-zA-Z0-9]+)/,
);

// https://cdn.jsdelivr.net/gh/jquery/jquery@4.0.0/dist/jquery.min.js
const jsDelivrGithubUrlRegex = regEx(
  /\/\/cdn\.jsdelivr\.net\/gh\/(?<depName>[^/@]+\/[^/@]+)@(?<currentValue>[^/]+)\/(?<asset>[-/_.a-zA-Z0-9]+)/,
);

export function extractDep(tag: string): PackageDependency | null {
  const cdnjsMatch = cloudflareUrlRegex.exec(tag);
  if (cdnjsMatch?.groups) {
    const { depName, currentValue, asset } = cdnjsMatch.groups;
    return buildDep(
      tag,
      CdnjsDatasource.id,
      depName,
      `${depName}/${asset}`,
      currentValue,
    );
  }

  const npmMatch = jsDelivrNpmUrlRegex.exec(tag);
  if (npmMatch?.groups) {
    const { depName, currentValue, asset } = npmMatch.groups;
    return buildDep(
      tag,
      JsDelivrDatasource.id,
      depName,
      `npm/${depName}/${asset}`,
      currentValue,
    );
  }

  const ghMatch = jsDelivrGithubUrlRegex.exec(tag);
  if (ghMatch?.groups) {
    const { depName, currentValue, asset } = ghMatch.groups;
    return buildDep(
      tag,
      JsDelivrDatasource.id,
      depName,
      `gh/${depName}/${asset}`,
      currentValue,
    );
  }

  return null;
}

export function extractPackageFile(content: string): PackageFileContent | null {
  const deps: PackageDependency[] = [];
  let rest = content;
  let match = regex.exec(rest);
  let offset = 0;
  while (match) {
    const [replaceString] = match;
    offset += match.index + replaceString.length;
    rest = content.slice(offset);
    match = regex.exec(rest);
    const dep = extractDep(replaceString);
    if (dep) {
      deps.push(dep);
    }
  }
  if (!deps.length) {
    return null;
  }
  return { deps };
}

function buildDep(
  tag: string,
  datasource: string,
  depName: string,
  packageName: string,
  currentValue: string,
): PackageDependency {
  const dep: PackageDependency = {
    datasource,
    depName,
    packageName,
    currentValue,
    replaceString: tag,
  };
  const integrityMatch = integrityRegex.exec(tag);
  if (integrityMatch?.groups) {
    dep.currentDigest = integrityMatch.groups.currentDigest;
  }
  return dep;
}
