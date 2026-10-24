// Handles the standalone login and signup form interactions.

$(document).ready(function() {
    $('#country').select2({
        placeholder: "Search country...",
        allowClear: true
    });
});

const authForm = document.querySelector("#auth-form");
const loginTitle = document.querySelector("#login-title");
const authSubtitle = document.querySelector("#auth-subtitle");
const submitButton = document.querySelector(".submit-button");
const authStatus = document.querySelector("#auth-status");
const confirmPassword = document.querySelector("#confirm-password");
const signupPassword = document.querySelector("#new-password");

document.querySelectorAll(".auth-mode-button").forEach((button) => {
    button.addEventListener("click", () => {
        const isSignUp = button.dataset.mode === "signup";

        document.querySelectorAll(".auth-mode-button").forEach((modeButton) => {
            const isActive = modeButton === button;
            modeButton.classList.toggle("is-active", isActive);
            modeButton.setAttribute("aria-pressed", String(isActive));
        });

        document.querySelectorAll(".signup-field").forEach((field) => {
            field.hidden = !isSignUp;
            field.querySelectorAll("input, select").forEach((control) => {
                control.disabled = !isSignUp;
            });
        });

        document.querySelectorAll(".login-field").forEach((field) => {
            field.hidden = isSignUp;
            field.querySelectorAll("input, select").forEach((control) => {
                control.disabled = isSignUp;
            });
        });

        if (window.jQuery && $("#country").data("select2")) {
            $("#country").trigger("change.select2");
        }

        loginTitle.textContent = isSignUp ? "Create your account" : "Welcome back";
        authSubtitle.textContent = isSignUp
            ? "Start building your personal knowledge space."
            : "Log in to continue to your personal knowledge space.";
        submitButton.textContent = isSignUp ? "CREATE ACCOUNT" : "LOG IN";
        authStatus.hidden = true;
        authStatus.textContent = "";
    });
});

const validatePasswordMatch = () => {
    confirmPassword.setCustomValidity(
        confirmPassword.value && confirmPassword.value !== signupPassword.value
            ? "Passwords do not match."
            : ""
    );
};

signupPassword.addEventListener("input", validatePasswordMatch);
confirmPassword.addEventListener("input", validatePasswordMatch);

authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    validatePasswordMatch();
    authStatus.textContent = "Authentication is not connected yet. Your details have not been sent.";
    authStatus.hidden = false;
});
