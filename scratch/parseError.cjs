const fs = require('fs');
const content = fs.readFileSync('C:/Users/HP/.gemini/antigravity/brain/1faed417-66a5-47c2-be6d-3a3ff012a8e2/.system_generated/tasks/task-4977.log', 'utf8');
const match = content.match(/<div class="exception-message">(.*?)<\/div>/s);
if (match) {
  console.log("EXCEPTION:", match[1].trim());
} else {
  // Let's find "message": "..." inside window.data
  const m2 = content.match(/"message":\s*"([^"]+)"/);
  if (m2) {
    console.log("MESSAGE:", m2[1]);
  } else {
    console.log("No exception message found.");
  }
}
