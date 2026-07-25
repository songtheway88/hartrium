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
    const interest = formData.get("interest");

    // 텔레그램 알림 메시지 구성
    const text = `🔔 [가경 하트리움 더 센트럴] 새로운 상담 예약 접수!\n\n` +
                 `• 성함: ${name}\n` +
                 `• 연락처: ${phone}\n` +
                 `• 관심 내용: ${interest}\n` +
                 `• 접수 일시: ${new Date().toLocaleString('ko-KR')}`;

    const botToken = "8891975056:AAGU0OBBikZXf0TsnnXb9Q7TC8MUFsCM-zA";
    const chatId = "8753795118";

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
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
        submitButton.textContent = "상담 예약하기";
      }
    }
  });
});
