/* eslint-disable no-undef */
const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;

  document.querySelector("body").insertAdjacentHTML("afterbegin", markup); // inside of the body and right at the begiinning

  window.setTimeout(hideAlert, 4000);
};

const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-settings");
const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "https://easy-vote.onrender.com/api/v1/users/updateMyPassword"
        : "https://easy-vote.onrender.com/api/v1/users/updateMe";
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully!`);
      window.setTimeout(() => {
        // eslint-disable-next-line no-restricted-globals
        location.assign("/me");
      }, 2500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
if (userDataForm) {
  userDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);

    document.querySelector(".btn--save-settings").textContent = "Saving...";

    form.append("photo", document.getElementById("photo").files[0]);
    await updateSettings(form, "data");
    document.querySelector(".btn--save-settings").textContent = "SAVE SETTINGS";
  });
}
if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password-confirm").value;

    await updateSettings(
      { passwordCurrent, password, confirmPassword },
      // eslint-disable-next-line prettier/prettier
      "password"
    );
    document.querySelector(".btn--save-password").textContent = "SAVE PASSWORD";

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}
