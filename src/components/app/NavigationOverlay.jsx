import React from 'react';
const logo = '/embrator-og.webp';

const NavigationOverlay = ({ active }) => (
  <div
    className={`page-transition-overlay${active ? ' is-active' : ''}`}
    aria-hidden={!active}
  >
    <div className="page-transition-overlay__card" role="status" aria-live="polite">
      <img
        className="page-transition-overlay__logo"
        src={logo}
        alt=""
        width="120"
        height="63"
      />
      <div className="page-transition-overlay__track" aria-hidden="true">
        <span className="page-transition-overlay__progress" />
      </div>
      <span className="sr-only">Loading page</span>
    </div>
  </div>
);

export default NavigationOverlay;
