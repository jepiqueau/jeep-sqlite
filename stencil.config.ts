import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  namespace: 'jeep-sqlite',
  rollupPlugins: {
    after: [
      nodePolyfills(),
    ]
  },
  sourceMap: true,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        { src: '../node_modules/sql.js/dist/sql-wasm.wasm', dest: 'assets/sql-wasm.wasm' },
        { src: 'index_delete.html', dest: 'index_delete.html' },
        { src: 'index_deleteFKC.html', dest: 'index_deleteFKC.html' },
        { src: 'index_page1_issue11.html', dest: 'index_page1_issue11.html' },
        { src: 'index_page2_issue11.html', dest: 'index_page2_issue11.html' },
        { src: 'index_incremental_upgrade_version.html', dest: 'index_incremental_upgrade_version.html' },
        { src: 'index_readonly.html', dest: 'index_readonly.html' },
      ]
    },
  ],
};
