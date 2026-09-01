import { codeBlock } from 'common-tags';
import { Fixtures } from '~test/fixtures.ts';
import { JsDelivrDatasource } from '../../datasource/jsdelivr/index.ts';
import { extractDep, extractPackageFile } from './extract.ts';

const sample = Fixtures.get(`sample.html`);
const nothing = Fixtures.get(`nothing.html`);

describe('modules/manager/html/extract', () => {
  it('extractPackageFile', () => {
    expect(extractPackageFile(sample)).toMatchSnapshot({
      deps: [
        { depName: 'prop-types', currentValue: '15.6.1' },
        { depName: 'react', currentValue: '16.3.2' },
        { depName: 'react-dom', currentValue: '16.3.2' },
        { depName: 'react-transition-group', currentValue: '2.2.1' },
        { depName: 'popper.js', currentValue: '1.14.3' },
        { depName: 'react-popper', currentValue: '0.10.4' },
        { depName: 'reactstrap', currentValue: '7.1.0' },
        { depName: 'react-router', currentValue: '4.3.1' },
        { depName: 'react-markdown', currentValue: '4.0.6' },
        {
          depName: 'axios',
          currentValue: '0.18.0',
          currentDigest: 'sha256-mpnrJ5DpEZZkwkE1ZgkEQQJW/46CSEh/STrZKOB/qoM=',
        },
      ],
    });
  });

  it('returns null', () => {
    expect(extractPackageFile(nothing)).toBeNull();
  });

  describe('extractDep', () => {
    it('extracts jsDelivr npm unscoped packages', () => {
      const tag =
        '<script src="https://cdn.jsdelivr.net/npm/jquery@4.0.0/dist/jquery.min.js"></script>';
      expect(extractDep(tag)).toEqual({
        datasource: JsDelivrDatasource.id,
        depName: 'jquery',
        packageName: 'npm/jquery/dist/jquery.min.js',
        currentValue: '4.0.0',
        replaceString: tag,
      });
    });

    it('extracts jsDelivr npm scoped packages', () => {
      const tag =
        '<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>';
      expect(extractDep(tag)).toEqual({
        datasource: JsDelivrDatasource.id,
        depName: '@popperjs/core',
        packageName: 'npm/@popperjs/core/dist/umd/popper.min.js',
        currentValue: '2.11.8',
        replaceString: tag,
      });
    });

    it('extracts jsDelivr gh packages', () => {
      const tag =
        '<script src="https://cdn.jsdelivr.net/gh/twbs/bootstrap@5.3.8/dist/js/bootstrap.min.js"></script>';
      expect(extractDep(tag)).toEqual({
        datasource: JsDelivrDatasource.id,
        depName: 'twbs/bootstrap',
        packageName: 'gh/twbs/bootstrap/dist/js/bootstrap.min.js',
        currentValue: '5.3.8',
        replaceString: tag,
      });
    });

    it('extracts integrity hashes from jsDelivr tags', () => {
      const tag =
        '<script src="https://cdn.jsdelivr.net/npm/jquery@4.0.0/dist/jquery.min.js" integrity="sha256-mpnrJ5DpEZZkwkE1ZgkEQQJW/46CSEh/STrZKOB/qoM=" crossorigin="anonymous"></script>';
      expect(extractDep(tag)).toEqual({
        datasource: JsDelivrDatasource.id,
        depName: 'jquery',
        packageName: 'npm/jquery/dist/jquery.min.js',
        currentValue: '4.0.0',
        currentDigest: 'sha256-mpnrJ5DpEZZkwkE1ZgkEQQJW/46CSEh/STrZKOB/qoM=',
        replaceString: tag,
      });
    });

    it('returns null for unrecognized tags', () => {
      expect(extractDep('<script src="js/main.jsx"></script>')).toBeNull();
    });
  });

  it('extracts jsDelivr dependencies from a full HTML document', () => {
    const content = codeBlock`
      <script src="https://cdn.jsdelivr.net/npm/jquery@4.0.0/dist/jquery.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/gh/twbs/bootstrap@5.3.8/dist/js/bootstrap.min.js"></script>
    `;
    expect(extractPackageFile(content)).toEqual({
      deps: [
        {
          datasource: JsDelivrDatasource.id,
          depName: 'jquery',
          packageName: 'npm/jquery/dist/jquery.min.js',
          currentValue: '4.0.0',
          replaceString:
            '<script src="https://cdn.jsdelivr.net/npm/jquery@4.0.0/dist/jquery.min.js">',
        },
        {
          datasource: JsDelivrDatasource.id,
          depName: '@popperjs/core',
          packageName: 'npm/@popperjs/core/dist/umd/popper.min.js',
          currentValue: '2.11.8',
          replaceString:
            '<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js">',
        },
        {
          datasource: JsDelivrDatasource.id,
          depName: 'twbs/bootstrap',
          packageName: 'gh/twbs/bootstrap/dist/js/bootstrap.min.js',
          currentValue: '5.3.8',
          replaceString:
            '<script src="https://cdn.jsdelivr.net/gh/twbs/bootstrap@5.3.8/dist/js/bootstrap.min.js">',
        },
      ],
    });
  });
});
