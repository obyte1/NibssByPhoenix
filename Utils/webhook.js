const sendInwardTransactionWebhook = async (url, transaction) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Event": "INWARD_TRANSACTION",
      },
      body: JSON.stringify({
        event: "INWARD_TRANSACTION",
        data: transaction,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`Webhook delivery failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Webhook delivery failed:", error.message);
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { sendInwardTransactionWebhook };