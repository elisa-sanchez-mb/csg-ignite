document.addEventListener("DOMContentLoaded", function () {

  let lastFocusedElement = null;
  let activeModal = null;

  const STORAGE_KEY = "mb_modal_seen";

  /* ─────────────────────────────────────────
     ONE-TIME MODAL ON LOAD
  ───────────────────────────────────────── */
  const hasSeenModal = localStorage.getItem(STORAGE_KEY);

  if (!hasSeenModal) {
    const onloadModal = document.querySelector('[mb-modal="element"][mb-modal-onload="true"]');
    if (onloadModal) {
      openModal(onloadModal);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }

  /* ─────────────────────────────────────────
     OPEN BUTTONS
  ───────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    const openBtn = e.target.closest('[mb-modal="open"]');
    if (openBtn) {
      e.preventDefault();
      const modalId = openBtn.getAttribute("mb-modal-element");
      const modal = document.querySelector(
        `[mb-modal="element"][mb-modal-element="${modalId}"]`
      );
      if (modal) openModal(modal);
    }

    const closeBtn = e.target.closest('[mb-modal="close"]');
    if (closeBtn) {
      const modal = closeBtn.closest('[mb-modal="element"]');
      if (modal) closeModal(modal);
    }
  });

  /* ─────────────────────────────────────────
     ESC KEY (ONLY ONE LISTENER)
  ───────────────────────────────────────── */
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeModal) {
      closeModal(activeModal);
    }
  });

  /* ─────────────────────────────────────────
     OPEN MODAL
  ───────────────────────────────────────── */
  function openModal(modal) {
    activeModal = modal;
    lastFocusedElement = document.activeElement;

    modal.classList.add("is-active");
    document.body.classList.add("no-scroll");

    if (typeof lenis !== "undefined") lenis.stop();

    trapFocus(modal);

    const focusable = getFocusable(modal);
    if (focusable.length) focusable[0].focus();
  }

  /* ─────────────────────────────────────────
     CLOSE MODAL
  ───────────────────────────────────────── */
  function closeModal(modal) {
    modal.classList.remove("is-active");
    document.body.classList.remove("no-scroll");

    if (typeof lenis !== "undefined") lenis.start();

    releaseFocusTrap(modal);

    if (lastFocusedElement) lastFocusedElement.focus();

    activeModal = null;
  }

  /* ─────────────────────────────────────────
     FOCUS TRAP
  ───────────────────────────────────────── */
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
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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
