document.addEventListener("DOMContentLoaded", function() {
  window.$memberstackDom.getCurrentMember().then(({ data: member }) => {
    var el = document.getElementById("show-for-reward-manager");
    if (!el) return;

    // Hide by default
    el.style.display = "none";

    // If no member or no custom fields, keep hidden
    if (!member || !member.customFields) return;

    // Use the igniterole custom field (confirmed from your console log)
    var role = member.customFields.igniterole;

    // Only show for super_admin
    if (role === "reward_manager" || role === "super_admin") {
      el.style.display = "block";
    }
  });
});
