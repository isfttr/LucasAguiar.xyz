!function () {
    window.createSocialButton = function (containerId, text, link, color = "#000000", fontColor = "#FFFFFF") {
        // Add styles if not already added
        if (!document.getElementById('social-buttons-style')) {
            const style = document.createElement('style');
            style.id = 'social-buttons-style';
            style.textContent = `
                .social-btn {
                    min-width: 210px;
                    color: var(--font-color);
                    background-color: var(--bg-color) !important;
                    height: 60px;
                    border-radius: 12px;
                    font-size: 24px;
                    font-weight: Bold;
                    border: none;
                    padding: 0px 24px;
                    line-height: 27px;
                    text-decoration: none !important;
                    display: inline-flex !important;
                    align-items: center;
                    font-family: 'Inter', sans-serif !important;
                    -webkit-box-sizing: border-box !important;
                    box-sizing: border-box !important;
                }

                .social-btn:hover, .social-btn:active, .social-btn:focus {
                    text-decoration: none !important;
                    cursor: pointer;
                    opacity: 0.85;
                }

                .social-btn-text {
                    margin-left: 8px;
                    display: inline-block;
                    line-height: 0;
                    width: 100%;
                    flex-shrink: 0;
                }
            `;
            document.head.appendChild(style);
        }

        // Create button container
        const container = document.getElementById(containerId);
        if (!container) return;

        // Create button
        const buttonHtml = `
            <div class="social-btn-container">
                <a class="social-btn" target="_blank" href="${link}" style="--bg-color: ${color}; --font-color: ${fontColor}">
                    <span class="social-btn-text">${text}</span>
                </a>
            </div>
        `;
        container.innerHTML = buttonHtml;
    }

    // Initialize buttons when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        const githubContainer = document.getElementById('github-button');
        const linkedinContainer = document.getElementById('linkedin-button');
        const threadsContainer = document.getElementById('threads-button');

        if (githubContainer) {
            createSocialButton('github-button', 'GitHub', 'https://github.com/isfttr', '#24292e', '#FFFFFF');
        }

        if (linkedinContainer) {
            createSocialButton('linkedin-button', 'LinkedIn', 'https://linkedin.com/in/lucas-fernandes-aguiar', '#0077b5', '#FFFFFF');
        }

        if (threadsContainer) {
            createSocialButton('threads-button', 'Threads', 'https://www.threads.net/@lucas.chem', '#000000', '#FFFFFF');
        }
        const lattesContainer = document.getElementById('lattes-button');
        if (lattesContainer) {
            createSocialButton('lattes-button', 'Lattes CV', 'http://lattes.cnpq.br/5606074364581805', '#4CAF50', '#FFFFFF');
        }
    });
}();