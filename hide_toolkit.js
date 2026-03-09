document.addEventListener("DOMContentLoaded", function() {
  window.$memberstackDom.getCurrentMember().then(({ data: member }) => {
    const els = document.querySelectorAll('[data-toolkit-show="true"]');
    if (!els.length) return;

    els.forEach(el => el.style.display = "none");

    if (!member || !member.customFields) return;

    const role = member.customFields.igniterole;
    if (role === "reward_manager" || role === "super_admin") {
      els.forEach(el => el.style.display = "block");
    }
  });
});
