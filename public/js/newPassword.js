/*eslint-disable*/

const newPassword = async (password, confirmPassword) => {
  try {
    const result = await axios({
      method: "PATCH",
      url: "https://easy-vote.onrender.com/api/v1/users/resPassword/:token",
      data: {
        password,
        confirmPassword,
      },
    });

    if (result.data.status === "success") {
      showAlert("success", "Password changed successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const password = document.getElementById("newPass").value;
    const confirmPassword = document.getElementById("passConfirm").value;
    newPassword(password, confirmPassword);
  });
});
/** ALERTS */

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

function validate() {
  var username = document.getElementById("newPass").value;
  var password = document.getElementById("passConfirm").value;
  var userLabel = document.getElementById("userLabel");
  var passLabel = document.getElementById("passLabel");

  if (username === "" || username === null) {
    intensify(userLabel);
    return false;
  }

  if (password === "" || password === null) {
    intensify(passLabel);
    return false;
  }

  return true; // Validation successful
}

function intensify(intense) {
  intense.classList.add("animated", "shakeit");
  setTimeout(function () {
    intense.classList.remove("animated", "shakeit");
  }, 1000);
}

function clicked() {
  var buttons = document.querySelectorAll("button");
  buttons.forEach(function (button) {
    button.classList.add("clicked");
    setTimeout(function () {
      button.classList.remove("clicked");
    }, 200);
  });
}

document.getElementById("submit").addEventListener("click", function (event) {
  clicked();
  if (!validate()) {
    event.preventDefault(); // Prevent form submission if validation fails
  }
});
