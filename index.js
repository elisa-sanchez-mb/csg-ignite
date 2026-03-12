/* ============================================================
   1. ACCORDION CORE
   ============================================================ */
(function () {
  if (window.accordionSetupComplete) {
    console.log("Accordion setup already completed");
    return;
  }

  window.accordionSetupComplete = true;

  function setupAccordions() {
    console.log("Setting up accordions");

    let pageAccordionCount = 0;

    const accordionLists = document.querySelectorAll('[cc-accordion-element="list"]');

    accordionLists.forEach(accordionList => {
      const accordions = accordionList.querySelectorAll('[cc-accordion-element="accordion"]');
      const triggerButtons = Array.from(accordionList.querySelectorAll('[cc-accordion-element="trigger"]'));

      accordions.forEach((accordion) => {
        pageAccordionCount++;

        const trigger = accordion.querySelector('[cc-accordion-element="trigger"]');
        const content = accordion.querySelector('[cc-accordion-element="content"]');
        const icon    = accordion.querySelector('[cc-accordion-element="icon"]');

        const triggerSummaryId = `accordion-summary-${pageAccordionCount}`;
        const contentDetailsId = `accordion-details-${pageAccordionCount}`;

        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-controls', contentDetailsId);
        trigger.setAttribute('id', triggerSummaryId);

        content.setAttribute('id', contentDetailsId);
        content.setAttribute('aria-labelledby', triggerSummaryId);
        content.setAttribute('role', 'region');

        trigger.setAttribute('aria-expanded', 'false');
        content.style.height    = '0px';
        content.style.opacity   = '0';
        icon.style.transform    = 'rotate(0deg)';
        accordion.removeAttribute('open');

        const toggleAccordion = (targetAccordion) => {
          const targetTrigger = targetAccordion.querySelector('[cc-accordion-element="trigger"]');
          const targetContent = targetAccordion.querySelector('[cc-accordion-element="content"]');
          const targetIcon    = targetAccordion.querySelector('[cc-accordion-element="icon"]');
          const isExpanded    = targetTrigger.getAttribute('aria-expanded') === 'true';

          targetTrigger.setAttribute('aria-expanded', !isExpanded);

          if (!isExpanded) {
            targetContent.style.height    = `${targetContent.scrollHeight}px`;
            targetContent.style.opacity   = '1';
            targetIcon.style.transform    = 'rotate(180deg)';
            targetAccordion.setAttribute('open', '');

            window.dispatchEvent(new CustomEvent('accordionOpen', {
              detail: {
                accordionElement: targetAccordion,
                index: Array.from(accordions).indexOf(targetAccordion)
              }
            }));
          } else {
            targetContent.style.height    = '0px';
            targetContent.style.opacity   = '0';
            targetIcon.style.transform    = 'rotate(0deg)';
            targetAccordion.removeAttribute('open');

            window.dispatchEvent(new CustomEvent('accordionClose', {
              detail: {
                accordionElement: targetAccordion,
                index: Array.from(accordions).indexOf(targetAccordion)
              }
            }));
          }
        };

        trigger.addEventListener('click', () => toggleAccordion(accordion));

        trigger.addEventListener('keydown', (event) => {
          const currentIndex = triggerButtons.indexOf(trigger);
          switch (event.key) {
            case ' ':
            case 'Enter':
              event.preventDefault();
              toggleAccordion(accordion);
              break;
            case 'ArrowDown':
              event.preventDefault();
              triggerButtons[(currentIndex + 1) % triggerButtons.length].focus();
              break;
            case 'ArrowUp':
              event.preventDefault();
              (triggerButtons[currentIndex - 1] || triggerButtons[triggerButtons.length - 1]).focus();
              break;
            case 'Home':
              event.preventDefault();
              triggerButtons[0].focus();
              break;
            case 'End':
              event.preventDefault();
              triggerButtons[triggerButtons.length - 1].focus();
              break;
          }
        });
      });
    });

    console.log("Accordion setup complete");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAccordions);
  } else {
    setupAccordions();
  }
})();

/* ============================================================
   2. ACCORDION DEFAULTS + QUERY PARAM LINKING
   Exposed globally so Memberstack (below) can call it
   after gated elements are made visible.
   ============================================================ */
function openAccordion(accordion) {
  const trigger = accordion.querySelector('[cc-accordion-element="trigger"]');
  const content = accordion.querySelector('[cc-accordion-element="content"]');
  const icon    = accordion.querySelector('[cc-accordion-element="icon"]');

  trigger.setAttribute('aria-expanded', 'true');
  content.style.height  = `${content.scrollHeight}px`;
  content.style.opacity = '1';
  icon.style.transform  = 'rotate(180deg)';
  accordion.setAttribute('open', '');
}

function scrollWithOffset(element, offsetRem = 4) {
  const offsetPx = offsetRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const top = element.getBoundingClientRect().top + window.scrollY - offsetPx;
  window.scrollTo({ top, behavior: 'smooth' });
}

function initAccordionDefaults() {
  const params = new URLSearchParams(window.location.search);
  const anchor = params.get('guide');

  if (anchor) {
    const target = document.querySelector(`[cc-accordion-anchor="${anchor}"]`);
    if (target) {
      openAccordion(target);
      scrollWithOffset(target, 10);
      return;
    }
  }

  // Fallback: open first accordion in each list
  document.querySelectorAll('[cc-accordion-element="list"]').forEach(list => {
    const first = list.querySelector('[cc-accordion-element="accordion"]');
    if (first) openAccordion(first);
  });
}

