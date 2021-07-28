import { newE2EPage } from '@stencil/core/testing';

describe('jeep-sqlite', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<jeep-sqlite></jeep-sqlite>');
    const element = await page.find('jeep-sqlite');
    expect(element).toHaveClass('hydrated');
  });

});
