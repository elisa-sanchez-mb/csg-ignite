document.addEventListener("DOMContentLoaded", function() {
  window.$memberstackDom.getCurrentMember().then(({ data: member }) => {
    var el = document.getElementById("show-for-super-admin");
    if (!el) return;

    // Hide by default for safety
    el.style.display = "none";

    // If there is no member or no custom fields, keep it hidden
    if (!member || !member.customFields) return;

    // Use your exact custom field ID
    var role = member.customFields["igniterole"];

    // Only show if value equals "super_admin"
    if (role === "super_admin") {
      el.style.display = "block";
    }
  });
});
