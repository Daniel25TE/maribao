fetch("https://ur3wos0qn7.execute-api.us-east-1.amazonaws.com/Prod/api/stats/visit", {
  method: "POST",
  credentials: "include"
}).catch(() => {});