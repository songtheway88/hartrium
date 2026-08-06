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
    const body = JSON.parse(event.body);
    const { text } = body;

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "전송할 메시지 내용(text)이 없습니다." })
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

    const chatIds = chatIdsString.split(",");
    
    // 여러 채팅방에 메시지 전송
    const sendPromises = chatIds.map((chatId) =>
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: text
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