/* ============================================================
   3. MODAL
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  let lastFocusedElement = null;
  let activeModal = null;
  const STORAGE_KEY = "mb_modal_seen";

  const hasSeenModal = localStorage.getItem(STORAGE_KEY);
  if (!hasSeenModal) {
    const onloadModal = document.querySelector('[mb-modal="element"][mb-modal-onload="true"]');
    if (onloadModal) {
      openModal(onloadModal);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }

  document.addEventListener("click", function (e) {
    const openBtn = e.target.closest('[mb-modal="open"]');
    if (openBtn) {
      e.preventDefault();
      const modalId = openBtn.getAttribute("mb-modal-element");
      const modal   = document.querySelector(`[mb-modal="element"][mb-modal-element="${modalId}"]`);
      if (modal) openModal(modal);
    }

    const closeBtn = e.target.closest('[mb-modal="close"]');
    if (closeBtn) {
      const modal = closeBtn.closest('[mb-modal="element"]');
      if (modal) closeModal(modal);
    }
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeModal) closeModal(activeModal);
  });

  function openModal(modal) {
    activeModal        = modal;
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-active");
    document.body.classList.add("no-scroll");
    if (typeof lenis !== "undefined") lenis.stop();
    trapFocus(modal);
    const focusable = getFocusable(modal);
    if (focusable.length) focusable[0].focus();
  }

  function closeModal(modal) {
    modal.classList.remove("is-active");
    document.body.classList.remove("no-scroll");
    if (typeof lenis !== "undefined") lenis.start();
    releaseFocusTrap(modal);
    if (lastFocusedElement) lastFocusedElement.focus();
    activeModal = null;
  }

  function getFocusable(modal) {
    return modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  function trapFocus(modal) {
    function handleTab(e) {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(modal);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
    modal._handleTab = handleTab;
    modal.addEventListener("keydown", handleTab);
  }

  function releaseFocusTrap(modal) {
    if (modal._handleTab) {
      modal.removeEventListener("keydown", modal._handleTab);
      delete modal._handleTab;
    }
  }
});

/* ============================================================
   4. MEMBERSTACK — runs last, calls initAccordionDefaults()
   after gated elements are shown/hidden so scrollHeight
   is accurate for any ?guide= param links.
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  window.$memberstackDom.getCurrentMember().then(({ data: member }) => {
    const els      = document.querySelectorAll('[data-toolkit-show="true"]');
    const role     = member?.customFields?.igniterole;
    const hasAccess = role === "reward_manager" || role === "super_admin";

    if (els.length) {
      els.forEach(el => el.style.display = hasAccess ? "block" : "none");
    }

    // Init accordions only after visibility is resolved
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initAccordionDefaults();
      });
    });
  });
});

/* ============================================================
   IMAGE LIGHTBOX
   On click of .expand_img_wrapper, opens the sibling image
   in an accessible modal lightbox. Closes on Esc or close button.
   ============================================================ */
(function () {

  let lastFocused = null;

  /* ── Create the lightbox DOM (once) ── */
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image lightbox');
  overlay.setAttribute('tabindex', '-1');

  overlay.innerHTML = `
    <button id="lightbox-close" aria-label="Close lightbox">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
           width="20" height="20" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <img id="lightbox-img" src="" alt="" />
  `;

  const style = document.createElement('style');
  style.textContent = `
    #lightbox-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.85);
      align-items: center;
      justify-content: center;
      padding: 2rem;
      box-sizing: border-box;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #lightbox-overlay.is-active {
      display: flex;
    }
    #lightbox-overlay.is-visible {
      opacity: 1;
    }
    #lightbox-img {
      max-width: 100%;
      max-height: 90vh;
      width: auto;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
      display: block;
      object-fit: contain;
    }
    #lightbox-close {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      transition: background 0.15s ease;
      flex-shrink: 0;
    }
    #lightbox-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    #lightbox-close:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }
    .expand_img_wrapper {
      cursor: zoom-in;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#lightbox-close');
  const lightboxImg = overlay.querySelector('#lightbox-img');

  /* ── Open ── */
  function openLightbox(trigger) {
    const img = trigger.querySelector('img')
      || trigger.previousElementSibling?.tagName === 'IMG' && trigger.previousElementSibling
      || trigger.nextElementSibling?.tagName === 'IMG' && trigger.nextElementSibling
      || trigger.closest(':has(img)')?.querySelector('img');

    if (!img) return;

    lastFocused = document.activeElement;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || 'Expanded image';

    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Trigger transition on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('is-visible');
        overlay.focus();
      });
    });
  }

  /* ── Close ── */
  function closeLightbox() {
    overlay.classList.remove('is-visible');

    overlay.addEventListener('transitionend', function handler() {
      overlay.classList.remove('is-active');
      lightboxImg.src = '';
      document.body.style.overflow = '';
      overlay.removeEventListener('transitionend', handler);
    });

    if (lastFocused) lastFocused.focus();
  }

  /* ── Trigger clicks ── */
  document.addEventListener('click', function (e) {
    const wrapper = e.target.closest('.expand_img_wrapper');
    if (wrapper) {
      e.preventDefault();
      openLightbox(wrapper);
      return;
    }

    // Click on backdrop (not image) closes
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  /* ── Close button ── */
  closeBtn.addEventListener('click', closeLightbox);

  /* ── Esc key ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
      closeLightbox();
    }
  });

  /* ── Focus trap ── */
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    // Only focusable element is the close button — keep focus on it
    e.preventDefault();
    closeBtn.focus();
  });

})();
