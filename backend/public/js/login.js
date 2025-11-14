window.addEventListener('load', () => {
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("contrasena");
    const iconEye = document.getElementById("iconEye");
    const iconEyeOff = document.getElementById("iconEyeOff");

    if(!togglePassword || !passwordInput || !iconEye || !iconEyeOff) return;

    togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        iconEye.classList.toggle("hidden", !isPassword);
        iconEyeOff.classList.toggle("hidden", isPassword);
    });
});
