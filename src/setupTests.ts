import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Set testing-library configuration options
configure({
  testIdAttribute: 'data-testid',
});
