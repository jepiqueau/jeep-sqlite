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
        { src: 'index_issue230.html', dest: 'index_issue230.html' },
        { src: 'index_page1_issue11.html', dest: 'index_page1_issue11.html' },
        { src: 'index_page2_issue11.html', dest: 'index_page2_issue11.html' },
        { src: 'index_incremental_upgrade_version.html', dest: 'index_incremental_upgrade_version.html' },
        { src: 'index_readonly.html', dest: 'index_readonly.html' },
        { src: 'index_getFromHTTP.html', dest: 'index_getFromHTTP.html' },
        { src: 'index_concurrent.html', dest: 'index_concurrent.html' },
        { src: 'index_issue385.html', dest: 'index_issue385.html' },
        { src: 'index_getFromLocalDiskToStore.html', dest: 'index_getFromLocalDiskToStore.html' },
        { src: 'index_returning.html', dest: 'index_returning.html' },
        { src: 'index_issue445.html', dest: 'index_issue445.html' },
        { src: 'index_transaction.html', dest: 'index_transaction.html' },
        { src: 'index_issue498.html', dest: 'index_issue498.html' },
        { src: 'index_issue504.html', dest: 'index_issue504.html' },
        { src: 'index_issue37.html', dest: 'index_issue37.html' },
        { src: 'index_memoryleak.html', dest: 'index_memoryleak.html' },
      ]
    },
  ],

  testing: {
    browserHeadless: "new",
  },
};
