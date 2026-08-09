exports.handler = async function(event, context) {
  // CORS 설정 (로컬 테스트 및 다양한 도메인 대응)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { name, phone, type, residence, visit_date, message, source, email_confirm } = body;

    // 1. 허니팟 검증 (스팸봇 자동 입력 필드)
    // 봇이 이 필드를 채웠을 경우 정상 접수된 것처럼 응답을 보내고 실제 전송은 무시함
    if (email_confirm) {
      console.log("Honeypot filled by spambot, ignoring message transmission.");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "정상 접수되었습니다." })
      };
    }

    // 2. 필수 입력값 존재 여부 검증
    if (!name || !phone || !type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "필수 입력 항목(이름, 연락처, 관심 평형)이 누락되었습니다." })
      };
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/-/g, "").replace(/\s/g, "");

    // 3. 서버사이드 정밀 유효성 검증
    // 이름: 한글, 영문, 공백 포함 2~20자 허용
    const nameRegex = /^[a-zA-Z가-힣\s]{2,20}$/;
    if (!nameRegex.test(cleanName)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "올바른 이름을 입력해 주세요 (한글/영문 2~20자)." })
      };
    }

    // 연락처: 한국 일반전화 및 휴대폰 번호 규격 검증 (9~11자리 숫자)
    const phoneRegex = /^(01[016789]\d{7,8}|02\d{7,8}|0[3-6]\d\d{7,8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "올바른 연락처 형식을 입력해 주세요 (예: 010-1234-5678)." })
      };
    }

    // 4. 스팸성 텍스트 필터링 (키릴 문자(러시아어 스팸봇) 및 URL 패턴 차단)
    const spamCheckTarget = `${cleanName} ${residence} ${visit_date} ${message} ${source}`;
    const hasCyrillic = /[\u0400-\u04FF]/.test(spamCheckTarget);
    const hasUrl = /https?:\/\/[^\s]+|www\.[^\s]+/i.test(spamCheckTarget);

    if (hasCyrillic || hasUrl) {
      console.log(`Spam content detected (Cyrillic: ${hasCyrillic}, URL: ${hasUrl}), dropping message.`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "정상 접수되었습니다." })
      };
    }

    // Netlify 환경 변수에서 안전하게 조회
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIdsString = process.env.TELEGRAM_CHAT_IDS;

    if (!botToken || !chatIdsString) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Netlify 서버 환경 변수가 구성되지 않았습니다." })
      };
    }

    // 5. 서버사이드에서 안전하게 텔레그램 메시지 빌드
    const formattedText = `🔔 [가경 하트리움 더 센트럴] 새로운 상담 예약 접수!\n\n` +
                          `• 이름: ${cleanName}\n` +
                          `• 연락처: ${phone}\n` +
                          `• 관심 평형: ${type}\n` +
                          `• 현재 거주지: ${residence}\n` +
                          `• 방문희망 일시: ${visit_date}\n` +
                          `• 문의사항: ${message}\n` +
                          `• 알게 된 경로: ${source}\n\n` +
                          `• 접수 일시: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;

    const chatIds = chatIdsString.split(",");
    
    // 여러 채팅방에 메시지 전송
    const sendPromises = chatIds.map((chatId) =>
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: formattedText
        })
      })
    );

    const responses = await Promise.all(sendPromises);
    const isAnySuccess = responses.some((res) => res.ok);

    if (isAnySuccess) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "텔레그램 API 전송에 실패했습니다." })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
