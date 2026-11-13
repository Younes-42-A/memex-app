import { useEffect } from "react";

const LoginPage = () => {
  useEffect(() => {
    const authForm = document.querySelector("#auth-form") as HTMLFormElement | null;
    const loginTitle = document.querySelector("#login-title") as HTMLElement | null;
    const authSubtitle = document.querySelector("#auth-subtitle") as HTMLElement | null;
    const submitButton = document.querySelector(".submit-button") as HTMLButtonElement | null;
    const authStatus = document.querySelector("#auth-status") as HTMLElement | null;
    const confirmPassword = document.querySelector("#confirm-password") as HTMLInputElement | null;
    const signupPassword = document.querySelector("#new-password") as HTMLInputElement | null;

    if (!authForm || !loginTitle || !authSubtitle || !submitButton || !authStatus || !confirmPassword || !signupPassword) {
      return;
    }

    const validatePasswordMatch = () => {
      confirmPassword.setCustomValidity(
        confirmPassword.value && confirmPassword.value !== signupPassword.value ? "Passwords do not match." : ""
      );
    };

    const applyMode = (button: HTMLElement) => {
      const isSignUp = button.dataset.mode === "signup";

      document.querySelectorAll<HTMLElement>(".auth-mode-button").forEach((modeButton) => {
        const isActive = modeButton === button;
        modeButton.classList.toggle("is-active", isActive);
        modeButton.setAttribute("aria-pressed", String(isActive));
      });

      document.querySelectorAll<HTMLElement>(".signup-field").forEach((field) => {
        field.hidden = !isSignUp;
        field.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select").forEach((control) => {
          control.disabled = !isSignUp;
        });
      });

      document.querySelectorAll<HTMLElement>(".login-field").forEach((field) => {
        field.hidden = isSignUp;
        field.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select").forEach((control) => {
          control.disabled = isSignUp;
        });
      });

      loginTitle.textContent = isSignUp ? "Create your account" : "Welcome back";
      authSubtitle.textContent = isSignUp
        ? "Start building your personal knowledge space."
        : "Log in to continue to your personal knowledge space.";
      submitButton.textContent = isSignUp ? "CREATE ACCOUNT" : "LOG IN";
      authStatus.hidden = true;
      authStatus.textContent = "";
    };

    document.querySelectorAll<HTMLElement>(".auth-mode-button").forEach((button) => {
      button.addEventListener("click", () => applyMode(button));
    });

    signupPassword.addEventListener("input", validatePasswordMatch);
    confirmPassword.addEventListener("input", validatePasswordMatch);

    authForm.addEventListener("submit", (event) => {
      event.preventDefault();
      validatePasswordMatch();
      authStatus.textContent = "Authentication is not connected yet. Your details have not been sent.";
      authStatus.hidden = false;
    });
  }, []);

  return (
    <main>
      <div className="container">
        <section className="brand-block" aria-labelledby="page-title">
          <div className="eyebrow">Memex</div>
          <h1 id="page-title">
            Welcome to <span className="highlight">Memex</span>
          </h1>
          <p className="intro">
            Build your own personal knowledge space and keep your notes, ideas, and important information organized in one place.
          </p>
          <div className="note">Can you fill in the blanks?</div>
        </section>

        <section className="form-card" aria-labelledby="login-title">
          <div className="auth-heading">
            <div className="auth-mode-switch" role="group" aria-label="Choose an account action">
              <button type="button" className="auth-mode-button is-active" data-mode="login" aria-pressed="true">
                Log in
              </button>
              <button type="button" className="auth-mode-button" data-mode="signup" aria-pressed="false">
                Create account
              </button>
            </div>
            <h2 id="login-title">Welcome back</h2>
            <p className="auth-subtitle" id="auth-subtitle">
              Log in to continue to your personal knowledge space.
            </p>
          </div>

          <form method="post" id="auth-form">
            <div className="signup-field" hidden>
              <label htmlFor="full-name">Full name</label>
              <input
                type="text"
                id="full-name"
                name="fullName"
                placeholder="How should we call you?"
                autoComplete="name"
                required
                disabled
              />
            </div>

            <div className="signup-field" hidden>
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                disabled
              />
            </div>

            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="signup-field" hidden>
              <label htmlFor="new-password">Create a password</label>
              <input
                type="password"
                id="new-password"
                name="newPassword"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                disabled
              />
            </div>

            <div className="signup-field" hidden>
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                placeholder="Enter your password again"
                autoComplete="new-password"
                required
                disabled
              />
            </div>

            <div className="row login-field">
              <label>
                <input type="checkbox" name="remember" /> Remember me
              </label>
              <button type="button" className="forgot-link">
                Forgot password?
              </button>
            </div>

            <p className="demo-notice">Demo only — authentication is not connected yet.</p>
            <p className="auth-status" id="auth-status" role="status" aria-live="polite" hidden></p>
            <button type="submit" className="submit-button">
              LOG IN
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;