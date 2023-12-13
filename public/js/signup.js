/* eslint-disable */
import axios from "axios";
let role = "";

function displayRadioValue() {
  const ele = document.getElementsByName("role");
  for (i = 0; i < ele.length; i++) {
    if (ele[i].checked) {
      role = ele[i].value;
    }
  }
}

document.querySelector(".signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const secretForAdmin = document.getElementById("textField").value;

  //if (secretForAdmin == null || secretForAdmin == "") secretForAdmin = "";

  signup(name, email, password, confirmPassword, secretForAdmin, role);
});

const signup = async (
  name,
  email,
  password,
  confirmPassword,
  secretForAdmin,
  role
) => {
  try {
    const result = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        secretForAdmin: secretForAdmin,
        role: role,
      },
    });

    if (result.data.status === "success") {
      showAlert("success", "Signup successful!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
    return {
      tokenInfo: data,
      timestamp: new Date().getTime(),
    };
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
//     const request = await fetch("http://127.0.0.1:3000/api/v1/users/signup", {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name,
//         email,
//         password,
//         confirmPassword,
//         secretForAdmin,
//         role,
//       }),
//     });
//     const response = await request.json();
//     if (response.status === "success") {
//       showAlert("success", "Signup successful!");
//       window.setTimeout(() => {
//         location.assign("/");
//       }, 1500);
//     }
//   } catch (err) {
//     console.log(err);
//     showAlert("error", err.response.data.message);
//   }
// };

function toggleTextField(userType) {
  var textFieldContainer = document.getElementById("textFieldContainer");
  var textField = document.getElementById("textField");
  if (userType === "admin") {
    textFieldContainer.style.display = "block"; // Show the text field
  } else if (userType === "user") {
    textFieldContainer.style.display = "none"; // Hide the text field
    textField.value = ""; // Clear the text field
  }
}

// if (document.getElementById('r1').checked) {
//   rate_value = document.getElementById('r1').value;
// }

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
