// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// ResizeObserver のモック
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver のモック
global.IntersectionObserver = class IntersectionObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// window.matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Audio のモック
global.Audio = class Audio {
  constructor() {
    this.src = '';
    this.preload = 'auto';
    this.oncanplaythrough = null;
    this.onerror = null;
  }
  play() {
    return Promise.resolve();
  }
  pause() {}
  stop() {}
  load() {}
};

