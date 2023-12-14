/*eslint-disable*/

// const login = async (email, password) => {
//   try {
//     const result = await axios({
//       method: "POST",
//       url: "/api/v1/users/login",
//       data: {
//         email: email,
//         password: password,
//       },
//     });

//     if (result.data.status === "success") {
//       showAlert("success", "Logged in successfully!");
//       window.setTimeout(() => {
//         location.assign("/");
//       }, 1500);
//     }
//   } catch (err) {
//     console.log(err);
//     showAlert("error", err.response.data.message);
//   }
// };

// document.addEventListener("DOMContentLoaded", function () {
//   var form = document.getElementById("form");
//   form.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const email = document.getElementById("username").value;
//     const password = document.getElementById("pass").value;
//     login(email, password);
//   });
// });
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
  var username = document.getElementById("username").value;
  var password = document.getElementById("pass").value;
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

// document.getElementById("submit").addEventListener("click", function (event) {
//   clicked();
//   if (!validate()) {
//     event.preventDefault(); // Prevent form submission if validation fails
//   }
// });

// document
//   .getElementById("forgot-link")
//   .addEventListener("click", function (event) {
//     event.preventDefault();
//     const email = document.getElementById("username").value;

//     forgotPass(email);
//   });
// const forgotPass = async (email) => {
//   try {
//     const result = await axios({
//       method: "POST",
//       url: "/api/v1/users/forgotPassword",
//       data: {
//         email: email,
//       },
//     });

//     if (result.data.status === "success") {
//       showAlert("success", "Email sent successfully!!");
//       window.setTimeout(() => {
//         location.assign("/forgotPassword");
//       }, 3000);
//     }
//   } catch (err) {
//     console.log(err);
//     showAlert("error", err.response.data.message);
//   }
// };
