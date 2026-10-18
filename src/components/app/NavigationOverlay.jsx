import React from 'react';
import transitionLogo from '../../assets/payment-warning-dragon-lite.webp';

const NavigationOverlay = ({ active }) => (
  <div
    className={`page-transition-overlay${active ? ' is-active' : ''}`}
    aria-hidden={!active}
  >
    <div className="page-transition-overlay__card" role="status" aria-live="polite">
      <img
        className="page-transition-overlay__logo"
        src={transitionLogo}
        alt=""
        width="240"
        height="240"
        fetchPriority="high"
        decoding="async"
      />
      <div className="page-transition-overlay__track" aria-hidden="true">
        <span className="page-transition-overlay__progress" />
      </div>
      <span className="page-transition-overlay__label" aria-hidden="true">جارٍ تحميل الصفحة</span>
      <span className="sr-only">Loading page</span>
    </div>
  </div>
);

export default NavigationOverlay;
