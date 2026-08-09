const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => {
    image.hidden = true;
  });
});

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      mobileNav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll(".reservation-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name") ? formData.get("name").trim() : "";
    const phone = formData.get("phone") ? formData.get("phone").trim() : "";
    const type = formData.get("type");
    const residence = formData.get("residence") || "미입력";
    const visitDate = formData.get("visit_date") || "미입력";
    const message = formData.get("message") || "미입력";
    const source = formData.get("source") || "미입력";
    const emailConfirm = formData.get("email_confirm") || "";

    // 1차 프론트엔드 검증
    const nameRegex = /^[a-zA-Z가-힣\s]{2,20}$/;
    if (!nameRegex.test(name)) {
      alert("올바른 이름을 입력해 주세요 (한글/영문 2~20자).");
      return;
    }

    const cleanPhone = phone.replace(/-/g, "");
    const phoneRegex = /^(01[016789]\d{7,8}|02\d{7,8}|0[3-6]\d\d{7,8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert("올바른 연락처 형식을 입력해 주세요 (예: 010-1234-5678).");
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "접수 중...";
    }

    try {
      const response = await fetch("/.netlify/functions/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          phone: phone,
          type: type,
          residence: residence,
          visit_date: visitDate,
          message: message,
          source: source,
          email_confirm: emailConfirm
        })
      });

      if (response.ok) {
        alert("상담 예약 신청이 정상적으로 접수되었습니다. 담당자가 곧 연락드리겠습니다.");
        form.reset();
      } else {
        let errorMessage = "접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주시거나 대표번호 1844-1372로 문의해 주세요.";
        try {
          const data = await response.json();
          if (data && data.error) {
            errorMessage = data.error;
          }
        } catch (e) {
          // JSON 파싱 실패 시 기본 에러 유지
        }
        alert(errorMessage);
      }
    } catch (error) {
      alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주시거나 대표번호 1844-1372로 문의해 주세요.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = "상담 신청하기 &rarr;";
      }
    }
  });
});

// Collapsible detailed guide toggle
const guideToggleBtn = document.querySelector("[data-guide-toggle]");
const guideContent = document.querySelector("[data-guide-content]");

if (guideToggleBtn && guideContent) {
  guideToggleBtn.addEventListener("click", () => {
    const isExpanded = guideContent.classList.toggle("is-expanded");
    guideToggleBtn.setAttribute("aria-expanded", String(isExpanded));
    guideToggleBtn.innerHTML = isExpanded 
      ? `가경 하트리움 더 센트럴 상세 가이드 닫기 ▲` 
      : `가경 하트리움 더 센트럴 상세 가이드 전체보기 ▼`;
  });
}
