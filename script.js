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
// 모바일 룰렛 이벤트 관련 스크립트
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const backdrop = document.getElementById("roulette-modal-backdrop");
  const canvas = document.getElementById("roulette-canvas");
  const spinBtn = document.getElementById("roulette-spin-btn");
  const closeBtn = document.getElementById("roulette-close-btn");
  const closeFooterBtn = document.getElementById("roulette-close-footer-btn");
  const hideTodayBtn = document.getElementById("roulette-hide-today-btn");
  const winOverlay = document.getElementById("roulette-win-overlay");
  const winCtaBtn = document.getElementById("roulette-win-cta-btn");

  if (!backdrop || !canvas) return;

  // 모바일 접속 여부 판단
  function isMobileDevice() {
    return window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  }

  // 룰렛 그리기 함수
  function drawRoulette() {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2 - 10;

    const numSectors = 4;
    // 시안에 맞춰 프리미엄 색상 팔레트 지정
    const colors = ["#d03838", "#4b779a", "#1f5945", "#10223f"];
    const angleStep = (2 * Math.PI) / numSectors;

    ctx.clearRect(0, 0, width, height);

    // 1. 외곽 골드 테두리 베이스 원
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#b88a3d";
    ctx.stroke();

    for (let i = 0; i < numSectors; i++) {
      const startAngle = i * angleStep;
      const endAngle = startAngle + angleStep;

      // 2. 부채꼴 섹션 그리기
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius - 3, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();

      // 3. 골드 구분선 그리기
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (radius - 3) * Math.cos(startAngle), cy + (radius - 3) * Math.sin(startAngle));
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#dfb36c";
      ctx.stroke();

      // 4. 물음표(?) 텍스트 그리기
      ctx.save();
      ctx.translate(cx, cy);
      const textAngle = startAngle + angleStep / 2;
      ctx.rotate(textAngle);
      ctx.translate(radius * 0.55, 0);
      ctx.rotate(Math.PI / 2); // 텍스트 방향을 회전 반경에 수직으로 세움

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px NanumSquareNeo, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", 0, 0);
      ctx.restore();
    }
  }

  // 모달 닫기
  function closeModal() {
    backdrop.classList.remove("is-visible");
  }

  // 초기 실행 로직
  function initRoulette() {
    // 오늘 하루 보지 않기 여부 확인
    const hideUntil = localStorage.getItem("hideRouletteEventUntil");
    const isBlocked = hideUntil && Date.now() < parseInt(hideUntil, 10);

    if (isMobileDevice() && !isBlocked) {
      backdrop.classList.add("is-visible");
      drawRoulette();
    }
  }

  // 룰렛 스핀 동작
  let isSpinning = false;
  if (spinBtn) {
    spinBtn.addEventListener("click", () => {
      if (isSpinning) return;
      isSpinning = true;
      spinBtn.disabled = true;

      // 최소 6바퀴 이상 충분히 회전하도록 설정 (회전 각도: 2160도 ~ 2520도 임의 지정)
      const randomDegree = 6 * 360 + Math.floor(Math.random() * 360);
      canvas.style.transform = `rotate(${randomDegree}deg)`;
    });
  }

  // 룰렛 회전 애니메이션이 완료되었을 때 당첨 오버레이 띄우기
  canvas.addEventListener("transitionend", () => {
    if (winOverlay) {
      winOverlay.style.display = "flex";
    }
  });

  // 당첨 팝업의 관심고객 등록 가기 버튼 클릭 시
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

  // 당첨 팝업의 홈페이지 보러가기 버튼 클릭 시
  const winHomeBtn = document.getElementById("roulette-win-home-btn");
  if (winHomeBtn) {
    winHomeBtn.addEventListener("click", () => {
      closeModal();
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
  initRoulette();
});

