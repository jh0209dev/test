(function () {
  const form = document.getElementById("inquiry-form");
  if (!form) return;

  const feedback = document.getElementById("form-feedback");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const interestSelect = document.getElementById("interest");
  const interestOtherWrap = document.querySelector(".other-interest");
  const interestOtherInput = document.getElementById("interest-other");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  const hero = document.querySelector(".hero");
  if (hero) {
    try {
      const introKey = "gym-hero-intro-seen-v1";
      if (!window.sessionStorage.getItem(introKey)) {
        window.sessionStorage.setItem(introKey, "1");
        hero.classList.add("has-first-visit");
      }
    } catch (error) {
      // The page stays fully visible if session storage is unavailable.
    }
  }

  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    let characterIndex = 0;
    const textNodes = [];
    const walker = document.createTreeWalker(heroTitle, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) textNodes.push(textNode);

    textNodes.forEach(function (node) {
      const fragment = document.createDocumentFragment();
      Array.from(node.nodeValue).forEach(function (character) {
        const letter = document.createElement("span");
        letter.className = "typing-char";
        letter.setAttribute("aria-hidden", "true");
        letter.style.setProperty("--typing-delay", (characterIndex * 190) + "ms");
        letter.textContent = character;
        fragment.appendChild(letter);
        characterIndex += 1;
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  const aboutIntro = document.querySelector("#about .intro-grid");
  if (aboutIntro && "IntersectionObserver" in window) {
    aboutIntro.classList.add("reveal-on-scroll");
    const introObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        aboutIntro.classList.add("is-visible");
        introObserver.disconnect();
      });
    }, { threshold: 0.18 });
    introObserver.observe(aboutIntro);
  } else if (aboutIntro) {
    aboutIntro.classList.add("is-visible");
  }

  function showFieldError(id, message) {
    const target = document.getElementById(id + "-error");
    if (target) target.textContent = message;
    const input = document.getElementById(id);
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearErrors() {
    showFieldError("name", "");
    showFieldError("phone", "");
    feedback.textContent = "";
    feedback.classList.remove("error");
  }

  function showFeedback(message, isError) {
    feedback.textContent = message;
    feedback.classList.toggle("error", Boolean(isError));
  }

  interestSelect.addEventListener("change", function () {
    const isOther = interestSelect.value === "기타";
    interestOtherWrap.hidden = !isOther;
    if (!isOther) interestOtherInput.value = "";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    let valid = true;
    if (!name) {
      showFieldError("name", "이름을 입력해 주세요.");
      valid = false;
    }
    if (!phone) {
      showFieldError("phone", "연락처를 입력해 주세요.");
      valid = false;
    }
    if (!valid) {
      showFeedback("필수 항목을 확인해 주세요.", true);
      (name ? phoneInput : nameInput).focus();
      return;
    }

    const interest = interestSelect.value === "기타"
      ? interestOtherInput.value.trim() || "기타"
      : interestSelect.value;
    const inquiry = {
      id: window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(16).slice(2),
      name,
      phone,
      interest,
      message: document.getElementById("message").value.trim(),
      createdAt: new Date().toISOString(),
      status: "new",
      memo: ""
    };

    const button = form.querySelector(".form-submit");
    button.disabled = true;
    try {
      const inquiries = window.GymInquiries.readAll();
      window.GymInquiries.writeAll([inquiry, ...inquiries]);
      form.reset();
      interestOtherWrap.hidden = true;
      showFeedback("문의가 이 브라우저에 저장됐어요. 관리자 화면에서 확인할 수 있습니다.", false);
    } catch (error) {
      showFeedback(error.message || "문의 저장에 실패했습니다. 다시 시도해 주세요.", true);
    } finally {
      button.disabled = false;
    }
  });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      menuToggle.setAttribute("aria-label", expanded ? "메뉴 열기" : "메뉴 닫기");
      mobileMenu.hidden = expanded;
    });
    mobileMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        mobileMenu.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "메뉴 열기");
      }
    });
  }
})();
