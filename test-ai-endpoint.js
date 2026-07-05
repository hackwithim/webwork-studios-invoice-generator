fetch("http://localhost:3000/api/ai/agent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "deepseek-ai/deepseek-v4-flash",
    messages: [
      { role: "user", content: "hey send email to kashinathgaikwad305@gmail.com regarding the website development of their company" }
    ]
  })
}).then(res => res.json()).then(console.log).catch(console.error);
