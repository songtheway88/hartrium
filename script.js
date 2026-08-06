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

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "접수 중...";
    }

    const formData = new FormData(form);
    const name = formData.get("name");
    const phone = formData.get("phone");
    const type = formData.get("type");
    const residence = formData.get("residence") || "미입력";
    const visitDate = formData.get("visit_date") || "미입력";
    const message = formData.get("message") || "미입력";
    const source = formData.get("source") || "미입력";

    // 텔레그램 알림 메시지 구성
    const text = `🔔 [가경 하트리움 더 센트럴] 새로운 상담 예약 접수!\n\n` +
                 `• 이름: ${name}\n` +
                 `• 연락처: ${phone}\n` +
                 `• 관심 평형: ${type}\n` +
                 `• 현재 거주지: ${residence}\n` +
                 `• 방문희망 일시: ${visitDate}\n` +
                 `• 문의사항: ${message}\n` +
                 `• 알게 된 경로: ${source}\n\n` +
                 `• 접수 일시: ${new Date().toLocaleString('ko-KR')}`;

    try {
      const response = await fetch("/.netlify/functions/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text })
      });

      if (response.ok) {
        alert("상담 예약 신청이 정상적으로 접수되었습니다. 담당자가 곧 연락드리겠습니다.");
        form.reset();
      } else {
        throw new Error("전송 실패");
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
