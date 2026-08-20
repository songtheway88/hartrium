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

// ==========================================================================
// 모바일 사은품 이벤트 팝업 관련 스크립트
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const backdrop = document.getElementById("roulette-modal-backdrop");
  const closeBtn = document.getElementById("roulette-close-btn");
  const closeFooterBtn = document.getElementById("roulette-close-footer-btn");
  const hideTodayBtn = document.getElementById("roulette-hide-today-btn");
  const winCtaBtn = document.getElementById("roulette-win-cta-btn");

  if (!backdrop) return;

  // 모바일 접속 여부 판단
  function isMobileDevice() {
    return window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  }

  // 모달 닫기
  function closeModal() {
    backdrop.classList.remove("is-visible");
  }

  // 초기 실행 로직
  function initGiftPopup() {
    // 오늘 하루 보지 않기 여부 확인
    const hideUntil = localStorage.getItem("hideRouletteEventUntil");
    const isBlocked = hideUntil && Date.now() < parseInt(hideUntil, 10);

    if (isMobileDevice() && !isBlocked) {
      backdrop.classList.add("is-visible");
    }
  }

  // 관심고객 등록 가기 버튼 클릭 시
  if (winCtaBtn) {
    winCtaBtn.addEventListener("click", () => {
      closeModal();
      const visitSection = document.getElementById("visit");
      if (visitSection) {
        visitSection.scrollIntoView({ behavior: "smooth" });
        // 스무스 스크롤이 끝나는 타이밍에 맞춰 입력 포커싱 처리
        setTimeout(() => {
          const nameInput = visitSection.querySelector('input[name="name"]');
          if (nameInput) {
            nameInput.focus();
          }
        }, 800);
      }
    });
  }

  // 일반 닫기 버튼 이벤트 등록
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener("click", closeModal);

  // 오늘 하루 열지 않기 등록
  if (hideTodayBtn) {
    hideTodayBtn.addEventListener("click", () => {
      const oneDayMs = 24 * 60 * 60 * 1000;
      localStorage.setItem("hideRouletteEventUntil", (Date.now() + oneDayMs).toString());
      closeModal();
    });
  }

  // 초기화 함수 실행
  initGiftPopup();
});

