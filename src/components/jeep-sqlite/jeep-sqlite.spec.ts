import { newSpecPage } from '@stencil/core/testing';
import { JeepSqlite } from './jeep-sqlite';

describe('jeep-sqlite', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [JeepSqlite ],
      html: '<jeep-sqlite></jeep-sqlite>',
    });
    expect(root).toEqualHtml(`
      <jeep-sqlite>
        <mock:shadow-root>
        </mock:shadow-root>
      </jeep-sqlite>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [JeepSqlite],
      html: `<jeep-sqlite></jeep-sqlite>`,
    });
    expect(root).toEqualHtml(`
      <jeep-sqlite>
        <mock:shadow-root>
        </mock:shadow-root>
      </jeep-sqlite>
    `);
  });
});
