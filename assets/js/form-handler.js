// Form handling
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('.contact-form-container form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            const submitBtn = document.getElementById('contact-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');

            // Show loading state
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
        });
    }
});
